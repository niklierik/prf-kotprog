import { Schema, model } from 'mongoose';
import { config } from '../config/config.js';
import { PermissionLevel } from './permission-level.js';

export const userSchema = new Schema(
  {
    _id: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: false },
    profilePicture: { type: String, required: false },
    permissionLevel: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: PermissionLevel.SUPERADMIN,
    },
  },
  { timestamps: true },
);

export const User = model('User', userSchema);
export type User = InstanceType<typeof User>;

export async function seedSuperAdmin(): Promise<void> {
  const { username, password } = config.auth.superadmin;

  const user = await User.findById(username).lean().then();
  if (user) {
    return;
  }

  await User.create({
    _id: username,
    name: 'Super Admin',
    password,
    permissionLevel: PermissionLevel.SUPERADMIN,
  });
}
