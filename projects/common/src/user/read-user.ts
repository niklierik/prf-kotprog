import { InferType, number, object } from 'yup';
import { UserInfo } from '../auth/user-info.js';
import { PermissionLevel } from '../auth/permission-level.js';

export const listUsersRequestSchema = object({
  minPermissionLevel: number()
    .min(PermissionLevel.USER)
    .max(PermissionLevel.ADMIN)
    .optional(),
  page: number().optional(),
  size: number().optional(),
});
export type ListUsersRequest = InferType<typeof listUsersRequestSchema>;

export interface ListUsersResponse {
  users: UserInfo[];
  count: number;
}
