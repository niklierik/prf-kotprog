import { Request, Response } from 'express';
import { HttpError } from '../errors/http-error.js';
import { config } from '../config/config.js';

import jwt from 'jsonwebtoken';
import { TokenPayload } from '@kotprog/common';
import { User } from './user.entity.js';
import { PermissionLevel } from '@kotprog/common';
import { UnauthenticatedError } from '../errors/unauthenticated-error.js';
import { PermissionError } from '../errors/permission-error.js';
const { verify } = jwt;

type Middleware = (
  req: Request,
  res: Response,
  next: (...args: unknown[]) => unknown,
) => Promise<void>;

export function createAuthMiddleware(
  minimumPermission: PermissionLevel,
  optional = false,
): Middleware {
  return async (req, res, next) => {
    try {
      const { headers } = req;
      const authHeader = headers['authorization'];

      if (!authHeader) {
        if (optional) {
          await next();
          return;
        }

        console.error('Authorization header is missing in request.');
        throw new UnauthenticatedError();
      }

      if (!authHeader.startsWith('Bearer ')) {
        if (optional) {
          await next();
          return;
        }

        console.error('Authorization header does not start with Bearer.');
        throw new UnauthenticatedError();
      }

      const jwtToken = authHeader.substring('Bearer '.length);

      try {
        const payload = verify(
          jwtToken,
          config.auth.secret,
          {},
        ) as TokenPayload;
        req.user = await User.findById(payload.email)
          .select('-password')
          .lean()
          .then();
      } catch {
        if (optional) {
          await next();
          return;
        }

        throw new UnauthenticatedError();
      }

      if (!req.user) {
        if (optional) {
          await next();
          return;
        }

        throw new UnauthenticatedError();
      }

      if (req.user.permissionLevel < minimumPermission) {
        if (optional) {
          await next();
          return;
        }

        throw new PermissionError();
      }

      await next();
    } catch (e) {
      if (e instanceof HttpError) {
        next(e);
        return;
      }

      console.error('Failed to authenticate request for unhandled reason.', e);
      next(
        new HttpError(
          500,
          'Failed to authenticate request because of unknown internal server error.',
        ),
      );
    }
  };
}
