import { Injectable } from '@angular/core';
import { AuthLoginRequest, AuthLoginResponse } from '@kotprog/common';

@Injectable({
  providedIn: 'root',
})
export class AuthRequestService {
  public constructor() {}

  public async login(data: AuthLoginRequest): Promise<AuthLoginResponse> {
    const result = await fetch('/api/login', {
      body: JSON.stringify(data),
    });
    const response: AuthLoginResponse = await result.json();
    return response;
  }
}
