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
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../services/user/user.service';
import { Router } from '@angular/router';

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
    FileUploadComponent,
    MatSnackBarModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  public readonly user: Signal<UserInfo | undefined>;

  public readonly loading: WritableSignal<boolean>;

  public constructor(
    private readonly snackbar: MatSnackBar,
    private readonly userService: UserService,
    private readonly router: Router,
    authService: AuthService,
  ) {
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

    this.loading = signal(false);
  }

  public async uploadAvatar(file: File): Promise<void> {
    try {
      this.loading.set(true);
      this.snackbar.dismiss();

      await this.userService.updateAvatar(file);

      await this.reload();
    } catch (error) {
      this.snackbar.open(String(error), 'Close', { duration: 1000 });
    } finally {
      this.loading.set(false);
    }
  }

  public async deleteAvatar(): Promise<void> {
    try {
      this.loading.set(true);
      this.snackbar.dismiss();

      await this.userService.deleteAvatar();

      await this.reload();
    } catch (error) {
      this.snackbar.open(String(error), 'Close', { duration: 1000 });
    } finally {
      this.loading.set(false);
    }
  }

  public async reload(): Promise<void> {
    // source: https://stackoverflow.com/questions/59552387/how-to-reload-a-page-in-angular-8-the-proper-way
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    await this.router.navigate([], {
      onSameUrlNavigation: 'reload',
    });
  }
}
