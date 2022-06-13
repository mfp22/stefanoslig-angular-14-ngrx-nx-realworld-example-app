import { Routes } from '@angular/router';
import { ArticleListComponent } from '@realworld/articles/feature-articles-list/src';
import { AuthGuardService } from '@realworld/auth/data-access';
import { ProfileComponent } from './profile.component';

export const PROFILE_ROUTES: Routes = [
  {
    path: ':username',
    component: ProfileComponent,
    canActivate: [AuthGuardService],
    children: [
      {
        path: '',
        component: ArticleListComponent,
      },
      {
        path: 'favorites',
        data: { isFavorites: true },
        component: ArticleListComponent,
      },
    ],
  },
];
