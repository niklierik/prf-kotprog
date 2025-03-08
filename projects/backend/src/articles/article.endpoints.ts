import { Request, Response, Router } from 'express';
import { Article, ClosedArticle, OpenArticle } from './article.entity.js';
import {
  CreateArticleResponseData,
  FindArticleResponse,
  listArticlesRequestSchema,
  ListArticlesResponse,
} from '@kotprog/common';
import { ObjectId } from 'mongodb';
import { User } from '../users/user.entity.js';
import { Label } from '../labels/label.entity.js';
import { createAuthMiddleware } from '../users/auth.middleware.js';
import { PermissionLevel } from '../users/permission-level.js';
import { PermissionError } from '../errors/permission-error.js';
import { NotFoundError } from '../errors/not-found-error.js';
import { text } from 'express';

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

  const user = req.user!;

  if (!article) {
    throw new NotFoundError(id, 'Article');
  }

  if (!article.visible && user.permissionLevel < PermissionLevel.WRITER) {
    throw new NotFoundError(id, 'Article');
  }

  const response: FindArticleResponse = {
    id: article._id.toHexString(),
    title: article.title,
    author: {
      id: article.author._id,
      name: article.author.name ?? '',
    },
    labels: article.labels.map((label) => ({
      id: label._id.toHexString(),
      color: label.color,
      name: label.name,
    })),
    type: article.type as 'open' | 'closed',
    visible: article.visible,
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
    .select('content openContent closedContent type')
    .lean()
    .then();

  if (!article) {
    throw new NotFoundError(id, 'File');
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
  const { page, length } = await listArticlesRequestSchema.validate(req.query);

  const articles = await Article.find({})
    .skip(page * length)
    .limit(length)
    .populate<{ author: User; label: Label }>(['author', 'label'])
    .select('-body')
    .lean()
    .then();

  const response: ListArticlesResponse = {
    articles: articles.map((article) => ({
      id: article._id.toHexString(),
      author: {
        id: article.author._id,
        name: article.author.name ?? '',
      },
      createdAt: article.createdAt.toISOString(),
      labels: article.labels.map((label) => label._id.toHexString()),
    })),
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

    res.status(200);
    res.send();
    return;
  }

  if (closed) {
    article['closedContent'] = req.body();
    res.status(200);
    res.send();
    return;
  }

  article['openContent'] = req.body();
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
const articleJsonRouter = Router();
const openEndpoints = Router();
const writerEndpoints = Router();

const openTextEndpoints = Router();
const closedTextEndpoints = Router();

writerEndpoints.post('/', createArticle);
openEndpoints.get('/:id', getArticleById);
openEndpoints.get('/', getArticles);
writerEndpoints.patch('/:id', updateArticle);
writerEndpoints.delete('/', deleteArticle);

articleJsonRouter.use(openEndpoints);

writerEndpoints.use(createAuthMiddleware(PermissionLevel.WRITER));
articleJsonRouter.use(writerEndpoints);

openTextEndpoints.get('/:id/content', getArticleContentById);
openTextEndpoints.use(text());

closedTextEndpoints.patch('/:id/content', updateArticleContent);
closedTextEndpoints.use(text());
closedTextEndpoints.use(createAuthMiddleware(PermissionLevel.WRITER));

articleRouter.use(closedTextEndpoints);
articleRouter.use(openTextEndpoints);

articleRouter.use(articleJsonRouter);

export { articleRouter };
