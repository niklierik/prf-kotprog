import { Component, Input } from '@angular/core';
import { ArticleInfo } from '@kotprog/common';
import { ArticleBoxComponent } from '../../../components/article-box/article-box.component';

@Component({
  selector: 'app-article-suggestion',
  imports: [ArticleBoxComponent],
  templateUrl: './article-suggestion.component.html',
  styleUrl: './article-suggestion.component.scss',
})
export class ArticleSuggestionComponent {
  @Input({ required: true })
  public articles!: ArticleInfo[];
}
