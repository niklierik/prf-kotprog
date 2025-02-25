import { Injectable } from '@angular/core';
import { TokenPayload } from '@kotprog/common';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthStorageService {
  private authToken: string | undefined;
  private payload: TokenPayload | undefined;
  private readonly localStorageKey: string = 'auth-token';

  public constructor() {
    const authToken = localStorage.getItem(this.localStorageKey);
    this.setAuthToken(authToken ?? undefined, true);
  }

  public getAuthToken(): string | undefined {
    return this.authToken;
  }

  public getPayload(): TokenPayload | undefined {
    return this.payload;
  }

  public setAuthToken(authToken: string | undefined, storeLogin: boolean) {
    this.authToken = authToken;
    if (!authToken) {
      this.payload = undefined;
      localStorage.removeItem(this.localStorageKey);
      return;
    }

    if (storeLogin) {
      localStorage.setItem(this.localStorageKey, authToken);
    }

    this.payload = jwtDecode(authToken, { header: true });
  }
}
