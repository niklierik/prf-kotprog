import { Injectable, Resource, resource } from '@angular/core';
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
    randomization,
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
    if (randomization != null) {
      query.append('randomization', String(randomization));
    }

    const result = await this.fetchService.fetch<ListArticlesResponse>(
      `/api/article?${query}`,
      { method: 'GET' },
    );
    return result;
  }

  private readonly previewSize = 500;

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
}
