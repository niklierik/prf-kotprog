import { Component, computed, Signal } from '@angular/core';
import { ArticleInfo } from '@kotprog/common';
import { HomePageResources } from './home-page.resources';
import { ArticleBoxComponent } from '../../components/article-box/article-box.component';
import { RouterModule } from '@angular/router';
import { LabelComponent } from '../../components/label/label.component';
import { AuthorComponent } from '../../components/author/author.component';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-home',
  imports: [
    ArticleBoxComponent,
    RouterModule,
    LabelComponent,
    AuthorComponent,
    MarkdownModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  public readonly mainArticle: Signal<ArticleInfo | undefined>;
  public readonly mainData: Signal<string | undefined>;
  public readonly column1: Signal<ArticleInfo[]>;
  public readonly column2: Signal<ArticleInfo[]>;
  public readonly column3: Signal<ArticleInfo[]>;

  public constructor(homePageResources: HomePageResources) {
    const articles = homePageResources.createArticleSuggestions();

    this.mainArticle = computed(() => articles.value()?.main);
    this.mainData = computed(() => articles.value()?.mainData);

    this.column1 = computed(() => articles.value()?.columns[0] ?? []);
    this.column2 = computed(() => articles.value()?.columns[1] ?? []);
    this.column3 = computed(() => articles.value()?.columns[2] ?? []);
  }
}
