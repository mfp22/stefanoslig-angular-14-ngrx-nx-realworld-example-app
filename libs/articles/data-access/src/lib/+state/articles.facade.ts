import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Article } from '@realworld/core/api-types/src';
import { Action, getHttpSources, Source } from '@state-adapt/core';
import { Adapt } from '@state-adapt/ngrx';
import { BehaviorSubject, concatMap, exhaustMap, filter, map, Observable, switchMap, tap } from 'rxjs';
import { ActionsService } from '../services/actions.service';
import { ArticlesService } from '../services/articles.service';
import { articleListActions } from './article-list/article-list.actions';
import { ArticleListConfig } from './article-list/article-list.reducer';
import { articleListQuery } from './article-list/article-list.selectors';
import { articleAdapter, articleInitialState } from './article/article.adapter';

@Injectable({ providedIn: 'root' })
export class ArticlesFacade {
  articleSlugUpdate$ = new BehaviorSubject(''); // Need from resolver or components (from router)
  articleSlug$ = this.articleSlugUpdate$.pipe(filter(s => !!s));
  articleRequest$ = this.articleSlug$.pipe(switchMap(slug => this.articlesService.getArticle(slug)));
  articleRequest = getHttpSources('[Article]', this.articleRequest$, res => [!!res, res.article, 'Error']);

  commentsRequest$ = this.articleSlug$.pipe(switchMap(slug => this.articlesService.getComments(slug)));
  commentsRequest = getHttpSources('[Article] [Comments]', this.commentsRequest$, res => [
    !!res,
    res.comments,
    'Error',
  ]);

  publishArticle$ = new Source<Article>('[Article] publishArticle$');
  publishArticleRequest = getHttpSources(
    '[Article] publishArticle$',
    this.publishArticle$.pipe(exhaustMap(({ payload }) => this.articlesService.publishArticle(payload))),
    res => [!!res, res.article, 'Error'],
  );
  publishArticleSuccess$ = this.publishArticleRequest.success$.pipe(
    tap(({ payload }) => this.router.navigate(['article', payload.slug])),
  );

  deleteArticle$ = new Source<string>('[Article] deleteArticle$');
  deleteArticleRequest = getHttpSources(
    '[Article] deleteArticle$',
    this.deleteArticle$.pipe(concatMap(({ payload: slug }) => this.articlesService.deleteArticle(slug))),
    () => [true, null, 'Error'],
  );
  deleteArticleSuccess$ = this.deleteArticleRequest.success$.pipe(tap(() => this.router.navigate(['/'])));

  addComment$ = new Source<{ slug: string; comment: string }>('[Article] [Comments] addComment$');
  addCommentRequest = getHttpSources(
    '[Article] [Comments]',
    this.addComment$.pipe(
      exhaustMap(({ payload: { slug, comment } }) => this.articlesService.addComment(slug, comment)),
    ),
    res => [!!res, res.comment, 'Error'],
  );
  addCommentError$ = this.addCommentRequest.error$.pipe(
    map(action => ({ ...action, payload: { addComment: action.payload } })),
  );

  deleteComment$ = new Source<{ slug: string; commentId: number }>('[Article] [Comments] deleteComment$');
  deleteCommentRequest = getHttpSources(
    '[Article] [Comments] deleteComment$',
    this.deleteComment$.pipe(
      concatMap(({ payload: { slug, commentId } }) =>
        this.articlesService.deleteComment(commentId, slug).pipe(map(() => commentId)),
      ),
    ),
    res => [!!res, res, 'Error'],
  );

  follow$ = new Source<string>('[Article] [Author] follow$');
  followRequest = getHttpSources(
    '[Article] [Author] follow$',
    this.follow$.pipe(concatMap(({ payload: username }) => this.actionsService.followUser(username))),
    res => [!!res, res.profile, 'Error'],
  );

  unfollow$ = new Source<string>('[Article] [Author] unfollow$');
  unfollowRequest = getHttpSources(
    '[Article] [Author] unfollow$',
    this.unfollow$.pipe(concatMap(({ payload: username }) => this.actionsService.unfollowUser(username))),
    res => [!!res, res.profile, 'Error'],
  );

  favorite$ = new Source<string>('[Article] favorite$');
  favoriteRequest = getHttpSources(
    '[Article] favorite$',
    this.favorite$.pipe(concatMap(({ payload: slug }) => this.actionsService.favorite(slug))),
    res => [!!res, res.article, 'Error'],
  );

  unfavorite$ = new Source<string>('[Article] unfavorite$');
  unfavoriteRequest = getHttpSources(
    '[Article] unfavorite$',
    this.unfavorite$.pipe(concatMap(({ payload: slug }) => this.actionsService.unfavorite(slug))),
    res => [!!res, res.article, 'Error'],
  );

  articleStore = this.adapt.init(['article2', articleAdapter, articleInitialState], {
    receiveArticle: this.articleRequest.success$.pipe(tap(console.log)),
    resetArticle: this.articleRequest.error$,
    receiveComments: this.commentsRequest.success$,
    resetComments: this.commentsRequest.error$,
    addComment: this.addCommentRequest.success$,
    deleteComment: this.deleteCommentRequest.success$,
    setAuthor: [this.followRequest.success$, this.unfollowRequest.success$],
    setArticle: [this.favoriteRequest.success$, this.unfavoriteRequest.success$],
    noop: [
      this.articleRequest.request$ as Observable<Action<any>>,
      this.publishArticleSuccess$,
      this.deleteArticle$,
      this.deleteArticleRequest.error$,
      this.deleteArticleSuccess$,
      this.addComment$,
      this.deleteComment$,
      this.deleteCommentRequest.error$,
      this.follow$,
      this.followRequest.error$,
      this.unfollow$,
      this.unfollowRequest.error$,
      this.favorite$,
      this.favoriteRequest.error$,
      this.unfavorite$,
      this.unfavoriteRequest.error$,
    ],
  });

  article$ = this.articleStore.article$;
  comments$ = this.articleStore.comments$;
  articleLoaded$ = this.articleStore.articleLoaded$;
  authorUsername$ = this.articleStore.authorUsername$;

  listConfig$ = this.store.select(articleListQuery.selectListConfig);
  articles$ = this.store.select(articleListQuery.selectArticleEntities);
  isLoading$ = this.store.select(articleListQuery.isLoading);
  articlesCount$ = this.store.select(articleListQuery.selectArticlesCount);
  totalPages$ = this.store.select(articleListQuery.selectTotalPages);

  constructor(
    private store: Store,
    private router: Router,
    private adapt: Adapt,
    private articlesService: ArticlesService,
    private actionsService: ActionsService,
  ) {}

  setPage(page: number) {
    this.store.dispatch(articleListActions.setListPage({ page }));
  }
  setListConfig(config: ArticleListConfig) {
    this.store.dispatch(articleListActions.setListConfig({ config }));
  }
}
