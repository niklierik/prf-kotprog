import { Component, computed, Resource, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth/auth.service';
import { AuthorComponent } from '../author/author.component';
import { UserInfo } from '../author/user-info.model';
import { Label, PermissionLevel } from '@kotprog/common';
import { LabelService } from '../../services/labels/label.service';
import { LabelComponent } from '../label/label.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    AuthorComponent,
    LabelComponent,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public readonly PermissionLevel = PermissionLevel;

  public readonly user: Signal<UserInfo | undefined>;

  public readonly permissionLevel: Signal<PermissionLevel>;

  public readonly labels: Resource<Label[] | undefined>;

  public constructor(
    private readonly authService: AuthService,
    labelService: LabelService,
  ) {
    this.user = computed(() => {
      const payload = authService.payload();

      if (!payload?.email) {
        return undefined;
      }

      return {
        id: payload.email,
        avatar: payload.avatar ?? undefined,
        name: payload.name || '',
      };
    });
    this.permissionLevel = computed(() => {
      const payload = authService.payload();

      return payload?.permissionLevel ?? PermissionLevel.USER;
    });

    this.labels = labelService.listLabelsResource();
  }

  public logout(): void {
    this.authService.logout();
  }
}
