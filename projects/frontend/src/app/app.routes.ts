import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ArticlePageComponent } from './pages/article-page/article-page.component';
import { AdminComponent } from './pages/admin/admin.component';
import { hasPermissionGuard } from './guards/has-permission.guard';
import { ArticleListPageComponent } from './pages/article-list-page/article-list-page.component';
import { CreateArticleComponent } from './pages/compose/create-article/create-article.component';
import { EditArticleComponent } from './pages/compose/edit-article/edit-article.component';
import { PermissionLevel } from '@kotprog/common';

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
    component: CreateArticleComponent,
    canActivate: [hasPermissionGuard(PermissionLevel.WRITER)],
  },
  {
    path: 'compose/:id',
    component: EditArticleComponent,
    canActivate: [hasPermissionGuard(PermissionLevel.WRITER)],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [hasPermissionGuard(PermissionLevel.ADMIN)],
  },
  {
    path: 'list',
    component: ArticleListPageComponent,
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
