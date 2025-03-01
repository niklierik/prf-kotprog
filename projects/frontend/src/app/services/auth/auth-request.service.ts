import { Injectable } from '@angular/core';
import {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthRegisterRequest,
  AuthRegisterResponse,
} from '@kotprog/common';

@Injectable({
  providedIn: 'root',
})
export class AuthRequestService {
  public constructor() {}

  public async login(data: AuthLoginRequest): Promise<AuthLoginResponse> {
    const result = await fetch('/api/auth/login', {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const response: AuthLoginResponse = await result.json();
    return response;
  }

  public async register(
    data: AuthRegisterRequest,
  ): Promise<AuthRegisterResponse> {
    const result = await fetch('/api/auth/register', {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const response: AuthRegisterResponse = await result.json();
    return response;
  }

  public async checkLogin(): Promise<void> {
    await fetch('/api/auth/checklogin', { method: 'GET' });
  }
}
