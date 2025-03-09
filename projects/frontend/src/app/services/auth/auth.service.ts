import {
  computed,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { AuthRequestService } from './auth-request.service';
import { AuthStorageService } from './auth-storage.service';
import { AuthRegisterRequest, TokenPayload } from '@kotprog/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public constructor(
    private readonly authRequestService: AuthRequestService,
    private readonly authStorageService: AuthStorageService,
  ) {
    this.checkLogin();
  }

  public async login(
    email: string,
    password: string,
    storeLogin: boolean = false,
  ): Promise<void> {
    try {
      const { jwt } = await this.authRequestService.login({ email, password });
      this.authStorageService.setAuthToken(jwt, storeLogin);
    } catch (e) {
      this.authStorageService.setAuthToken(undefined, storeLogin);

      console.error(`Failed to login user '${email}'.`);
      console.error(e);

      throw e;
    }
  }

  public async register(data: AuthRegisterRequest) {
    try {
      await this.authRequestService.register(data);
    } catch (e) {
      throw e;
    }
  }

  public async checkLogin(): Promise<void> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Unauthenticated check login request.');
      }
      await this.authRequestService.checkLogin(this.authToken()!);
    } catch (e) {
      this.authStorageService.setAuthToken(undefined, true);
      console.warn('Failed to validate current auth token.', e);
    }
  }

  public get isAuthenticated(): Signal<boolean> {
    return computed(() => Boolean(this.authToken()));
  }

  public get authToken(): Signal<string | undefined> {
    return this.authStorageService.authToken;
  }

  public get payload(): Signal<TokenPayload | undefined> {
    return this.authStorageService.payload;
  }

  public logout() {
    this.authStorageService.logout();
  }
}
