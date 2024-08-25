import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideRouterStore } from '@ngrx/router-store';
import {
  authGuard,
  tokenInterceptor,
} from '@realworld/auth/data-access';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { errorHandlingInterceptor } from '@realworld/core/error-handler';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { API_URL } from '@realworld/core/http-client';
import { environment } from '@env/environment';
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadChildren: () =>
          import('@realworld/home/src/lib/home.routes').then(
            (home) => home.HOME_ROUTES,
          ),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('@realworld/auth/feature-auth').then(
            (m) => m.LoginComponent,
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('@realworld/auth/feature-auth').then(
            (m) => m.RegisterComponent,
          ),
      },
      {
        path: 'article',
        loadChildren: () =>
          import('@realworld/articles/article').then(
            (m) => m.ARTICLE_ROUTES,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('@realworld/settings/feature-settings').then(
            (settings) => settings.SettingsComponent,
          ),
      },
      {
        path: 'editor',
        loadChildren: () =>
          import('@realworld/articles/article-edit').then(
            (article) => article.ARTICLE_EDIT_ROUTES,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('@realworld/profile/feature-profile').then(
            (profile) => profile.PROFILE_ROUTES,
          ),
      },
    ]),
    provideStore({}),
    provideRouterStore(),
    provideHttpClient(
      withInterceptors([
        errorHandlingInterceptor,
        tokenInterceptor,
      ]),
    ),
    !environment.production
      ? provideStoreDevtools({ trace: true })
      : [],
    { provide: API_URL, useValue: environment.api_url },
  ],
};
