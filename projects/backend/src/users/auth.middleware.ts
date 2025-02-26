import { Request, Response } from 'express';
import { HttpError } from '../errors/http-error.js';
import { config } from '../config/config.js';

import jwt from 'jsonwebtoken';
const { verify } = jwt;

export async function authMiddleware(
  req: Request,
  res: Response,
  next: (...args: unknown[]) => unknown,
): Promise<void> {
  try {
    console.log('Entering auth middleware');
    const { headers } = req;
    const authHeader = headers['authorization'];

    const errorMessage = 'Failed to authenticate request.';

    if (!authHeader) {
      console.error('Authorization header is missing in request.');
      throw new HttpError(401, errorMessage);
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.error('Authorization header does not start with Bearer.');
      throw new HttpError(401, errorMessage);
    }

    const jwtToken = authHeader.substring('Bearer '.length);

    try {
      verify(jwtToken, config.auth.secret, {});
    } catch {
      throw new HttpError(401, errorMessage);
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
}
