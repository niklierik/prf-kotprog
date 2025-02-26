import { Request, Response } from 'express';
import { MongoServerError } from 'mongodb';
import { ValidationError } from 'yup';
import { HttpError } from './http-error.js';

export type Endpoint = (req: Request, res: Response) => void | Promise<void>;

export async function errorHandlerMiddleware(
  req: Request,
  res: Response,
  next: () => unknown,
): Promise<void> {
  try {
    await next();
  } catch (e) {
    console.error(e);

    if (e instanceof ValidationError || e instanceof TypeError) {
      res.status(400);
      res.send({ message: e.message });
      return;
    }

    if (e instanceof MongoServerError) {
      // duplicate key
      if (e.code === 11000) {
        res.status(409);
        res.send({ message: e.message });
        return;
      }
    }

    if (e instanceof HttpError) {
      res.status(e.status);
      res.send({ message: e.message });
      return;
    }

    res.status(500);
    res.send({ message: 'Server error' });
  }
}
