import { Injectable } from '@angular/core';
import { ArticleInfo } from '@kotprog/common';
import { FetchService } from '../fetch.service';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  public constructor(private readonly fetchService: FetchService) {}

  public async getArticleById(id: string): Promise<ArticleInfo> {
    const result = await this.fetchService.fetch<ArticleInfo>(
      `/api/article/${id} `,
      {
        method: 'GET',
      },
    );

    return result;
  }

  public async getContentById(id: string): Promise<string> {
    const result = await this.fetchService.fetch<string>(
      `/api/article/${id}/content`,
      {},
      (res) => res.text(),
    );
    return result;
  }
}
