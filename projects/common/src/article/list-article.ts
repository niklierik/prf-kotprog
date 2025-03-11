import { array, InferType, number, object, string } from 'yup';
import { UserInfo } from '../auth/user-info.js';
import { ArticleInfo } from './find-article.js';

export const listArticlesRequestSchema = object({
  page: number().default(0),
  length: number().default(20),
  labels: array()
    .of(string().required().nonNullable())
    .transform((value) => {
      if (typeof value === 'string') {
        return value.split(',');
      }
      return value;
    })
    .default([]),
  author: string().optional().nullable(),
  randomization: number().default(1),
});
export type ListArticlesRequest = InferType<typeof listArticlesRequestSchema>;

export interface ListArticlesResponse {
  articles: ArticleInfo[];
  count: number;
}

export interface ListCommentsResponse {
  comments: ListCommentElement[];
}

export interface ListCommentElement {
  author: UserInfo;
}
