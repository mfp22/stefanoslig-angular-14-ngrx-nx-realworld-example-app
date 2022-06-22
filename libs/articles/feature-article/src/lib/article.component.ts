import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArticlesFacade } from '@realworld/articles/data-access';
import { AuthFacade } from '@realworld/auth/data-access';
import { Field, NgrxFormsFacade } from '@realworld/core/forms';
import { formsInitialState } from '@realworld/core/forms/src/lib/+state/forms.adapter';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AddCommentComponent } from './add-comment/add-comment.component';
import { ArticleCommentComponent } from './article-comment/article-comment.component';
import { ArticleMetaComponent } from './article-meta/article-meta.component';
import { MarkdownPipe } from './pipes/markdown.pipe';

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
const initialState = { ...formsInitialState, structure, data: { comment: '' } };

@Component({
  selector: 'app-article',
  standalone: true,
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css'],
  imports: [CommonModule, ArticleMetaComponent, ArticleCommentComponent, MarkdownPipe, AddCommentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleComponent implements OnInit, OnDestroy {
  article$ = this.facade.article$;
  comments$ = this.facade.comments$;
  canModify$ = this.authFacade.auth$.pipe(
    filter(auth => auth.loggedIn),
    auth$ => combineLatest([auth$, this.facade.authorUsername$]),
    map(([auth, username]) => auth.user.username === username),
  );
  isAuthenticated$ = this.authFacade.isLoggedIn$;
  currentUser$ = this.authFacade.user$;

  storeContainer = this.ngrxFormsFacade.createFormStore('comment', initialState, this.facade.addCommentError$);
  store = this.storeContainer.store;
  structure$ = this.store.structure$;
  data$ = this.store.data$;
  errors$ = this.store.errors$;
  touched$ = this.store.touched$;

  constructor(
    private ngrxFormsFacade: NgrxFormsFacade,
    public facade: ArticlesFacade,
    private authFacade: AuthFacade,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.facade.articleSlugUpdate$.next(this.route.snapshot.params['slug']);
  }

  ngOnDestroy() {
    this.facade.articleSlugUpdate$.next('');
  }
}
