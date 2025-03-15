import {
  Component,
  computed,
  Input,
  OnChanges,
  Signal,
  SimpleChanges,
} from '@angular/core';
import { ArticleInfo, PermissionLevel } from '@kotprog/common';
import { LabelComponent } from '../label/label.component';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth/auth.service';
import { AuthorComponent } from '../author/author.component';

@Component({
  selector: 'app-article-box',
  imports: [LabelComponent, MatIconModule, AuthorComponent],
  templateUrl: './article-box.component.html',
  styleUrl: './article-box.component.scss',
})
export class ArticleBoxComponent implements OnChanges {
  @Input({ required: true })
  public article!: ArticleInfo;

  public locked: boolean = false;

  public readonly canModify: Signal<boolean>;

  public constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {
    this.canModify = computed(() => {
      const authInfo = this.authService.payload();

      const permissionLevel = authInfo?.permissionLevel ?? PermissionLevel.USER;

      if (permissionLevel >= PermissionLevel.ADMIN) {
        return true;
      }

      return this.article.author.id === authInfo?.email;
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.locked =
      !this.authService.isAuthenticated() && this.article.type === 'closed';
  }

  public onClick(): void {
    this.router.navigate(['article', this.article.id]);
  }
}
