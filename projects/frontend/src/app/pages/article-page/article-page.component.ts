import { Component, effect, Resource, Signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ArticleInfo } from '@kotprog/common';
import { ArticleComponent } from './article/article.component';
import { ArticleSuggestionComponent } from './article-suggestion/article-suggestion.component';
import { Title } from '@angular/platform-browser';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ArticlePageResources } from './article-page.resources';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-article-page',
  imports: [
    ArticleComponent,
    ArticleSuggestionComponent,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './article-page.component.html',
  styleUrl: './article-page.component.scss',
})
export class ArticlePageComponent {
  public readonly articleId: Signal<string | undefined>;

  public readonly data: Resource<string | undefined>;

  public readonly info: Resource<ArticleInfo | undefined>;

  public readonly articles: Resource<ArticleInfo[] | undefined>;

  public constructor(
    activatedRoute: ActivatedRoute,
    articlePageResources: ArticlePageResources,
    router: Router,
    titleService: Title,
  ) {
    const idObsv = activatedRoute.params.pipe(
      map((params) => params['id'] || undefined),
    );
    this.articleId = toSignal(idObsv, {
      initialValue: undefined,
    });

    this.info = articlePageResources.createInfo(this.articleId);
    this.data = articlePageResources.createDataSignal(this.articleId);
    this.articles = articlePageResources.createArticleSuggestionsSignal(
      this.info.value,
    );

    effect(() => {
      const title = this.info.value()?.title;
      if (!title) {
        titleService.setTitle('Lorem Ipsum News');
        return;
      }
      titleService.setTitle(`Lorem: ${title}`);
    });

    effect(() => {
      const dataError = this.data.error();
      if (dataError) {
        console.error("Failed to download article's data.", dataError);
      }

      const infoError = this.info.error();
      if (infoError) {
        console.error("Failed to download article's info.", infoError);
      }

      if (dataError || infoError) {
        router.navigate(['home'], { replaceUrl: true });
      }
    });
  }
}
