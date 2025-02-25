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
  ): Promise<T> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('Unauthorized.');
    }

    requestInit.headers ??= {};
    requestInit.headers['Content-Type'] ??= 'application/json';
    requestInit.headers['Authorization'] ??=
      `Bearer ${this.authService.getAuthToken()}`;

    const result = await fetch(url, requestInit);

    return await result.json();
  }
}
