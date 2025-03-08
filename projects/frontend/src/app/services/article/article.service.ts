import { Injectable } from '@angular/core';
import {
  ArticleInfo,
  ListArticlesRequest,
  ListArticlesResponse,
} from '@kotprog/common';
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

  public async findArticles({
    labels,
    length,
    page,
    author,
  }: Partial<ListArticlesRequest>): Promise<ListArticlesResponse> {
    const query = new URLSearchParams({});
    if (author) {
      query.append('author', author);
    }
    if (labels) {
      query.append('labels', labels.join(','));
    }
    if (page) {
      query.append('page', String(page));
    }
    if (length) {
      query.append('length', String(length));
    }

    const result = await this.fetchService.fetch<ListArticlesResponse>(
      `/api/article?${query}`,
      { method: 'GET' },
    );
    return result;
  }
}
