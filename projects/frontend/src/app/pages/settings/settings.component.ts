import {
  Component,
  computed,
  resource,
  Resource,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthorComponent } from '../../components/author/author.component';
import { UserInfo } from '@kotprog/common/build/src/auth/user-info';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-settings',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    AuthorComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  public readonly user: Signal<UserInfo | undefined>;

  public readonly loading: WritableSignal<boolean>;
  public readonly error: WritableSignal<unknown>;

  public constructor(authService: AuthService) {
    this.user = computed((): UserInfo | undefined => {
      const payload = authService.payload();
      if (!payload) {
        return undefined;
      }

      return {
        avatar: payload.avatar || '',
        id: payload.email,
        name: payload.name,
      };
    });

    this.error = signal(undefined);
    this.loading = signal(false);
  }

  public async uploadAvatar(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(undefined);
    } catch (error) {
      this.error.set(error);
    } finally {
      this.loading.set(false);
    }
  }
}
