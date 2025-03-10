import { Component, computed, Resource, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth/auth.service';
import { AuthorComponent } from '../author/author.component';
import { Author } from '../author/author.model';
import { Label } from '@kotprog/common';
import { LabelService } from '../../services/labels/label.service';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    AuthorComponent,
    LabelComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public readonly user: Signal<Author | undefined>;

  public readonly labels: Resource<Label[] | undefined>;

  public constructor(
    private readonly authService: AuthService,
    labelService: LabelService,
  ) {
    this.user = computed(() => {
      const payload = authService.payload();

      console.log(payload);
      if (!payload?.email) {
        return undefined;
      }

      return {
        id: payload.email,
        avatar: payload.avatar ?? undefined,
        name: payload.name || '',
      };
    });

    this.labels = labelService.listLabelsResource();
  }

  public logout(): void {
    this.authService.logout();
  }
}
