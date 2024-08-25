import { Injectable, inject, signal } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ArticlesService } from '@realworld/articles/data-access';
import {
  Field,
  FormStateBase,
  initialFormState,
} from '@realworld/core/forms';
import {
  filterError,
  filterSuccess,
} from '@realworld/core/http-client';
import { connectSource } from '@realworld/signals';
import {
  Subject,
  concatMap,
  distinctUntilChanged,
  filter,
  map,
  merge,
  share,
  switchMap,
  tap,
} from 'rxjs';

const structure: Field[] = [
  {
    type: 'INPUT',
    name: 'title',
    placeholder: 'Article Title',
    validator: [Validators.required],
  },
  {
    type: 'INPUT',
    name: 'description',
    placeholder: "What's this article about?",
    validator: [Validators.required],
  },
  {
    type: 'TEXTAREA',
    name: 'body',
    placeholder: 'Write your article (in markdown)',
    validator: [Validators.required],
  },
  {
    type: 'INPUT',
    name: 'tagList',
    placeholder: 'Enter Tags',
    validator: [],
  },
];
const initialState = {
  ...initialFormState,
  data: { title: '', description: '', body: '', tagList: '' },
  structure,
};

@Injectable({ providedIn: 'root' })
export class ArticleEditStateService extends FormStateBase {
  store = inject(Store);
  router = inject(Router);
  articlesService = inject(ArticlesService);

  publish$ = new Subject<void>();
  publishResult$ = this.publish$.pipe(
    concatMap(() =>
      this.articlesService.publishArticle(this.data()),
    ),
    share(),
  );
  publishSuccess$ = this.publishResult$.pipe(
    filterSuccess,
    tap((result) =>
      this.router.navigate(['article', result.article.slug]),
    ),
  );
  publishFailure$ = this.publishResult$.pipe(filterError);

  article$ = this.router.events.pipe(
    map(() => this.router.url.split('/').reverse()),
    filter(([_, route]) => route === 'editor'),
    map(([slug]) => slug),
    distinctUntilChanged(),
    switchMap((slug) => this.articlesService.getArticle(slug)),
    filterSuccess,
  );

  constructor() {
    super(signal(initialState));
    const newState$ = merge(
      this.article$.pipe(
        map((data) => ({ ...this.state(), data: data.article })),
      ),
      this.publishSuccess$.pipe(map(() => initialState)),
      this.publishFailure$.pipe(
        map((result) => ({
          ...this.state(),
          errors: result.errors,
        })),
      ),
    );
    this.connection$ = merge(
      this.connection$,
      connectSource(this.state, newState$),
    );
  }
}
