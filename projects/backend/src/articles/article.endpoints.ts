import { json, Request, Response, Router } from 'express';
import {
  Article,
  ClosedArticle,
  getArticlesCount,
  getScoredArticleList,
  OpenArticle,
} from './article.entity.js';
import {
  CreateArticleResponseData,
  ArticleInfo,
  listArticlesRequestSchema,
  ListArticlesResponse,
} from '@kotprog/common';
import { ObjectId } from 'mongodb';
import { findAvatar, User } from '../users/user.entity.js';
import { Label } from '../labels/label.entity.js';
import { createAuthMiddleware } from '../users/auth.middleware.js';
import { PermissionLevel } from '../users/permission-level.js';
import { PermissionError } from '../errors/permission-error.js';
import { NotFoundError } from '../errors/not-found-error.js';
import { text } from 'express';

export type ScoredArticle = Omit<Article, 'labels' | 'author'> & {
  labels: Label[];
  author: User;
  score: number;
};

async function createArticle(req: Request, res: Response): Promise<void> {
  const closed = Boolean(req.query['closed']);

  const author = req.user!._id;

  let id: string;

  if (closed) {
    const article = await ClosedArticle.create({
      author,
    });
    id = article._id.toHexString();
  } else {
    const article = await OpenArticle.create({
      author,
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
      avatar: findAvatar(article.author),
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
    content = article['openContent'];
    if (req.user) {
      content += article['closedContent'];
    }
  }

  res.setHeader('Content-Type', 'text/markdown');

  res.status(200);
  res.send(content);
}

async function getArticles(req: Request, res: Response): Promise<void> {
  const { page, length, labels, author, randomization } =
    await listArticlesRequestSchema.validate(req.query);

  const articles = await getScoredArticleList({
    user: req.user?._id,
    author: author || undefined,
    start: page * length,
    limit: length,
    labels,
    randomModifier: randomization,
  });

  const count = await getArticlesCount({ labels, author: author || undefined });

  const response: ListArticlesResponse = {
    articles: articles.map((article) => ({
      id: article._id.toHexString(),
      author: {
        id: article.author._id,
        name: article.author.name ?? '',
        avatar: findAvatar(article.author),
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

async function updateArticle(req: Request, res: Response): Promise<void> {
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

  if (article.type === 'open') {
    article['content'] = req.body();
    await article.save();

    res.status(200);
    res.send();
    return;
  }

  if (closed) {
    article['closedContent'] = req.body();
    await article.save();

    res.status(200);
    res.send();
    return;
  }

  article['openContent'] = req.body();
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

  res.status(200);
  res.send();
}

const articleRouter = Router();

const openTextEndpoints = Router();
openTextEndpoints.use(text());

openTextEndpoints.get('/:id/content', getArticleContentById);
articleRouter.use(openTextEndpoints);

const articleJsonRouter = Router();
articleJsonRouter.use(json());

const openEndpoints = Router();
openEndpoints.get('/:id', getArticleById);
openEndpoints.get('/', getArticles);
articleJsonRouter.use(openEndpoints);

const closedTextEndpoints = Router();
closedTextEndpoints.use(text());

closedTextEndpoints.patch('/:id/content', updateArticleContent);
// closedTextEndpoints.use(createAuthMiddleware(PermissionLevel.WRITER));
articleRouter.use(closedTextEndpoints);

const writerEndpoints = Router();
writerEndpoints.post('/', createArticle);
writerEndpoints.patch('/:id', updateArticle);
writerEndpoints.delete('/', deleteArticle);

writerEndpoints.use(createAuthMiddleware(PermissionLevel.WRITER));

articleJsonRouter.use(writerEndpoints);

articleRouter.use(articleJsonRouter);

export { articleRouter };
