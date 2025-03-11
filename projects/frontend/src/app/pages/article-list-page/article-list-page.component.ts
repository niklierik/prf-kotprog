import { Component, computed, resource, Resource, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ArticleInfo } from '@kotprog/common';
import { ArticleService } from '../../services/article/article.service';
import { ArticleBoxComponent } from '../../components/article-box/article-box.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-article-list-page',
  imports: [ArticleBoxComponent, MatProgressSpinnerModule],
  templateUrl: './article-list-page.component.html',
  styleUrl: './article-list-page.component.scss',
})
export class ArticleListPageComponent {
  public readonly articles: Resource<ArticleInfo[] | undefined>;

  public constructor(
    activatedRoute: ActivatedRoute,
    articleService: ArticleService,
  ) {
    const query = toSignal(activatedRoute.queryParams, { initialValue: {} });
    const labels = computed(() => {
      const labelValue = query()['labels'];

      if (!labelValue) {
        return [];
      }

      if (typeof labelValue === 'string') {
        return labelValue.split(',');
      }

      const result: string[] = [];

      if (labelValue instanceof Array) {
        for (const element of labelValue) {
          const str = `${element}`;
          const labels = str.split(',');
          result.push(...labels);
        }
      }

      return result;
    });
    const author: Signal<string | undefined> = computed(
      () => query()['author'] || undefined,
    );

    this.articles = resource({
      request: () => ({
        author: author(),
        labels: labels(),
      }),
      loader: async ({ request }) => {
        const { author, labels } = request;

        const result = await articleService.findArticles({
          labels,
          author,
          page: 0,
          length: 10,
          randomization: 0,
        });
        if (!result?.articles?.length) {
          return [];
        }

        return result.articles;
      },
    });
  }
}
