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

    const response = await result.json();
    if (result.status >= 400) {
      throw new Error(response?.message);
    }

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

    const response = await result.json();

    if (result.status === 409) {
      throw new Error('E-mail is already in use.');
    }

    if (result.status >= 400) {
      throw new Error(response?.message);
    }

    return response;
  }

  public async checkLogin(authToken: string): Promise<void> {
    const result = await fetch('/api/auth/checklogin', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (result.status >= 400) {
      const response = await result.json();
      throw new Error(response?.message);
    }
  }
}
