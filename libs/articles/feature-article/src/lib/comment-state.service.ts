import { Injectable, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { Subject, exhaustMap, map, merge, share } from 'rxjs';

const structure: Field[] = [
  {
    type: 'TEXTAREA',
    name: 'comment',
    placeholder: 'Write a comment...',
    attrs: {
      rows: 3,
    },
  },
];
const initialState = {
  ...initialFormState,
  data: { comment: '' },
  structure,
};

@Injectable({ providedIn: 'root' })
export class CommentStateService extends FormStateBase {
  store = inject(Store);
  route = inject(ActivatedRoute);
  articlesService = inject(ArticlesService);

  addComment$ = new Subject<{ slug: string; comment: string }>();
  addCommentResult$ = this.addComment$.pipe(
    exhaustMap(({ slug, comment }) =>
      this.articlesService.addComment(slug, comment),
    ),
    share(),
  );
  addCommentSuccess$ = this.addCommentResult$.pipe(
    filterSuccess,
    share(),
  );
  addCommentFailure$ = this.addCommentResult$.pipe(
    filterError,
    share(),
  );

  constructor() {
    super(signal(initialState));
    const newState$ = this.addCommentSuccess$.pipe(
      map(() => initialState),
    );
    this.connection$ = merge(
      this.connection$,
      connectSource(this.state, newState$),
    );
  }
}
