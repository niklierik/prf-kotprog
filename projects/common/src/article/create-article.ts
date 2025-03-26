import { boolean, InferType, object, string } from 'yup';

export const createArticleRequestSchema = object({
  title: string().required(),
  closed: boolean().required(),
});

export type CreateArticleRequestData = InferType<
  typeof createArticleRequestSchema
>;

export interface CreateArticleResponseData {
  id: string;
}
