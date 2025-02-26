import { InferType, object } from 'yup';

export const createArticleRequestData = object({});
export type CreateArticleRequestData = InferType<
  typeof createArticleRequestData
>;

export interface CreateArticleResponseData {
  id: string;
}
