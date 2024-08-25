import {
  Injectable,
  inject,
  signal,
  untracked,
} from '@angular/core';
import {
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { Article } from '@realworld/core/api-types';
import { connectSource, memo } from '@realworld/signals';
import {
  Observable,
  Subject,
  debounceTime,
  filter,
  map,
  merge,
  share,
  switchMap,
} from 'rxjs';
import { ArticlesService } from '../../services/articles.service';
import {
  filterError,
  filterSuccess,
} from '@realworld/core/http-client';
import { NavigationEnd, Router } from '@angular/router';
import { AuthStateService } from '@realworld/auth/feature-auth';
import {
  ArticleListConfig,
  Articles,
  ListType,
} from '../../article-list.type';
import { ArticlesSources } from '../../articles.sources';
import { TagService } from '../../tag.service';

export interface ArticleListState {
  listConfig: ArticleListConfig;
  articles: Articles;
  tags: string[];
}

export const articleListInitialState: ArticleListState = {
  listConfig: {
    type: 'ALL',
    currentPage: 1,
    filters: {
      limit: 10,
    },
  },
  articles: {
    entities: [],
    articlesCount: 0,
    loaded: false,
    loading: true,
  },
  tags: [],
};

@Injectable({ providedIn: 'root' })
export class ArticleListStateService {
  router = inject(Router);
  articlesService = inject(ArticlesService);
  articlesSources = inject(ArticlesSources);
  authStateService = inject(AuthStateService);
  tagService = inject(TagService);

  state = signal(articleListInitialState);
  listConfig = memo(() => this.state().listConfig);
  filters = memo(() => this.listConfig().filters);
  articles = memo(() => this.state().articles);
  articlesCount = memo(() => this.articles().articlesCount);
  articlesLoading = memo(() => this.articles().loading);
  totalPages = memo(() => {
    return Array.from(
      new Array(
        Math.ceil(
          this.articlesCount() / (this.filters()?.limit ?? 1),
        ),
      ),
      (val, index) => index + 1,
    );
  });
  tags = memo(() => this.state().tags);

  url$ = this.router.events.pipe(
    filter(
      (event): event is NavigationEnd =>
        event instanceof NavigationEnd,
    ),
    map((event) => event.urlAfterRedirects),
  );
  url = toSignal(this.url$, { initialValue: location.pathname });
  urlListConfig = memo(() => {
    const [, baseRoute, username, subRoute] =
      this.url().split('/');
    const filters =
      baseRoute === 'profile'
        ? subRoute === 'favorites'
          ? { favorited: username }
          : { author: username }
        : untracked(() => this.filters());
    const type =
      baseRoute === 'profile' ||
      !this.authStateService.loggedIn()
        ? 'ALL'
        : 'FEED';
    return {
      ...untracked(() => this.listConfig()),
      type,
      filters,
    } as const;
  });
  urlListConfig$ = toObservable(this.urlListConfig).pipe(
    share(),
  );

  articles$ = toObservable(this.listConfig).pipe(
    debounceTime(100),
    switchMap((config) => this.articlesService.query(config)),
    share(),
  );
  articlesSuccess$ = this.articles$.pipe(filterSuccess, share());
  articlesFailure$ = this.articles$.pipe(filterError, share());

  tagChange$ = new Subject<string>();
  listTypeChange$ = new Subject<ListType>();
  listPageChange$ = new Subject<number>();

  newState$: Observable<ArticleListState> = merge(
    this.urlListConfig$.pipe(
      map(
        (listConfig): ArticleListState => ({
          ...this.state(),
          listConfig,
        }),
      ),
    ),
    this.articlesSuccess$.pipe(
      map((result): ArticleListState => {
        const articles = {
          entities: result.articles,
          articlesCount: result.articlesCount,
          loading: false,
          loaded: true,
        };
        return { ...this.state(), articles };
      }),
    ),
    this.articlesFailure$.pipe(
      map((): ArticleListState => {
        const articles = {
          entities: [],
          articlesCount: 0,
          loading: false,
          loaded: false,
        };
        return { ...this.state(), articles };
      }),
    ),
    this.tagChange$.pipe(
      map(
        (tag): ArticleListState => ({
          ...this.state(),
          listConfig: {
            ...articleListInitialState.listConfig,
            filters: {
              ...articleListInitialState.listConfig.filters,
              tag,
            },
          },
          articles: {
            ...this.articles(),
            loading: true,
          },
        }),
      ),
    ),
    this.listTypeChange$.pipe(
      map(
        (type): ArticleListState => ({
          ...this.state(),
          listConfig: {
            ...articleListInitialState.listConfig,
            type,
            filters: {
              ...articleListInitialState.listConfig.filters,
              offset: 0,
            },
          },
          articles: {
            ...this.articles(),
            loading: true,
          },
        }),
      ),
    ),
    this.listPageChange$.pipe(
      map(
        (page): ArticleListState => ({
          ...this.state(),
          listConfig: {
            ...this.listConfig(),
            currentPage: page,
            filters: {
              ...this.filters(),
              offset: (this.filters()?.limit ?? 10) * (page - 1),
            },
          },
          articles: {
            ...this.articles(),
            loading: true,
          },
        }),
      ),
    ),
    merge(
      this.articlesSources.favoriteSuccess$,
      this.articlesSources.unfavoriteSuccess$,
    ).pipe(
      map((result) => ({
        ...this.state(),
        articles: replaceArticle(
          this.articles(),
          result.article,
        ),
      })),
    ),
    this.tagService.getTags().pipe(
      map(
        ({ tags }): ArticleListState => ({
          ...this.state(),
          tags,
        }),
      ),
    ),
  );

  connection$ = merge(
    connectSource(this.state, this.newState$),
    this.authStateService.connection$,
  );
}

function replaceArticle(
  articles: Articles,
  payload: Article,
): Articles {
  const articleIndex = articles.entities.findIndex(
    (a) => a.slug === payload.slug,
  );
  const entities = [
    ...articles.entities.slice(0, articleIndex),
    Object.assign({}, articles.entities[articleIndex], payload),
    ...articles.entities.slice(articleIndex + 1),
  ];
  return { ...articles, entities, loading: false, loaded: true };
}
