import { Document } from 'mongoose';
import { User } from '../users/user.entity.js';

export {};

declare module 'express' {
  interface Request {
    user?: Document<User>;
  }
}
