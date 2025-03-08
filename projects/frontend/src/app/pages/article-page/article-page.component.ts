import {
  Component,
  computed,
  effect,
  Resource,
  resource,
  Signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ArticleService } from '../../services/article/article.service';
import { ArticleInfo, ListArticlesResponse } from '@kotprog/common';
import { ArticleComponent } from './article/article.component';
import { ArticleSuggestionComponent } from './article-suggestion/article-suggestion.component';
import { Title } from '@angular/platform-browser';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-article-page',
  imports: [
    ArticleComponent,
    ArticleSuggestionComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './article-page.component.html',
  styleUrl: './article-page.component.scss',
})
export class ArticlePageComponent {
  public readonly articleId: Signal<string | undefined>;

  public readonly dataResource: Resource<string | undefined>;
  public readonly infoResource: Resource<ArticleInfo | undefined>;
  public readonly data: Signal<string | undefined>;

  public readonly info: Signal<ArticleInfo | undefined>;

  public readonly articlesResource: Resource<ListArticlesResponse | undefined>;
  public readonly articles: Signal<ArticleInfo[]>;

  public constructor(
    activatedRoute: ActivatedRoute,
    articleService: ArticleService,
    router: Router,
    titleService: Title,
  ) {
    const idObsv = activatedRoute.params.pipe(
      map((params) => params['id'] || undefined),
    );
    this.articleId = toSignal(idObsv, {
      initialValue: undefined,
    });

    this.dataResource = resource({
      loader: async ({ request }) => {
        const { id } = request;

        if (!id) {
          return undefined;
        }

        const data = await articleService.getContentById(id);
        return data;
      },
      request: () => ({ id: this.articleId() }),
    });

    this.infoResource = resource({
      loader: async ({ request }) => {
        const { id } = request;

        if (!id) {
          return undefined;
        }

        const data = await articleService.getArticleById(id);
        return data;
      },
      request: () => ({ id: this.articleId() }),
    });

    this.data = computed(() => this.dataResource.value());

    this.info = computed(() => this.infoResource.value());

    this.articlesResource = resource({
      loader: async ({ request }) => {
        const { info } = request;

        if (!info) {
          return { articles: [] };
        }

        return await articleService.findArticles({
          labels: info?.labels.map((label) => label.id),
          length: 10,
        });
      },
      request: () => ({ info: this.info() }),
    });

    this.articles = computed(
      () => this.articlesResource.value()?.articles || [],
    );

    effect(() => {
      const title = this.info()?.title;
      if (!title) {
        titleService.setTitle('Lorem Ipsum News');
        return;
      }
      titleService.setTitle(`Lorem: ${title}`);
    });

    effect(() => {
      const dataError = this.dataResource.error();
      if (dataError) {
        console.error("Failed to download article's data.", dataError);
      }

      const infoError = this.infoResource.error();
      if (infoError) {
        console.error("Failed to download article's info.", infoError);
      }

      if (dataError || infoError) {
        router.navigate(['home'], { replaceUrl: true });
      }
    });
  }
}
