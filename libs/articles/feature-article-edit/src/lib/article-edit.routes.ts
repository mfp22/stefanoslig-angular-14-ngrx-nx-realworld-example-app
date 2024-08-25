import { Routes } from '@angular/router';
import { authGuard } from '@realworld/auth/data-access';
import { ArticleEditComponent } from './article-edit.component';

export const ARTICLE_EDIT_ROUTES: Routes = [
  {
    path: '',
    component: ArticleEditComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ArticleEditComponent,
        canActivate: [authGuard],
      },
      {
        path: ':slug',
        component: ArticleEditComponent,
      },
    ],
  },
];
