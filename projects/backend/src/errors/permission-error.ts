import { HttpError } from './http-error.js';

export class PermissionError extends HttpError {
  public constructor() {
    super(403, 'User does not have permission for this resource.');
  }
}
