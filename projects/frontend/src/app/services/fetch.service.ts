import { Injectable } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class FetchService {
  public constructor(private readonly authService: AuthService) {}

  public async fetch<T>(
    url: string,
    requestInit: RequestInit = {},
    responseHandler?: (response: Response) => T | Promise<T>,
  ): Promise<T> {
    const authToken = this.authService.getAuthToken();

    requestInit.headers ??= {};
    requestInit.headers['Content-Type'] ??= 'application/json';

    if (authToken) {
      requestInit.headers['Authorization'] ??= `Bearer ${authToken}`;
    }

    const response = await fetch(url, requestInit);

    if (response.status >= 400) {
      const body = await response.json();
      throw new Error(body?.messages);
    }

    if (responseHandler) {
      return await responseHandler(response);
    }

    const body = await response.json();
    return body;
  }
}
