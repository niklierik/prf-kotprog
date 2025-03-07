import { HttpError } from './http-error.js';

export class UnauthenticatedError extends HttpError {
  public constructor() {
    super(401, 'Unauthenticated request.');
  }
}
