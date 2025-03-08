import { HttpError } from './http-error.js';

export class NotFoundError extends HttpError {
  public constructor(id: string, resourceType = 'Resource') {
    super(404, `${resourceType} '${id}' cannot be found.`);
  }
}
