import { Routes } from '@angular/router';
import { ArticleListComponent } from '@realworld/articles/feature-articles-list/src';
import { authGuard } from '@realworld/auth/data-access';
import { profileResolver } from '@realworld/profile/data-access';
import { ProfileComponent } from './profile.component';

export const PROFILE_ROUTES: Routes = [
  {
    path: ':username',
    component: ProfileComponent,
    resolve: { profileResolver },
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ArticleListComponent,
      },
      {
        path: 'favorites',
        component: ArticleListComponent,
      },
    ],
  },
];
