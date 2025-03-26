import { boolean, InferType, object, string } from 'yup';

export const updateArticleTitleRequestSchema = object({
  title: string().required().min(1),
});

export type UpdateArticleTitleRequest = InferType<
  typeof updateArticleTitleRequestSchema
>;

export const updateArticleVisibilityRequestSchema = object({
  visible: boolean().required(),
});

export type updateArticleVisibilityRequest = InferType<
  typeof updateArticleVisibilityRequestSchema
>;
