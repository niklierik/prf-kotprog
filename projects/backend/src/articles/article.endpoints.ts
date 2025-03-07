import { Request, Response, Router } from 'express';
import { Article, ClosedArticle, OpenArticle } from './article.entity.js';
import {
  CreateArticleResponseData,
  listArticlesRequestSchema,
  ListArticlesResponse,
} from '@kotprog/common';
import { ObjectId } from 'mongodb';
import { User } from '../users/user.entity.js';
import { Label } from '../labels/label.entity.js';
import { createAuthMiddleware } from '../users/auth.middleware.js';
import { PermissionLevel } from '../users/permission-level.js';
import { HttpError } from '../errors/http-error.js';
import { PermissionError } from '../errors/permission-error.js';

const articleRouter = Router();
const openEndpoints = Router();
const writerEndpoints = Router();

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
  const article = await Article.findById(new ObjectId(id)).then();

  res.status(200);
  res.send(article);
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
      _id: article._id.toHexString(),
      author: {
        _id: article.author._id,
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
    throw new HttpError(404, `Article '${id}' cannot be found.`);
  }

  if (
    user.permissionLevel < PermissionLevel.ADMIN &&
    user._id !== article.author
  ) {
    throw new PermissionError();
  }

  res.send(200);
}

async function deleteArticle(req: Request, res: Response): Promise<void> {
  const id: string = req.params['id'];

  const user = req.user!;

  const article = await Article.findById(new ObjectId(id));

  if (!article) {
    throw new HttpError(404, `Article '${id}' cannot be found.`);
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

writerEndpoints.post('/', createArticle);
openEndpoints.get('/:id', getArticleById);
openEndpoints.get('/', getArticles);
writerEndpoints.patch('/:id', updateArticle);
writerEndpoints.delete('/', deleteArticle);

articleRouter.use(openEndpoints);

writerEndpoints.use(createAuthMiddleware(PermissionLevel.WRITER));
articleRouter.use(writerEndpoints);

export { articleRouter };
