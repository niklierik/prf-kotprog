import { Injectable } from '@angular/core';
import { FetchService } from '../fetch.service';
import { AuthService } from '../auth/auth.service';
import {
  ListUsersRequest,
  ListUsersResponse,
  PermissionLevel,
} from '@kotprog/common';

@Injectable({ providedIn: 'root' })
export class UserService {
  public constructor(
    private readonly fetchService: FetchService,
    private readonly authService: AuthService,
  ) {}

  public async getUsers({
    minPermissionLevel,
    page,
    size,
  }: ListUsersRequest): Promise<ListUsersResponse> {
    const urlSearchParams = new URLSearchParams();
    if (minPermissionLevel != null) {
      urlSearchParams.append('minPermissionLevel', String(minPermissionLevel));
    }
    if (page != null) {
      urlSearchParams.append('page', String(page));
    }

    if (size != null) {
      urlSearchParams.append('size', String(size));
    }

    return await this.fetchService.fetch<ListUsersResponse>(
      `/api/user?${urlSearchParams}`,
      {
        method: 'GET',
      },
    );
  }

  public async updateAvatar(file: File): Promise<void> {
    const payload = this.authService.payload();
    if (!payload) {
      throw new Error('Unauthenticated request.');
    }

    const id = payload.email;

    await this.fetchService.fetch(
      `/api/user/${encodeURIComponent(id)}/avatar`,
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
      `/api/user/${encodeURIComponent(id)}/avatar`,
      {
        method: 'DELETE',
      },
      () => {},
    );
  }

  public async updatePermissionLevel(
    id: string,
    permissionLevel: PermissionLevel,
  ): Promise<void> {
    await this.fetchService.fetch(
      `/api/user/${encodeURIComponent(id)}/permission-level`,
      {
        method: 'PATCH',
        body: JSON.stringify({ permissionLevel }),
      },
      () => {},
    );
  }
}
