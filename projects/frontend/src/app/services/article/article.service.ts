import { Injectable, Resource, resource } from '@angular/core';
import {
  ArticleInfo,
  CreateArticleRequestData,
  CreateArticleResponseData,
  ListArticlesRequest,
  ListArticlesResponse,
  UpdateArticleTitleRequest,
  updateArticleVisibilityRequest,
} from '@kotprog/common';
import { FetchService } from '../fetch.service';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly previewSize = 500;

  public constructor(private readonly fetchService: FetchService) {}

  public async createArticleService(
    createArticleRequest: CreateArticleRequestData,
  ): Promise<CreateArticleResponseData> {
    return await this.fetchService.fetch<CreateArticleResponseData>(
      '/api/article',
      {
        method: 'POST',
        body: JSON.stringify(createArticleRequest),
      },
    );
  }

  public async getArticleById(id: string): Promise<ArticleInfo> {
    const result = await this.fetchService.fetch<ArticleInfo>(
      `/api/article/${id} `,
      {
        method: 'GET',
      },
    );

    return result;
  }

  public async getContentById(
    id: string,
    type: 'all' | 'open' | 'closed' = 'all',
  ): Promise<string> {
    const params = new URLSearchParams();
    if (type !== 'all') {
      params.append('only', type);
    }
    const result = await this.fetchService.fetch<string>(
      `/api/article/${id}/content?${params}`,
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
    randomization,
  }: Partial<ListArticlesRequest>): Promise<ListArticlesResponse> {
    const query = new URLSearchParams({});
    if (author) {
      query.append('author', author);
    }
    if (labels?.length) {
      query.append('labels', labels.join(','));
    }
    if (page) {
      query.append('page', String(page));
    }
    if (length) {
      query.append('length', String(length));
    }
    if (randomization != null) {
      query.append('randomization', String(randomization));
    }

    const result = await this.fetchService.fetch<ListArticlesResponse>(
      `/api/article?${query}`,
      { method: 'GET' },
    );
    return result;
  }

  public createArticleSuggestions({
    labels,
    author,
  }: {
    labels?: string[];
    author?: string;
  }): Resource<
    | {
        main: ArticleInfo | undefined;
        mainData: string;
        columns: {
          0: ArticleInfo[];
          1: ArticleInfo[];
          2: ArticleInfo[];
        };
      }
    | undefined
  > {
    return resource({
      loader: async () => {
        const response = await this.findArticles({
          page: 0,
          length: 31,
          author,
          labels,
        });

        if (!response?.articles?.length) {
          return undefined;
        }

        const { articles } = response;

        let column1: ArticleInfo[] = [];
        let column2: ArticleInfo[] = [];
        let column3: ArticleInfo[] = [];

        const columns: [ArticleInfo[], ArticleInfo[], ArticleInfo[]] = [
          column1,
          column2,
          column3,
        ];

        for (let i = 1; i < response.articles.length; i++) {
          columns[(i - 1) % 3].push(articles[i]);
        }

        const main = articles[0];
        let mainData = await this.getContentById(main.id);
        mainData = mainData.substring(
          0,
          Math.min(mainData.length, this.previewSize),
        );
        mainData += '...';

        return {
          main,
          mainData,
          columns,
        };
      },
    });
  }

  public async updateVisible(id: string, visible: boolean): Promise<void> {
    const request: updateArticleVisibilityRequest = { visible };

    await this.fetchService.fetch(
      `/api/article/${id}/visibility`,
      {
        method: 'PATCH',
        body: JSON.stringify(request),
      },
      () => {},
    );
  }

  public async updateContent(
    id: string,
    content: string,
    type?: 'closed' | 'open',
  ): Promise<void> {
    const query = type === 'closed' ? '?closed' : '';
    await this.fetchService.fetch(
      `/api/article/${id}/content${query}`,
      {
        body: content,
        headers: {
          'Content-Type': 'text/markdown',
        },
        method: 'PATCH',
      },
      () => undefined,
    );
  }

  public async updateTitle(
    id: string,
    request: UpdateArticleTitleRequest,
  ): Promise<void> {
    await this.fetchService.fetch(
      `/api/article/${id}/title`,
      {
        body: JSON.stringify(request),
        method: 'PATCH',
      },
      () => {},
    );
  }

  public async updateClosedContent(id: string, content: string): Promise<void> {
    await this.fetchService.fetch(`/api/article/${id}/content?closed`, {
      body: content,
      headers: {
        'Content-Type': 'text/markdown',
      },
      method: 'PATCH',
    });
  }

  public async changeAuthor(
    articleId: string,
    authorId: string,
  ): Promise<void> {
    await this.fetchService.fetch(
      `/api/article/${articleId}/author/${encodeURI(authorId)}`,
      {
        method: 'PATCH',
      },
      () => {},
    );
  }

  public async addLabel(articleId: string, labelId: string): Promise<void> {
    await this.fetchService.fetch(
      `/api/article/${articleId}/labels/${labelId}`,
      {
        headers: {
          'Content-Type': 'text/markdown',
        },
        method: 'POST',
      },
      () => {},
    );
  }

  public async removeLabel(articleId: string, labelId: string): Promise<void> {
    await this.fetchService.fetch(
      `/api/article/${articleId}/labels/${labelId}`,
      {
        headers: {
          'Content-Type': 'text/markdown',
        },
        method: 'DELETE',
      },
      () => {},
    );
  }

  public async deleteArticle(id: string): Promise<void> {
    await this.fetchService.fetch(
      `/api/article/${id}`,
      { method: 'DELETE' },
      () => {},
    );
  }
}
