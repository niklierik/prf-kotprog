import { Injectable } from '@angular/core';
import { FetchService } from '../fetch.service';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  public constructor(
    private readonly fetchService: FetchService,
    private readonly authService: AuthService,
  ) {}

  public async updateAvatar(file: File): Promise<void> {
    const payload = this.authService.payload();
    if (!payload) {
      throw new Error('Unauthenticated request.');
    }

    const id = payload.email;

    await this.fetchService.fetch(
      `/api/user/${id}/avatar`,
      {
        method: 'POST',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      },
      () => {},
    );
  }

  public async deleteAvatar(): Promise<void> {
    const payload = this.authService.payload();
    if (!payload) {
      throw new Error('Unauthenticated request.');
    }

    const id = payload.email;

    await this.fetchService.fetch(
      `/api/user/${id}/avatar`,
      {
        method: 'DELETE',
      },
      () => {},
    );
  }
}
