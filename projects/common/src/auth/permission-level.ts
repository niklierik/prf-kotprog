import { InferType, number, object } from 'yup';

export enum PermissionLevel {
  USER = 0,
  WRITER = 1,
  ADMIN = 2,
  SUPERADMIN = 3,
}

export const updatePermissionLevelRequestSchema = object({
  permissionLevel: number()
    .min(PermissionLevel.USER)
    .max(PermissionLevel.SUPERADMIN),
});

export type UpdatePermissionLevelRequest = InferType<
  typeof updatePermissionLevelRequestSchema
>;
