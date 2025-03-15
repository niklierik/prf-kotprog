import { Component, computed, resource, Resource, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ArticleInfo, ListArticlesResponse } from '@kotprog/common';
import { ArticleService } from '../../services/article/article.service';
import { ArticleBoxComponent } from '../../components/article-box/article-box.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-article-list-page',
  imports: [
    ArticleBoxComponent,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    RouterModule,
    CommonModule,
  ],
  templateUrl: './article-list-page.component.html',
  styleUrl: './article-list-page.component.scss',
})
export class ArticleListPageComponent {
  public readonly page: Signal<number>;
  public readonly pageSize: Signal<number>;

  private readonly author: Signal<string | undefined>;
  private readonly labels: Signal<string[] | undefined>;

  public readonly articlesRes: Resource<ListArticlesResponse | undefined>;

  public readonly articles: Signal<ArticleInfo[]>;
  public readonly count: Signal<number>;

  public constructor(
    activatedRoute: ActivatedRoute,
    articleService: ArticleService,
    private readonly router: Router,
  ) {
    const query = toSignal(activatedRoute.queryParams, { initialValue: {} });
    this.labels = computed(() => {
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
    this.author = computed(() => query()['author'] || undefined);
    this.page = computed(() => Number(query()['page'] || '0'));
    this.pageSize = computed(() => Number(query()['pageSize'] || '10'));

    this.articlesRes = resource({
      request: () => ({
        author: this.author(),
        labels: this.labels(),
        page: this.page(),
        pageSize: this.pageSize(),
      }),
      loader: async ({ request }) => {
        const { author, labels, page, pageSize } = request;

        const result = await articleService.findArticles({
          labels,
          author,
          page,
          length: pageSize,
          randomization: 0,
        });
        if (!result?.articles?.length) {
          return { articles: [], count: 0 };
        }

        return result;
      },
    });

    this.articles = computed(() => this.articlesRes.value()?.articles ?? []);
    this.count = computed(() => this.articlesRes.value()?.count ?? 0);
  }

  public async onPage(event: PageEvent): Promise<void> {
    await this.router.navigate(['list'], {
      queryParams: {
        author: this.author(),
        labels: this.labels(),
        page: event.pageIndex,
        pageSize: event.pageSize,
      },
    });
    this.articlesRes.reload();
  }
}
