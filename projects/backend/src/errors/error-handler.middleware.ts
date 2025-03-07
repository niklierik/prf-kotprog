import { Request, Response } from 'express';
import { MongoServerError } from 'mongodb';
import { ValidationError } from 'yup';
import { HttpError } from './http-error.js';

export type Endpoint = (req: Request, res: Response) => void | Promise<void>;

export async function errorHandlerMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: (...args: unknown[]) => unknown,
): Promise<void> {
  console.log('Error happened', err);

  console.error(err);

  if (err instanceof ValidationError || err instanceof TypeError) {
    res.status(400);
    res.send({ message: err.message });
    return;
  }

  if (err instanceof MongoServerError) {
    const duplicateKeyErrorCode = 11000;

    if (err.code === duplicateKeyErrorCode) {
      res.status(409);
      res.send({ message: err.message });
      return;
    }
  }

  if (err instanceof HttpError) {
    res.status(err.status);
    res.send({ message: err.message });
    return;
  }

  res.status(500);
  res.send({ message: 'Server error' });
}
