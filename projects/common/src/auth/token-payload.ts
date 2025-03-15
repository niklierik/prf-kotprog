import { PermissionLevel } from './permission-level.js';

export interface TokenPayload {
  email: string;
  name: string;
  avatar?: string | null;
  permissionLevel?: PermissionLevel;
}
