import { Routes } from '@angular/router';
import { hasPermissionGuard } from './guards/has-permission.guard';
import { PermissionLevel } from '@kotprog/common';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'article/:id',
    loadComponent: () =>
      import('./pages/article-page/article-page.component').then(
        (m) => m.ArticlePageComponent,
      ),
  },
  {
    path: 'compose',
    loadComponent: () =>
      import('./pages/compose/create-article/create-article.component').then(
        (m) => m.CreateArticleComponent,
      ),
    canActivate: [hasPermissionGuard(PermissionLevel.WRITER)],
  },
  {
    path: 'compose/:id',
    loadComponent: () =>
      import('./pages/compose/edit-article/edit-article.component').then(
        (m) => m.EditArticleComponent,
      ),
    canActivate: [hasPermissionGuard(PermissionLevel.WRITER)],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.component').then((m) => m.AdminComponent),
    canActivate: [hasPermissionGuard(PermissionLevel.ADMIN)],
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./pages/article-list-page/article-list-page.component').then(
        (m) => m.ArticleListPageComponent,
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.component').then(
        (m) => m.SettingsComponent,
      ),
    canActivate: [hasPermissionGuard(PermissionLevel.USER)],
  },
  {
    path: 'gallery',
    loadComponent: () =>
      import('./pages/gallery/gallery.component').then(
        (m) => m.GalleryComponent,
      ),
    canActivate: [hasPermissionGuard(PermissionLevel.WRITER)],
  },
  {
    path: 'labels',
    loadComponent: () =>
      import('./pages/labels/labels.component').then((m) => m.LabelsComponent),
    canActivate: [hasPermissionGuard(PermissionLevel.ADMIN)],
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/users/users.component').then((m) => m.UsersComponent),
    canActivate: [hasPermissionGuard(PermissionLevel.ADMIN)],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
