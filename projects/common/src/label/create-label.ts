import { object, string } from 'yup';

export const createLabelRequestSchema = object({
  name: string().required(),
});

export interface CreateLabelResponse {
  id: string;
  name: string;
}
