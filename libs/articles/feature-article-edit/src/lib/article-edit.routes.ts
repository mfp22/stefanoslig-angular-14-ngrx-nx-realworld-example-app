import { Routes } from '@angular/router';
import { AuthGuardService } from '@realworld/auth/data-access';
import { ArticleEditComponent } from './article-edit.component';

export const ARTICLE_EDIT_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ArticleEditComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: ':slug',
        component: ArticleEditComponent,
      },
    ],
  },
];
