import { Injectable } from '@angular/core';
import { AuthRequestService } from './auth-request.service';
import { AuthStorageService } from './auth-storage.service';
import { AuthRegisterRequest } from '@kotprog/common';

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
      await this.authRequestService.checkLogin(this.getAuthToken()!);
    } catch (e) {
      this.authStorageService.setAuthToken(undefined, true);
      console.warn('Failed to validate current auth token.', e);
    }
  }

  public isAuthenticated(): boolean {
    return this.authStorageService.getAuthToken() != undefined;
  }

  public getAuthToken() {
    return this.authStorageService.getAuthToken();
  }

  public getPayload() {
    return this.authStorageService.getPayload();
  }
}
