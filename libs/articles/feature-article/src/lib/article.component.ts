import { Field, NgrxFormsFacade } from '@realworld/core/forms';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ArticlesFacade } from '@realworld/articles/data-access';
import { AuthFacade } from '@realworld/auth/data-access';
import { ArticleMetaComponent } from './article-meta/article-meta.component';
import { CommonModule } from '@angular/common';
import { MarkdownPipe } from './pipes/markdown.pipe';
import { ArticleCommentComponent } from './article-comment/article-comment.component';
import { AddCommentComponent } from './add-comment/add-comment.component';
import { formsInitialState } from '@realworld/core/forms/src/lib/+state/forms.adapter';
import { Comment } from '@realworld/core/api-types/src';

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
const initialState = { ...formsInitialState, structure, data: '' };

@UntilDestroy()
@Component({
  selector: 'app-article',
  standalone: true,
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css'],
  imports: [CommonModule, ArticleMetaComponent, ArticleCommentComponent, MarkdownPipe, AddCommentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleComponent implements OnDestroy {
  article$ = this.facade.article$;
  comments$ = this.facade.comments$;
  canModify$ = this.authFacade.auth$.pipe(
    filter(auth => auth.loggedIn),
    auth$ => combineLatest([auth$, this.facade.authorUsername$]),
    map(([auth, username]) => auth.user.username === username),
  );
  isAuthenticated$ = this.authFacade.isLoggedIn$;
  currentUser$ = this.authFacade.user$;

  // TODO: After articles are converted, submit comment through articles.facade and react to result here
  store = this.ngrxFormsFacade.createFormStore('comment', initialState);
  sources = this.store.sources;
  structure$ = this.store.store.structure$;
  data$ = this.store.store.data$;
  errors$ = this.store.store.errors$;
  touched$ = this.store.store.touched$;

  constructor(
    private ngrxFormsFacade: NgrxFormsFacade,
    private facade: ArticlesFacade,
    private authFacade: AuthFacade,
  ) {}

  follow(username: string) {
    this.facade.follow(username);
  }
  unfollow(username: string) {
    this.facade.unfollow(username);
  }
  favorite(slug: string) {
    this.facade.favorite(slug);
  }
  unfavorite(slug: string) {
    this.facade.unfavorite(slug);
  }
  delete(slug: string) {
    this.facade.delete(slug);
  }
  deleteComment(data: { commentId: number; slug: string }) {
    this.facade.deleteComment(data);
  }
  submit(slug: string, comment: Comment) {
    this.facade.submit(slug, comment);
  }

  ngOnDestroy() {
    this.facade.initializeArticle();
  }
}
