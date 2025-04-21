import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  public readonly isLoading = signal(false);

  public readonly error = signal<unknown>(undefined);

  public readonly email = new FormControl<string>('', [Validators.required]);
  public readonly nickname = new FormControl<string>('', [Validators.required]);
  public readonly password = new FormControl<string>('', [
    Validators.required,
    Validators.min(8),
  ]);
  public readonly passwordAgain = new FormControl<string>('', [
    Validators.required,
    Validators.min(8),
  ]);

  public constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  public async register(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(undefined);

      const email = this.getEmail();
      const password = this.getPassword();
      const passwordAgain = this.getPasswordAgain();
      const nickname = this.getNickname();

      if (!email) {
        throw new Error('E-mail is empty.');
      }

      if (!password) {
        throw new Error('Password is empty.');
      }

      if (!passwordAgain) {
        throw new Error('Confirm password field is empty.');
      }

      if (!nickname) {
        throw new Error('Nickname is empty.');
      }

      if (password !== passwordAgain) {
        throw new Error('The two passwords have to be the same.');
      }

      await this.authService.register({ email, nickname, password });

      await this.router.navigate(['/login']);
    } catch (error) {
      console.error(error);

      if (typeof error === 'string') {
        this.error.set(error);
        return;
      }

      if (error instanceof Error) {
        this.error.set(error.message);
        return;
      }

      this.error.set(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private getEmail(): string {
    return this.email.value || '';
  }

  private getNickname(): string {
    return this.nickname.value || '';
  }

  private getPassword(): string {
    return this.password.value || '';
  }

  private getPasswordAgain(): string {
    return this.passwordAgain.value || '';
  }
}
