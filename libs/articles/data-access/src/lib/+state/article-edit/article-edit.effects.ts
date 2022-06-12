import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, map, tap } from 'rxjs/operators';
import { ArticlesService } from '../../services/articles.service';
import { articleEditActions } from './article-edit.actions';

@Injectable()
export class ArticleEditEffects {
  publishArticle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(articleEditActions.publishArticle),
      concatMap(({ article }) =>
        this.articlesService.publishArticle(article).pipe(
          tap(result => this.router.navigate(['article', result.article.slug])),
          map(() => articleEditActions.publishArticleSuccess()),
          // catchError((result) => of(setErrors({ errors: result.error.errors }))),
        ),
      ),
    ),
  );

  constructor(private actions$: Actions, private articlesService: ArticlesService, private router: Router) {}
}
