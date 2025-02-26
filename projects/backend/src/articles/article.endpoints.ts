import { Request, Response, Router } from 'express';
import { authMiddleware } from '../users/auth.middleware.js';
import { Article } from './article.entity.js';
import {
  CreateArticleResponseData,
  listArticlesRequestSchema,
  ListArticlesResponse,
} from '@kotprog/common';
import { ObjectId } from 'mongodb';
import { User } from '../users/user.entity.js';

const articleRouter = Router();

async function createArticle(req: Request, res: Response): Promise<void> {
  // const createArticleData = await createArticleRequestData.validate(req.body)  ;

  const user = req.user!;

  const doc = await Article.create({
    author: user._id,
  });

  const response: CreateArticleResponseData = {
    id: doc._id.toHexString(),
  };

  res.set({ Location: `/api/article/${doc._id}` });

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
    .populate<{ author: User }>('author')
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
  res.send(200);
}

async function deleteArticle(req: Request, res: Response): Promise<void> {
  const id: string = req.params['id'];
  await Article.findByIdAndDelete(new ObjectId(id));

  res.status(200);
  res.send();
}

articleRouter.post('/', createArticle);
articleRouter.get('/:id', getArticleById);
articleRouter.get('/', getArticles);
articleRouter.patch('/:id', updateArticle);
articleRouter.delete('/', deleteArticle);

articleRouter.use(authMiddleware);

export { articleRouter };
