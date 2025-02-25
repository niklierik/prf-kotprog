import { Injectable } from '@angular/core';
import { AuthRequestService } from './auth-request.service';
import { AuthStorageService } from './auth-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public constructor(
    private readonly authRequestService: AuthRequestService,
    private readonly authStorageService: AuthStorageService,
  ) {}

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

  public isAuthenticated(): boolean {
    return this.authStorageService.getAuthToken() != undefined;
  }
}
