import { json, Request, Response, Router } from 'express';
import {
  Article,
  ClosedArticle,
  getArticlesCount,
  getScoredArticleList,
  OpenArticle,
  Comment,
} from './article.entity.js';
import {
  CreateArticleResponseData,
  ArticleInfo,
  listArticlesRequestSchema,
  ListArticlesResponse,
  updateArticleTitleRequestSchema,
  createArticleRequestSchema,
  updateArticleVisibilityRequestSchema,
  ListCommentsResponse,
  createCommentRequestSchema,
} from '@kotprog/common';
import { ObjectId } from 'mongodb';
import { User } from '../users/user.entity.js';
import { Label } from '../labels/label.entity.js';
import { createAuthMiddleware } from '../users/auth.middleware.js';
import { PermissionLevel } from '@kotprog/common';
import { PermissionError } from '../errors/permission-error.js';
import { NotFoundError } from '../errors/not-found-error.js';
import { text } from 'express';
import { HttpError } from '../errors/http-error.js';
import lodash from 'lodash';
import { UnauthenticatedError } from '../errors/unauthenticated-error.js';
import moment from 'moment';
const { remove } = lodash;

export type ScoredArticle = Omit<Article, 'labels' | 'author'> & {
  labels: Label[];
  author: User;
  score: number;
};

async function createArticle(req: Request, res: Response): Promise<void> {
  const { title, closed } = await createArticleRequestSchema.validate(req.body);

  const author = req.user!._id;

  let id: string;

  if (closed) {
    const article = await ClosedArticle.create({
      author,
      title,
    });
    id = article._id.toHexString();
  } else {
    const article = await OpenArticle.create({
      author,
      title,
    });
    id = article._id.toHexString();
  }

  const response: CreateArticleResponseData = {
    id,
  };

  res.set({ Location: `/api/article/${id}` });

  res.status(201);
  res.send(response);
}

async function getArticleById(req: Request, res: Response): Promise<void> {
  const id: string = req.params['id'];
  const article = await Article.findById(new ObjectId(id))
    .populate<{ author: User; labels: Label[] }>('author labels')
    .lean()
    .then();

  const user = req.user;

  if (!article) {
    throw new NotFoundError(id, 'Article');
  }

  if (
    !article.visible &&
    user &&
    user.permissionLevel < PermissionLevel.WRITER
  ) {
    throw new NotFoundError(id, 'Article');
  }

  const response: ArticleInfo = {
    id: article._id.toHexString(),
    title: article.title,
    author: {
      id: article.author._id,
      name: article.author.name ?? '',
    },
    labels: article.labels.map((label) => ({
      id: label._id.toHexString(),
      backgroundColor: label.backgroundColor,
      name: label.name,
      textColor: label.textColor,
    })),
    type: article.type as 'open' | 'closed',
    visible: article.visible,
    mainImage: article.mainImage || undefined,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };

  res.status(200);
  res.send(response);
}

async function getArticleContentById(
  req: Request,
  res: Response,
): Promise<void> {
  const id: string = req.params['id'];
  const type: string = String(req.query['only'] ?? 'all');

  if (type === 'closed' && !req.user) {
    throw new UnauthenticatedError();
  }

  const article = await Article.findById(new ObjectId(id))
    .select('content openContent closedContent type author')
    .then();

  if (!article) {
    throw new NotFoundError(id, 'Article');
  }

  if (article.author !== req.user?.id) {
    let views = article.views || 0;
    views++;
    await article.updateOne({ views }, { timestamps: false });
  }

  let content = article['content'];

  if (article.type === 'closed') {
    if (type === 'all') {
      content = article['openContent'];
      if (req.user) {
        content += article['closedContent'];
      }
    }
    if (type === 'closed' && req.user) {
      content = article['closedContent'];
    }
    if (type === 'open') {
      content = article['openContent'];
    }
  }

  res.setHeader('Content-Type', 'text/markdown');

  res.status(200);
  res.send(content);
}

async function getArticles(req: Request, res: Response): Promise<void> {
  const { page, length, labels, author, randomization } =
    await listArticlesRequestSchema.validate(req.query);

  const userPermissionLevel = req.user?.permissionLevel ?? PermissionLevel.USER;

  const articles = await getScoredArticleList({
    userPermissionLevel,
    author: author || undefined,
    start: page * length,
    limit: length,
    labels,
    randomModifier: randomization,
  });

  const count = await getArticlesCount({
    labels,
    author: author || undefined,
    userPermissionLevel,
  });

  const response: ListArticlesResponse = {
    articles: articles.map((article) => ({
      id: article._id.toHexString(),
      author: {
        id: article.author._id,
        name: article.author.name ?? '',
      },
      createdAt: article.createdAt.toISOString(),
      labels: article.labels.map((label) => ({
        id: label._id.toHexString(),
        name: label.name ?? '',
        textColor: label.textColor ?? '',
        backgroundColor: label.backgroundColor ?? '',
      })),
      mainImage: article.mainImage || undefined,
      title: article.title,
      type: article.type,
      updatedAt: article.updatedAt.toISOString(),
      visible: article.visible,
    })),
    count,
  };

  res.status(200);
  res.send(response);
}

