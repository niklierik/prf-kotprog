import { Schema, model } from 'mongoose';
import { config } from '../config/config.js';
import { PermissionLevel } from '@kotprog/common';
import bcrypt from 'bcryptjs';

export const userSchema = new Schema(
  {
    _id: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: false },
    profilePicture: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      required: false,
    },
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
  try {
    const { username, password } = config.auth.superadmin;

    const user = await User.findById(username).lean().then();
    if (user) {
      return;
    }

    const passwordHashed = await bcrypt.hash(password, config.auth.salt);

    await User.create({
      _id: username,
      name: 'Super Admin',
      password: passwordHashed,
      permissionLevel: PermissionLevel.SUPERADMIN,
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
}
