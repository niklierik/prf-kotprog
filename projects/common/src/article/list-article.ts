import { InferType, number, object } from 'yup';

export const listArticlesRequestSchema = object({
  page: number().default(0),
  length: number().default(20),
});
export type ListArticlesRequest = InferType<typeof listArticlesRequestSchema>;

export interface ListArticlesResponse {
  articles: ListArticlesElement[];
}

export interface ListArticlesElement {
  _id: string;
  author: {
    _id: string;
    name: string;
  };
  labels: string[];
  createdAt: string;
}
