import { Injectable, resource, Resource } from '@angular/core';
import { ArticleInfo } from '@kotprog/common';
import { ArticleService } from '../../services/article/article.service';

@Injectable({
  providedIn: 'root',
})
export class HomePageResources {
  private readonly previewSize = 500;

  public constructor(private readonly articleService: ArticleService) {}

  public createArticleSuggestions(): Resource<
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
        const response = await this.articleService.findArticles({
          page: 0,
          length: 31,
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
        let mainData = await this.articleService.getContentById(main.id);
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
