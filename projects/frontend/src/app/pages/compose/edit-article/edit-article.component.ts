import {
  Component,
  computed,
  HostListener,
  resource,
  Resource,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ArticleService } from '../../../services/article/article.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { MarkdownModule } from 'ngx-markdown';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ArticleInfo, Label } from '@kotprog/common';
import { AuthorComponent } from '../../../components/author/author.component';
import { UserInfo } from '../../../components/author/user-info.model';
import { LabelComponent } from '../../../components/label/label.component';
import { MatIconModule } from '@angular/material/icon';
import { LabelService } from '../../../services/labels/label.service';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-edit-article',
  imports: [
    MatProgressSpinnerModule,
    MonacoEditorModule,
    MarkdownModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    AuthorComponent,
    LabelComponent,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './edit-article.component.html',
  styleUrl: './edit-article.component.scss',
})
export class EditArticleComponent {
  readonly addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  public readonly id: Signal<string | undefined>;

  public readonly infoResource: Resource<ArticleInfo | undefined>;
  public readonly contentResource: Resource<string | undefined>;
  public readonly listLabelsResource: Resource<Label[] | undefined>;

  public readonly uploading: WritableSignal<boolean>;

  public readonly author: Signal<UserInfo | undefined>;
  public readonly labels: WritableSignal<Label[]>;

  public title: string = '';

  public content: string;

  public lastSaved: string = '';

  public readonly editorOptions = {
    theme: 'vs-dark',
    language: 'markdown',
    wordWrap: 'on',
  };

  public constructor(
    private readonly articleService: ArticleService,
    private readonly snackbar: MatSnackBar,
    activatedRoute: ActivatedRoute,
    labelService: LabelService,
  ) {
    const params = toSignal(activatedRoute.params, {
      initialValue: {},
    });
    this.id = computed(() => params()['id']);
    this.content = '';

    this.infoResource = resource({
      loader: async ({ request }) => {
        const { id } = request;
        if (!id) {
          return undefined;
        }

        const article = await this.articleService.getArticleById(id);
        if (!article) {
          return undefined;
        }

        this.title = article.title;
        this.labels.set(article.labels);

        return article;
      },
      request: () => ({
        id: this.id(),
      }),
    });
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

        this.lastSaved = this.content = response;

        return response;
      },
    });

    this.uploading = signal(false);

    this.author = computed(
      () => this.infoResource.value()?.author ?? undefined,
    );
    this.labels = signal([]);

    this.listLabelsResource = labelService.listLabelsResource();
  }

  @HostListener('document:keydown.control.s', ['$event'])
  public onKeydownHandler(event: KeyboardEvent) {
    event.preventDefault();
    this.onSave();
  }

  public async onSave(): Promise<void> {
    try {
      this.uploading.set(true);
      const id = this.id();
      if (!id) {
        throw new Error('Cannot save article without ID.');
      }

      await this.articleService.updateContent(id, this.content);
      this.lastSaved = this.content;

      this.snackbar.open('Article saved.', 'Ok');
    } catch (error) {
      console.error('Failed to save article.', error);
      this.snackbar.open('Failed to save article.', 'Close');
    } finally {
      this.uploading.set(false);
    }
  }

  public onRevert(): void {
    this.content = this.lastSaved;
  }

  public async onAddLabel(label: Label): Promise<void> {
    const id = this.id();
    if (!id) {
      return;
    }

    await this.onSave();

    try {
      await this.articleService.addLabel(id, label.id);

      this.infoResource.reload();
    } catch (e) {
      console.error(
        `Failed to remove label '${label.id}' on article '${id}'.`,
        e,
      );
      this.snackbar.open('Failed to remove label.', 'Close');
    }
  }

  public async onRemoveLabel(label: Label): Promise<void> {
    const id = this.id();
    if (!id) {
      return;
    }

    await this.onSave();

    try {
      await this.articleService.removeLabel(id, label.id);

      this.infoResource.reload();
    } catch (e) {
      console.error(
        `Failed to remove label '${label.id}' on article '${id}'.`,
        e,
      );
      this.snackbar.open('Failed to remove label.', 'Close');
    }
  }
}
