import { Component, Input } from '@angular/core';
import { ArticleInfo } from '@kotprog/common';
import { MarkdownModule } from 'ngx-markdown';
import { LabelComponent } from '../../../components/label/label.component';
import { AuthorComponent } from '../../../components/author/author.component';
import { DistancePipe } from '../../../pipes/distance.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-article',
  imports: [
    MarkdownModule,
    LabelComponent,
    AuthorComponent,
    DistancePipe,
    CommonModule,
  ],
  templateUrl: './article.component.html',
  styleUrl: './article.component.scss',
})
export class ArticleComponent {
  @Input({ required: true })
  public data!: string;

  @Input({ required: true })
  public info!: ArticleInfo;

  public constructor() {}
}
