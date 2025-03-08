import {
  Component,
  computed,
  effect,
  Resource,
  resource,
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleInfo } from '@kotprog/common';
import { MarkdownModule } from 'ngx-markdown';
import { map } from 'rxjs';
import { ArticleService } from '../../../services/article/article.service';
import { Label } from '@kotprog/common/src/label/label.model';
import { LabelComponent } from '../../../components/label/label.component';
import { AuthorComponent } from '../../../components/author/author.component';
import { Author } from '../../../components/author/author.model';
import { DistancePipe } from '../../../pipes/distance.pipe';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';

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
  public readonly articleId: Signal<string | undefined>;
  public readonly dataResource: Resource<string | undefined>;
  public readonly infoResource: Resource<ArticleInfo | undefined>;
  public readonly data: Signal<string | undefined>;
  public readonly info: Signal<ArticleInfo | undefined>;
  public readonly mainImageUrl: Signal<string | undefined>;
  public readonly title: Signal<string | undefined>;
  public readonly author: Signal<Author | undefined>;
  public readonly labels: Signal<Label[] | undefined>;

  public readonly createdAt: Signal<string | undefined>;
  public readonly updatedAt: Signal<string | undefined>;

  public constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly articleService: ArticleService,
    titleService: Title,
    router: Router,
  ) {
    const idObsv = this.activatedRoute.params.pipe(
      map((params) => params['id'] || undefined),
    );
    this.articleId = toSignal(idObsv, {
      initialValue: undefined,
    });
    this.dataResource = resource({
      loader: async ({ request }) => {
        const { id } = request;

        if (!id) {
          return undefined;
        }

        const data = await this.articleService.getContentById(id);
        return data;
      },
      request: () => ({ id: this.articleId() }),
    });

    this.infoResource = resource({
      loader: async ({ request }) => {
        const { id } = request;

        if (!id) {
          return undefined;
        }

        const data = await this.articleService.getArticleById(id);
        return data;
      },
      request: () => ({ id: this.articleId() }),
    });

    this.data = computed(() => this.dataResource.value());

    this.info = computed(() => this.infoResource.value());

    this.mainImageUrl = computed(() => this.info()?.mainImage);
    this.title = computed(() => this.info()?.title);
    this.author = computed(() => this.info()?.author);
    this.labels = computed(() => this.info()?.labels);

    this.createdAt = computed(() => this.info()?.createdAt || undefined);
    this.updatedAt = computed(() => this.info()?.updatedAt || undefined);

    effect(() => {
      const title = this.title();
      if (!title) {
        titleService.setTitle('Lorem Ipsum News');
        return;
      }
      titleService.setTitle(`Lorem: ${title}`);
    });

    effect(() => {
      const dataError = this.dataResource.error();
      if (dataError) {
        console.error("Failed to download article's data.", dataError);
      }

      const infoError = this.infoResource.error();
      if (infoError) {
        console.error("Failed to download article's info.", infoError);
      }

      if (dataError || infoError) {
        router.navigate(['home'], { replaceUrl: true });
      }
    });
  }
}
