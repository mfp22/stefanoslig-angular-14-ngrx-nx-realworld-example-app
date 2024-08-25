import {
  Inject,
  Injectable,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticlesService } from '@realworld/articles/data-access/src/lib/services/articles.service';
import {
  filterError,
  filterSuccess,
} from '@realworld/core/http-client';
import { connectSource, memo } from '@realworld/signals';
import {
  BehaviorSubject,
  Subject,
  concatMap,
  distinctUntilChanged,
  filter,
  map,
  merge,
  share,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import { Article, Comment } from '@realworld/core/api-types';
import { CommentStateService } from './comment-state.service';
import {
  ActionsService,
  ArticlesSources,
} from '@realworld/articles/data-access';

export interface ArticleState {
  article: Article;
  comments: Comment[];
  loading: boolean;
  loaded: boolean;
}

export const articleInitialState: ArticleState = {
  article: {
    slug: '',
    title: '',
    description: '',
    body: '',
    tagList: [],
    createdAt: '',
    updatedAt: '',
    favorited: false,
    favoritesCount: 0,
    author: {
      username: '',
      bio: '',
      image: '',
      following: false,
      loading: false,
    },
  },
  comments: [],
  loaded: false,
  loading: false,
};

@Injectable({ providedIn: 'root' })
export class ArticleStateService {
  router = inject(Router);
  route = inject(ActivatedRoute);
  articlesService = inject(ArticlesService);
  commentStateService = inject(CommentStateService);
  actionsService = inject(ActionsService);
  articlesSources = inject(ArticlesSources);

  state = signal(articleInitialState);
  comments = memo(() => this.state().comments);
  article = memo(() => this.state().article);
  authorUsername = memo(() => this.article().author.username);

  routeParam$ = new BehaviorSubject<string>('');
  article$ = this.routeParam$.pipe(
    filter((slug) => slug !== ''),
    distinctUntilChanged(),
    switchMap((slug) => this.articlesService.getArticle(slug)),
    share(),
  );
  articleSuccess$ = this.article$.pipe(filterSuccess, share());
  articleFailure$ = this.article$.pipe(filterError);

  deleteArticle$ = new Subject<string>();
  deleteArticleSuccess$ = this.deleteArticle$.pipe(
    concatMap((slug) =>
      this.articlesService
        .deleteArticle(slug)
        .pipe(map(() => ({ slug }))),
    ),
    filterSuccess,
    tap(() => this.router.navigate(['/'])),
    share(),
  );

  comments$ = this.articleSuccess$.pipe(
    switchMap((result) =>
      this.articlesService.getComments(result.article.slug),
    ),
    share(),
  );
  commentsSuccess$ = this.comments$.pipe(filterSuccess, share());
  commentsFailure$ = this.comments$.pipe(filterError, share());

  deleteComment$ = new Subject<{
    slug: string;
    commentId: number;
  }>();
  deleteCommentSuccess$ = this.deleteComment$.pipe(
    concatMap(({ commentId, slug }) =>
      this.articlesService
        .deleteComment(commentId, slug)
        .pipe(map(() => ({ commentId }))),
    ),
    filterSuccess,
    share(),
  );

  follow$ = new Subject<string>();
  followSuccess$ = this.follow$.pipe(
    concatMap((username) =>
      this.actionsService.followUser(username),
    ),
    filterSuccess,
    share(),
  );

  unfollow$ = new Subject<string>();
  unfollowSuccess$ = this.unfollow$.pipe(
    concatMap((username) =>
      this.actionsService.unfollowUser(username),
    ),
    filterSuccess,
    share(),
  );

  favorite$ = this.articlesSources.favorite$;
  favoriteSuccess$ = this.articlesSources.favoriteSuccess$;
  unfavorite$ = this.articlesSources.unfavorite$;
  unfavoriteSuccess$ = this.articlesSources.unfavoriteSuccess$;

  newState$ = merge(
    this.articleSuccess$.pipe(
      map(
        (result): ArticleState => ({
          ...this.state(),
          article: result.article,
          loaded: true,
          loading: false,
        }),
      ),
    ),
    this.articleFailure$.pipe(map(() => articleInitialState)),
    this.deleteArticleSuccess$.pipe(
      map(() => articleInitialState),
    ),
    this.commentsSuccess$.pipe(
      map(
        (result): ArticleState => ({
          ...this.state(),
          comments: result.comments,
        }),
      ),
    ),
    this.commentsFailure$.pipe(
      map(
        (): ArticleState => ({
          ...this.state(),
          comments: articleInitialState.comments,
        }),
      ),
    ),
    this.commentStateService.addCommentSuccess$.pipe(
      map(
        (result): ArticleState => ({
          ...this.state(),
          comments: [result.comment, ...this.comments()],
        }),
      ),
    ),
    this.deleteCommentSuccess$.pipe(
      map(
        (result): ArticleState => ({
          ...this.state(),
          comments: this.comments().filter(
            (comment) => comment.id !== result.commentId,
          ),
        }),
      ),
    ),
    merge(this.followSuccess$, this.unfollowSuccess$).pipe(
      map(
        (result): ArticleState => ({
          ...this.state(),
          article: { ...this.article(), author: result.profile },
        }),
      ),
    ),
    merge(this.favoriteSuccess$, this.unfavoriteSuccess$).pipe(
      map(
        (result): ArticleState => ({
          ...this.state(),
          article: { ...this.article(), ...result.article },
        }),
      ),
    ),
  );

  connection$ = merge(
    connectSource(this.state, this.newState$),
    this.commentStateService.connection$,
  ).pipe(share({ resetOnRefCountZero: () => timer(1000) }));
}
