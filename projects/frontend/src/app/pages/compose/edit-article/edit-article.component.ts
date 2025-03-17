import {
  Component,
  computed,
  resource,
  Resource,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../../services/article/article.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MonacoEditorModule, NgxEditorModel } from 'ngx-monaco-editor-v2';
import { MarkdownModule } from 'ngx-markdown';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-article',
  imports: [
    MatProgressSpinnerModule,
    MonacoEditorModule,
    MarkdownModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './edit-article.component.html',
  styleUrl: './edit-article.component.scss',
})
export class EditArticleComponent {
  public readonly id: Signal<string | undefined>;

  public readonly contentResource: Resource<string | undefined>;
  public content: string;

  public readonly editorOptions = {
    theme: 'vs-dark',
    language: 'markdown',
    wordWrap: 'on',
  };

  public readonly model: Signal<NgxEditorModel>;

  public constructor(
    activatedRoute: ActivatedRoute,
    articleService: ArticleService,
  ) {
    const params = toSignal(activatedRoute.params, {
      initialValue: {},
    });
    this.id = computed(() => params()['id']);
    this.content = '';

    this.contentResource = resource({
      request: () => ({ id: this.id() }),
      loader: async ({ request }) => {
        const { id } = request;
        if (!id) {
          return;
        }
        const response = await articleService.getContentById(id);
        if (!response) {
          return '';
        }

        this.content = response;

        return response;
      },
    });

    this.model = computed(() => ({
      value: this.content || '',
      language: 'markdown',
    }));
  }
}