async function updateArticleTitle(req: Request, res: Response): Promise<void> {
  const id: string = req.params['id'];

  const user = req.user!;

  const { title } = await updateArticleTitleRequestSchema.validate(req.body);

  const article = await Article.findById(new ObjectId(id));

  if (!article) {
    throw new NotFoundError(id, 'Article');
  }

  if (
    user.permissionLevel < PermissionLevel.ADMIN &&
    user._id !== article.author
  ) {
    throw new PermissionError();
  }

  await article.updateOne({
    title,
  });

  res.status(200);
  res.send();
}

async function updateArticleAuthor(req: Request, res: Response): Promise<void> {
  const { articleId, authorId } = req.params;

  const user = req.user!;

  if (user.permissionLevel < PermissionLevel.ADMIN) {
    throw new PermissionError();
  }

  if (!articleId) {
    throw new HttpError(400, 'Missing article id.');
  }

  if (!authorId) {
    throw new HttpError(400, 'Missing author id.');
  }

  const author = await User.findById(authorId).lean();
  if (!author) {
    throw new NotFoundError(authorId, 'User');
  }

  const permissionLevel = author.permissionLevel;
  if (permissionLevel < PermissionLevel.WRITER) {
    throw new HttpError(400, 'Author needs to be at least a writer.');
  }

  const article = await Article.findById(new ObjectId(articleId)).lean();
  if (!article) {
    throw new NotFoundError(articleId, 'Article');
  }
  await Article.updateOne(
    { _id: new ObjectId(articleId) },
    {
      author: authorId,
    },
  );

  res.status(200);
  res.send();
}

async function updateVisibility(req: Request, res: Response): Promise<void> {
  const id: string = req.params['id'];
  const { visible } = await updateArticleVisibilityRequestSchema.validate(
    req.body,
  );

  await Article.updateOne({ _id: new ObjectId(id) }, { visible });

  res.status(200);
  res.send();
}

async function updateArticleContent(
  req: Request,
  res: Response,
): Promise<void> {
  const id: string = req.params['id'];

  const closed = req.query['closed'] != null;

  const user = req.user!;

  const article = await Article.findById(new ObjectId(id));

  if (!article) {
    throw new NotFoundError(id, 'Article');
  }

  if (
    user.permissionLevel < PermissionLevel.ADMIN &&
    user._id !== article.author
  ) {
    throw new PermissionError();
  }

  const content: string = req.body || '';

  if (article.type === 'open') {
    article['content'] = content;
    await article.save();

    res.status(200);
    res.send();
    return;
  }

  if (closed) {
    article['closedContent'] = content;
    await article.save();

    res.status(200);
    res.send();
    return;
  }

  article['openContent'] = content;
  await article.save();

  res.status(200);
  res.send();
}

async function deleteArticle(req: Request, res: Response): Promise<void> {
  const id: string = req.params['id'];

  const user = req.user!;

  const article = await Article.findById(new ObjectId(id));

  if (!article) {
    throw new NotFoundError(id, 'Article');
  }

  if (
    user.permissionLevel < PermissionLevel.ADMIN &&
    user._id !== article.author
  ) {
    throw new PermissionError();
  }

  await article.deleteOne();

  res.status(200);
  res.send();
}

async function addLabel(req: Request, res: Response): Promise<void> {
  const { articleId, labelId } = req.params ?? {};

  if (!articleId) {
    throw new HttpError(400, `Article ID is missing.`);
  }

  if (!labelId) {
    throw new HttpError(400, `Label ID is missing.`);
  }

  const article = await Article.findById(new ObjectId(articleId));
  if (!article) {
    throw new HttpError(404, `Article '${articleId}' is not found.`);
  }

  const hasLabel = article.labels.some(
    (label) => label.toHexString().toLowerCase() === labelId.toLowerCase(),
  );
  if (hasLabel) {
    res.status(200);
    res.send();
    return;
  }

  article.labels.push(new ObjectId(labelId));

  await article.updateOne({
    labels: article.labels,
  });

  res.status(201);
  res.send({});
}

async function removeLabel(req: Request, res: Response): Promise<void> {
  const { articleId, labelId } = req.params ?? {};

  if (!articleId) {
    throw new HttpError(400, `Article ID is missing.`);
  }

  if (!labelId) {
    throw new HttpError(400, `Label ID is missing.`);
  }

  const article = await Article.findById(new ObjectId(articleId));
  if (!article) {
    throw new HttpError(404, `Article '${articleId}' is not found.`);
  }

  const removedLabels = remove(
    article.labels,
    (label) => label.toHexString().toLowerCase() === labelId.toLowerCase(),
  );
  if (removedLabels?.length) {
    await article.updateOne({ labels: article.labels });

    res.status(200);
    res.send();
    return;
  }

  res.status(404);
  res.send({});
}

