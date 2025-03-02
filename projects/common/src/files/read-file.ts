import { InferType, number, object } from 'yup';

export const listUserFilesRequestSchema = object({
  page: number().required().default(0),
  size: number().required().default(20),
});

export type ListUserFilesRequest = InferType<typeof listUserFilesRequestSchema>;

export interface ReadFileInfoResponse {
  id: string;
  mimeType: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  size: number;
}

export interface ListUserFilesResponse {
  files: ReadFileInfoResponse[];
}
