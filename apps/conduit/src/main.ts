import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import {
  actionSanitizer,
  stateSanitizer,
  PatchState,
  CommonAction,
  AdaptModel,
  isPatchState,
  updatePaths,
} from '@state-adapt/core';
import { TokenInterceptorService } from '@realworld/auth/data-access';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandlerInterceptorService } from '@realworld/core/error-handler';
import { API_URL } from '@realworld/core/http-client';

if (environment.production) {
  enableProdMode();
}

const rootInterceptors = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorHandlerInterceptorService,
    multi: true,
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptorService,
    multi: true,
  },
];

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      HttpClientModule,
      RouterModule.forRoot(
        [
          {
            path: '',
            redirectTo: 'home',
            pathMatch: 'full',
          },
          {
            path: 'home',
            loadChildren: () => import('@realworld/home/src/lib/home.routes').then(home => home.HOME_ROUTES),
          },
          {
            path: 'login',
            loadComponent: () => import('@realworld/auth/feature-auth').then(m => m.LoginComponent),
          },
          {
            path: 'register',
            loadComponent: () => import('@realworld/auth/feature-auth').then(m => m.RegisterComponent),
          },
          {
            path: 'article',
            loadChildren: () => import('@realworld/articles/article').then(m => m.ARTICLE_ROUTES),
          },
          {
            path: 'settings',
            loadChildren: () =>
              import('@realworld/settings/feature-settings').then(settings => settings.SETTINGS_ROUTES),
          },
          {
            path: 'editor',
            loadChildren: () => import('@realworld/articles/article-edit').then(article => article.ARTICLE_EDIT_ROUTES),
          },
          {
            path: 'profile',
            loadChildren: () => import('@realworld/profile/feature-profile').then(profile => profile.PROFILE_ROUTES),
          },
        ],
        {
          initialNavigation: 'enabledBlocking',
          useHash: true,
          relativeLinkResolution: 'legacy',
        },
      ),
      StoreModule.forRoot({ adapt: adaptReducer }),
      EffectsModule.forRoot([]),
      !environment.production ? StoreDevtoolsModule.instrument({ actionSanitizer, stateSanitizer }) : [],
      StoreRouterConnectingModule.forRoot(),
    ),
    { provide: API_URL, useValue: environment.api_url },
    ...rootInterceptors,
  ],
}).catch(err => console.log(err));

export function adaptReducer(state: any = {}, action: PatchState | CommonAction): AdaptModel {
  return isPatchState(action) ? updatePaths(state, action.payload) : state;
}
