import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ArticlePageComponent } from './pages/article-page/article-page.component';
import { ComposeComponent } from './pages/compose/compose.component';
import { AdminComponent } from './pages/admin/admin.component';
import { authenticatedGuard } from './guards/authenticated.guard';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'article/:id',
    component: ArticlePageComponent,
  },
  {
    path: 'compose',
    component: ComposeComponent,
    canActivate: [authenticatedGuard],
  },
  {
    path: 'admin',
    component: AdminComponent,
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
