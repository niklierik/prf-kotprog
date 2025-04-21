import { InferType, object, string } from 'yup';
import { UserInfo } from '../auth/user-info.js';

export const createCommentRequestSchema = object({
  text: string().required().min(1),
});
export type CreateCommentRequest = InferType<typeof createCommentRequestSchema>;

export interface Comment {
  id: string;
  user: UserInfo;
  content: string;
  createdAt: string;
}

export interface ListCommentsResponse {
  comments: Comment[];
}
