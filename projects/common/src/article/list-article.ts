import { InferType, number, object } from 'yup';
import { UserInfo } from '../auth/user-info.js';

export const listArticlesRequestSchema = object({
  page: number().default(0),
  length: number().default(20),
});
export type ListArticlesRequest = InferType<typeof listArticlesRequestSchema>;

export interface ListArticlesResponse {
  articles: ListArticlesElement[];
}

export interface ListArticlesElement {
  id: string;
  author: UserInfo;
  labels: string[];
  createdAt: string;
  mainImage?: string;
}

export interface ListCommentsResponse {
  comments: ListCommentElement[];
}

export interface ListCommentElement {
  author: UserInfo;
}
