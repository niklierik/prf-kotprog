import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ArticleInfo } from '@kotprog/common';
import { MarkdownModule } from 'ngx-markdown';
import { LabelComponent } from '../../../components/label/label.component';
import { AuthorComponent } from '../../../components/author/author.component';
import { DistancePipe } from '../../../pipes/distance.pipe';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-article',
  imports: [
    MarkdownModule,
    LabelComponent,
    AuthorComponent,
    DistancePipe,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './article.component.html',
  styleUrl: './article.component.scss',
})
export class ArticleComponent implements OnChanges {
  @Input({ required: true })
  public data!: string;

  @Input({ required: true })
  public info!: ArticleInfo;

  public locked: boolean = false;

  public constructor(private readonly authService: AuthService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    this.locked =
      !this.authService.isAuthenticated() && this.info.type === 'closed';
  }
}
