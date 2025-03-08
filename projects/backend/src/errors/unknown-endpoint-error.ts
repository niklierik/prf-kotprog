import { HttpError } from './http-error.js';

export class NotFoundError extends HttpError {
  public constructor() {
    super(404, 'Unknown endpoint.');
  }
}