async function postComment(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const { text } = await createCommentRequestSchema.validate(req.body);

  if (!id) {
    throw new HttpError(400, `Article ID is required.`);
  }

  const user = req.user!;

  const comment = {
    _id: new ObjectId(),
    author: user._id!,
    text,
    createdAt: moment().utc().toDate(),
  };

  const article = await Article.findByIdAndUpdate(new ObjectId(id), {
    $push: { comments: comment },
  });

  if (!article) {
    throw new NotFoundError(id, 'Article');
  }

  res.status(201).send({});
}

async function getArticleComments(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!id) {
    throw new HttpError(400, `Article ID is required.`);
  }

  const article = await Article.findById(new ObjectId(id))
    .select('comments')
    .populate('comments.author')
    .lean();

  if (!article) {
    throw new NotFoundError(id, 'Article');
  }

  const { comments } = article;

  comments.sort((a, b) => {
    const comment1 = a as unknown as Comment;
    const comment2 = b as unknown as Comment;

    return comment1.createdAt.getDate() - comment2.createdAt.getDate();
  });

  const response: ListCommentsResponse = {
    comments: comments
      .map((_comment) => {
        try {
          const comment = _comment as unknown as Comment;
          const user = comment.author as unknown as User;

          return {
            id: comment._id.toHexString(),
            content: comment.text,
            createdAt: comment.createdAt.toISOString(),
            user: {
              id: user._id,
              name: user.name || '',
            },
          };
        } catch (error) {
          console.error(error);
          return undefined!;
        }
      })
      .filter((comment) => Boolean(comment)),
  };

  res.status(200);
  res.send(response);
}

async function deleteComment(req: Request, res: Response): Promise<void> {
  const { articleId, commentId } = req.params;

  if (!articleId) {
    throw new HttpError(400, `Article ID is required.`);
  }

  if (!commentId) {
    throw new HttpError(400, `Comment ID is required.`);
  }

  const user = req.user!;

  const article = await Article.findById(new ObjectId(articleId));

  if (!article) {
    throw new NotFoundError(articleId, 'Article');
  }

  if (
    user.permissionLevel < PermissionLevel.USER &&
    article.author !== user._id
  ) {
    throw new PermissionError();
  }

  await Article.findByIdAndUpdate(
    new ObjectId(articleId),
    {
      $pull: { comments: { _id: new ObjectId(commentId) } },
    },
    { upsert: false, multi: true },
  );

  if (!article) {
    throw new NotFoundError(articleId, 'Article');
  }

  res.status(200).send({});
}

function createOpenJsonEndpoints(): Router {
  const router = Router();

  router.use(json());
  router.use(createAuthMiddleware(PermissionLevel.USER, true));

  router.get('/:id', getArticleById);
  router.get('/', getArticles);

  router.get('/:id/comment', getArticleComments);

  return router;
}

function createOpenTextEndpoints(): Router {
  const router = Router();

  router.use(text({ type: 'text/markdown' }));
  router.use(createAuthMiddleware(PermissionLevel.USER, true));

  router.get('/:id/content', getArticleContentById);

  return router;
}

function createWriterJsonEndpoints(): Router {
  const router = Router();

  router.use(json());
  router.use(createAuthMiddleware(PermissionLevel.WRITER));

  router.post('/', createArticle);
  router.patch('/:id/title', updateArticleTitle);
  router.patch('/:articleId/author/:authorId', updateArticleAuthor);
  router.delete('/:id', deleteArticle);
  router.post('/:articleId/labels/:labelId', addLabel);
  router.delete('/:articleId/labels/:labelId', removeLabel);
  router.patch('/:id/visibility', updateVisibility);

  router.delete('/:articleId/comment/:commentId', deleteComment);

  return router;
}

function createWriterTextEndpoints(): Router {
  const router = Router();
  router.use(text({ type: 'text/markdown' }));
  router.use(createAuthMiddleware(PermissionLevel.WRITER));

  router.patch('/:id/content', updateArticleContent);

  return router;
}

function createUserEndpoints(): Router {
  const router = Router();

  router.use(json());
  router.use(createAuthMiddleware(PermissionLevel.USER));

  router.post('/:id/comment', postComment);

  return router;
}

const articleRouter = Router();
articleRouter.use(createOpenJsonEndpoints());
articleRouter.use(createOpenTextEndpoints());
articleRouter.use(createUserEndpoints());
articleRouter.use(createWriterJsonEndpoints());
articleRouter.use(createWriterTextEndpoints());

export { articleRouter };
