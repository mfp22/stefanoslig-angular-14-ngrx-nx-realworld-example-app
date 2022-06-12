import { importProvidersFrom } from '@angular/core';
import { Routes } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ArticleListEffects, articleListFeature } from '@realworld/articles/data-access/src';
import { ArticleListComponent } from '@realworld/articles/feature-articles-list/src';
import { AuthGuardService } from '@realworld/auth/data-access';
import { ProfileArticlesResolverService, ProfileFavoritesResolverService } from '@realworld/profile/data-access';
import { ProfileComponent } from './profile.component';

export const PROFILE_ROUTES: Routes = [
  {
    path: ':username',
    component: ProfileComponent,
    providers: [
      importProvidersFrom(EffectsModule.forFeature([ArticleListEffects]), StoreModule.forFeature(articleListFeature)),
    ],
    canActivate: [AuthGuardService],
    children: [
      {
        path: '',
        component: ArticleListComponent,
        resolve: { ProfileArticlesResolverService },
      },
      {
        path: 'favorites',
        component: ArticleListComponent,
        resolve: { ProfileFavoritesResolverService },
      },
    ],
  },
];
