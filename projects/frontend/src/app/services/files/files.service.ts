import { Injectable } from '@angular/core';
import { FetchService } from '../fetch.service';
import { ListUserFilesRequest, ListUserFilesResponse } from '@kotprog/common';

@Injectable({ providedIn: 'root' })
export class FilesService {
  public constructor(private readonly fetchService: FetchService) {}

  public async listFileInfos({ page, size }: ListUserFilesRequest) {
    const searchParams = new URLSearchParams();
    searchParams.append('page', String(page));
    searchParams.append('size', String(size));

    return await this.fetchService.fetch<ListUserFilesResponse>(
      `/api/file?${searchParams}`,
      {
        method: 'GET',
      },
    );
  }

  public async uploadFile(file: File): Promise<void> {
    const { name, type } = file;

    const searchParams = new URLSearchParams();
    searchParams.append('name', name);

    await this.fetchService.fetch(
      `/api/file?${searchParams}`,
      {
        method: 'POST',
        body: file,
        headers: {
          'Content-Type': type,
        },
      },
      () => {},
    );
  }

  public async delete(id: string): Promise<void> {
    await this.fetchService.fetch(
      `/api/file/${id}`,
      { method: 'DELETE' },
      () => {},
    );
  }
}
