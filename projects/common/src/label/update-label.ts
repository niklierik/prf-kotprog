import { InferType, object, string } from 'yup';

export const updateLabelRequestSchema = object({
  name: string().required(),
  backgroundColor: string().required(),
  textColor: string().required(),
});

export type UpdateLabelRequest = InferType<typeof updateLabelRequestSchema>;

export interface UpdateLabelResponse {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
}
