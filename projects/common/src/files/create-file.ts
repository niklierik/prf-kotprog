import { InferType, object, string } from 'yup';

export const createFileQuerySchema = object({
  name: string().required(),
});
export type CreateFileQuery = InferType<typeof createFileQuerySchema>;

export interface CreateFileResponse {
  id: string;
  size: number;
}
