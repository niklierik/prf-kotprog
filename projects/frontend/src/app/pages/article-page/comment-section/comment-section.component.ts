import {
  Component,
  computed,
  Input,
  resource,
  Signal,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ArticleService } from '../../../services/article/article.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthorComponent } from '../../../components/author/author.component';
import { DistancePipe } from '../../../pipes/distance.pipe';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ArticleInfo, PermissionLevel } from '@kotprog/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-comment-section',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    AuthorComponent,
    DistancePipe,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './comment-section.component.html',
  styleUrl: './comment-section.component.scss',
})
export class CommentSectionComponent {
  @Input({ required: true })
  public article!: ArticleInfo;

  public readonly isLoading = signal(false);

  public readonly comment = new FormControl<string>('', [Validators.required]);

  public readonly canDeleteComments: Signal<boolean>;
  public readonly isLoggedIn: Signal<boolean>;

  public readonly commentsResource = resource({
    loader: async () => {
      const comments = await this.articleService.getCommentSection(
        this.article.id,
      );

      return comments;
    },
  });

  public constructor(
    private readonly articleService: ArticleService,
    private readonly authService: AuthService,
    private readonly snackbar: MatSnackBar,
  ) {
    this.canDeleteComments = computed(() => {
      const payload = this.authService.payload();
      if (!payload) {
        return false;
      }

      const { email, permissionLevel } = payload;
      if (permissionLevel == null) {
        return false;
      }

      if (permissionLevel >= PermissionLevel.ADMIN) {
        return true;
      }

      return this.article.author.id === email;
    });

    this.isLoggedIn = authService.isAuthenticated;
  }

  public async postComment(): Promise<void> {
    try {
      this.isLoading.set(true);

      const text = this.comment.value;

      if (!text) {
        throw new Error('Comment is empty.');
      }

      await this.articleService.createComment(this.article.id, text);

      this.commentsResource.reload();

      this.comment.setValue('');
    } catch (error) {
      this.snackbar.open(String(error), 'Close.');
    } finally {
      this.isLoading.set(false);
    }
  }

  public async deleteComment(commentId: string): Promise<void> {
    try {
      this.isLoading.set(true);

      await this.articleService.deleteComment(this.article.id, commentId);

      this.commentsResource.reload();
    } catch (error) {
      this.snackbar.open(String(error), 'Close.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
