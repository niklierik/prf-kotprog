import { User } from '../users/user.entity.js';

export {};

declare module 'express' {
  interface Request {
    user?: User;
  }
}
