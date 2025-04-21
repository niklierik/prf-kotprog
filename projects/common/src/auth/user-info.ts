import { PermissionLevel } from './permission-level.js';

export interface UserInfo {
  id: string;
  name: string;
  permissionLevel?: PermissionLevel;
}
