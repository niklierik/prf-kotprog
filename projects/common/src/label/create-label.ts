import { InferType, object, string } from 'yup';

export const createLabelRequestSchema = object({
  name: string().required(),
  backgroundColor: string().required(),
  textColor: string().required(),
});

export type CreateLabelRequest = InferType<typeof createLabelRequestSchema>;

export interface CreateLabelResponse {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
}
