import { Component, resource, Resource } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ArticleService } from '../../../services/article/article.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-article',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './create-article.component.html',
  styleUrl: './create-article.component.scss',
})
export class CreateArticleComponent {
  public readonly createArticleResource: Resource<void>;

  public readonly title: FormControl<string | null>;
  public readonly closedArticle: FormControl<boolean | null>;

  public constructor(articleService: ArticleService, router: Router) {
    this.title = new FormControl('', [Validators.required]);
    this.closedArticle = new FormControl(false, []);
    this.createArticleResource = resource({
      loader: async () => {
        const title = this.title.value;
        if (!title) {
          return;
        }

        const closed = Boolean(this.closedArticle.value);

        const { id } = await articleService.createArticleService({
          title,
          closed,
        });

        await router.navigate(['compose', id], {});
      },
    });
  }

  public createArticle() {
    this.createArticleResource.reload();
  }
}
