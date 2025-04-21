import {
  Component,
  computed,
  resource,
  Resource,
  signal,
  Signal,
} from '@angular/core';
import { ListUsersResponse, PermissionLevel, UserInfo } from '@kotprog/common';
import { UserService } from '../../services/user/user.service';
import { AuthorComponent } from '../../components/author/author.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { capitalize } from 'lodash-es';
import { AuthService } from '../../services/auth/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-users',
  imports: [
    AuthorComponent,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {
  public readonly usersResource: Resource<ListUsersResponse | undefined>;
  public readonly users: Signal<UserInfo[]>;

  public readonly permissionLevels: { name: string; value: number }[] = [];

  public readonly currentPermissionLevel: Signal<PermissionLevel>;

  public readonly isLoading = signal(false);

  public constructor(
    private readonly userService: UserService,
    private readonly snackbar: MatSnackBar,
    authService: AuthService,
  ) {
    this.currentPermissionLevel = computed(() => {
      const payload = authService.payload();
      if (!payload) {
        return PermissionLevel.USER;
      }

      return payload.permissionLevel ?? PermissionLevel.USER;
    });

    for (const [name, value] of Object.entries(PermissionLevel)) {
      if (
        typeof name === 'string' &&
        typeof value === 'number' &&
        value < this.currentPermissionLevel()
      ) {
        this.permissionLevels.push({ name: capitalize(name), value });
      }
    }

    this.usersResource = resource({
      loader: async () => {
        const users = await this.userService.getUsers({});
        return users;
      },
    });

    this.users = computed(() => this.usersResource.value()?.users || []);
  }

  public async updatePermissionLevel(
    userId: string,
    { value }: MatSelectChange,
  ): Promise<void> {
    try {
      this.isLoading.set(true);
      this.snackbar.dismiss();

      const permissionLevel: PermissionLevel = value;
      await this.userService.updatePermissionLevel(userId, permissionLevel);

      this.usersResource.reload();
    } catch (error) {
      this.snackbar.open(String(error), 'Close');
    } finally {
      this.isLoading.set(false);
    }
  }
}
