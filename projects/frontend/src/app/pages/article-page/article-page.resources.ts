import {
  computed,
  Injectable,
  Resource,
  resource,
  Signal,
} from '@angular/core';
import { ArticleInfo, ListArticlesResponse } from '@kotprog/common';
import { ArticleService } from '../../services/article/article.service';

@Injectable({
  providedIn: 'root',
})
export class ArticlePageResources {
  public constructor(private readonly articleService: ArticleService) {}

  public createInfo(
    articleId: Signal<string | undefined>,
  ): Resource<ArticleInfo | undefined> {
    return resource({
      loader: async ({ request }) => {
        const { id } = request;

        if (!id) {
          return undefined;
        }

        const data = await this.articleService.getArticleById(id);
        return data;
      },
      request: () => ({ id: articleId() }),
    });
  }

  public createDataSignal(
    articleId: Signal<string | undefined>,
  ): Resource<string | undefined> {
    return resource({
      loader: async ({ request }) => {
        const { id } = request;

        if (!id) {
          return undefined;
        }

        const data = await this.articleService.getContentById(id);
        return data;
      },
      request: () => ({ id: articleId() }),
    });
  }

  public createArticleSuggestionsSignal(
    infoSignal: Signal<ArticleInfo | undefined>,
  ): Resource<ArticleInfo[] | undefined> {
    return resource({
      loader: async ({ request }): Promise<ArticleInfo[]> => {
        const { info } = request;

        if (!info) {
          return [];
        }

        const response = await this.articleService.findArticles({
          labels: info?.labels.map((label) => label.id),
          length: 10,
        });

        return response?.articles ?? [];
      },
      request: () => ({ info: infoSignal() }),
    });
  }
}
