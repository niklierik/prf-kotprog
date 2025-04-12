import { Component, resource, Resource, signal } from '@angular/core';
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  public readonly loginResource: Resource<void>;

  public readonly email: FormControl;
  public readonly password: FormControl;
  public readonly storeLogin: FormControl;

  public constructor(authService: AuthService, router: Router) {
    this.email = new FormControl({ value: '', disabled: false }, [
      Validators.required,
    ]);
    this.password = new FormControl({ value: '', disabled: false }, [
      Validators.required,
    ]);
    this.storeLogin = new FormControl({ value: false, disabled: false });

    this.loginResource = resource({
      loader: async () => {
        if (this.email.valid && this.password.valid) {
          await authService.login(
            this.email.value,
            this.password.value,
            this.storeLogin.value,
          );

          await router.navigate(['home']);
        }
      },
    });
  }

  public login(): void {
    this.loginResource.reload();
  }
}
