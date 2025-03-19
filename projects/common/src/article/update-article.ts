import { InferType, object, string } from 'yup';

export const updateArticleTitleRequestSchema = object({
  title: string().required().min(1),
});

export type UpdateArticleTitleRequest = InferType<
  typeof updateArticleTitleRequestSchema
>;
