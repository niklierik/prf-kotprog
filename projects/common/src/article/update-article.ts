import { InferType, object, string } from 'yup';

export const updateOpenArticleRequestSchema = object({
  type: string().oneOf(['open']).required(),
});
export const updateClosedArticleRequestSchema = object({
  type: string().oneOf(['closed']).required(),
});

export type UpdateOpenArticleRequest = InferType<
  typeof updateOpenArticleRequestSchema
> & {
  type: 'open';
};

export type UpdateClosedArticleRequest = InferType<
  typeof updateClosedArticleRequestSchema
> & {
  type: 'closed';
};

export type UpdateArticleRequest =
  | UpdateOpenArticleRequest
  | UpdateClosedArticleRequest;
