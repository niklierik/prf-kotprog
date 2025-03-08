import { array, boolean, InferType, object, string } from 'yup';

export const updateOpenArticleRequestSchema = object({
  mainImage: string().url().optional().nullable(),
  title: string().optional(),
  labels: array().of(string().required().nonNullable()).optional(),
  visible: boolean().optional(),
  author: string().optional(),
});
export const updateClosedArticleRequestSchema = object({});

export type UpdateOpenArticleRequest = InferType<
  typeof updateOpenArticleRequestSchema
>;

export type UpdateClosedArticleRequest = InferType<
  typeof updateClosedArticleRequestSchema
>;

export type UpdateArticleRequest =
  | UpdateOpenArticleRequest
  | UpdateClosedArticleRequest;
