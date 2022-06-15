import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthFacade } from '@realworld/auth/data-access/src';
import { Article } from '@realworld/core/api-types/src';
import {
  Action,
  AdaptCommon,
  getHttpActions,
  getHttpSources,
  joinSelectors,
  Source,
  splitHttpSources,
} from '@state-adapt/core';
import { BehaviorSubject, concatMap, exhaustMap, filter, map, Observable, share, switchMap, tap } from 'rxjs';
import { ActionsService } from '../services/actions.service';
import { ArticlesService } from '../services/articles.service';
import {
  articleListAdapter,
  ArticleListConfig,
  articleListInitialState,
  ArticleListState,
  initialListConfig,
  ListType,
} from './article-list/article-list.adapter';
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
  publishArticleRequestError$ = this.publishArticleRequest.error$.pipe(
    map(action => ({ ...action, payload: { error: action.payload } })),
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

  articleStore = this.adapt.init(['article', articleAdapter, articleInitialState], {
    receiveArticle: this.articleRequest.success$,
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

  // Article List
  listChange$ = new Source<ListType | undefined>('[Article List] listChange$');
  listTagChange$ = new Source<string>('[Article List] listTagChange$');
  listPageChange$ = new Source<number>('[Article List] listPageChange$');
  listConfigChange$ = new Source<ArticleListConfig>('[Article List] listConfigChange$');

  listConfigSpy = this.adapt.spy('articleList', articleListAdapter);
  listConfig$ = joinSelectors(
    [this.authFacade.store, 'loggedIn'],
    [this.listConfigSpy, 'listConfig'],
    (loggedIn, config) =>
      config?.type !== 'DEFAULT' ? config : { ...config, type: (loggedIn ? 'FEED' : 'ALL') as ListType },
  ).state$;
  articleListRequest$ = this.listConfig$.pipe(
    switchMap(config => getHttpActions(this.articlesService.query(config), res => [!!res, res, 'Error'])),
  );
  articleListRequest = splitHttpSources('[Article List]', this.articleListRequest$);

  constructor(
    private router: Router,
    private adapt: AdaptCommon<any>,
    private articlesService: ArticlesService,
    private actionsService: ActionsService,
    private authFacade: AuthFacade,
  ) {}

  createArticleListStore(listConfig: ArticleListConfig = initialListConfig) {
    const initialState: ArticleListState = { ...articleListInitialState, listConfig };
    return this.adapt.init(['articleList', articleListAdapter, initialState], {
      setListType: this.listChange$,
      setListPage: this.listPageChange$,
      setListConfig: this.listConfigChange$,
      awaitArticles: this.articleListRequest.request$ as Observable<Action<any>>,
      receiveArticles: this.articleListRequest.success$,
      articlesError: this.articleListRequest.error$,
      updateArticle: [this.favoriteRequest.success$, this.unfavoriteRequest.success$],
    });
  }
}
