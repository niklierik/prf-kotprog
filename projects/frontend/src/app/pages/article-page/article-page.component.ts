import { Component, computed, Resource, resource, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ArticleService } from '../../services/article/article.service';
import { ArticleInfo } from '@kotprog/common';
import { ArticleComponent } from './article/article.component';

@Component({
  selector: 'app-article-page',
  imports: [ArticleComponent],
  templateUrl: './article-page.component.html',
  styleUrl: './article-page.component.scss',
})
export class ArticlePageComponent {}
