import { Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { TokenPayload } from '@kotprog/common';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthStorageService {
  public readonly authToken: WritableSignal<string | undefined> =
    signal(undefined);
  public readonly payload: WritableSignal<TokenPayload | undefined> =
    signal(undefined);
  private readonly localStorageKey: string = 'auth-token';

  public constructor() {
    const authToken = localStorage.getItem(this.localStorageKey);
    this.setAuthToken(authToken ?? undefined, true);
  }

  public setAuthToken(authToken: string | undefined, storeLogin: boolean) {
    this.authToken.set(authToken);
    if (!authToken) {
      this.payload.set(undefined);
      localStorage.removeItem(this.localStorageKey);
      return;
    }

    if (storeLogin) {
      localStorage.setItem(this.localStorageKey, authToken);
    }

    this.payload.set(jwtDecode(authToken));
  }

  public logout(): void {
    this.setAuthToken(undefined, true);
  }
}
