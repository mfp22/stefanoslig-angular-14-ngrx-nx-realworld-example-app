import { Article } from '@realworld/core/api-types/src';
import { createAdapter } from '@state-adapt/core';

export const articleListFeatureKey = 'articles-list';

export interface ArticleListState {
  listConfig: ArticleListConfig;
  articles: Articles;
}

export interface ArticleListConfig {
  type: ListType;
  currentPage: number;
  filters: Filters;
}

export interface Filters {
  tag?: string;
  author?: string;
  favorited?: string;
  limit?: number;
  offset?: number;
}

export type ListType = 'DEFAULT' | 'ALL' | 'FEED';

export interface Articles {
  entities: Article[];
  articlesCount: number;
  loaded: boolean;
  loading: boolean;
}

export const initialListConfig: ArticleListConfig = {
  type: 'DEFAULT',
  currentPage: 1,
  filters: {
    limit: 10,
  },
};

export const articleListInitialState: ArticleListState = {
  listConfig: initialListConfig,
  articles: {
    entities: [],
    articlesCount: 0,
    loaded: false,
    loading: false,
  },
};

export const articleListAdapter = createAdapter<ArticleListState>()({
  setListPage: (state, page: number) => {
    const filters = {
      ...state.listConfig.filters,
      offset: state?.listConfig?.filters?.limit ?? 1 * (page - 1),
    };
    const listConfig = {
      ...state.listConfig,
      currentPage: page,
      filters,
    };
    return { ...state, listConfig };
  },
  setListConfig: (state, listConfig: ArticleListConfig) => ({ ...state, listConfig }),
  setListType: (state, type: ListType = 'ALL') => ({ ...state, listConfig: { ...state.listConfig, type } }),
  setListTag: (state, tag: string) => ({
    ...state,
    listConfig: { ...state.listConfig, filters: { ...state.listConfig.filters, tag } },
  }),
  awaitArticles: state => ({ ...state, articles: { ...state.articles, loading: true } }),
  receiveArticles: (state, { articles, articlesCount }: { articles: Article[]; articlesCount: number }) => ({
    ...state,
    articles: {
      ...state.articles,
      entities: articles,
      articlesCount: articlesCount,
      loading: false,
      loaded: true,
    },
  }),
  articlesError: state => ({
    ...state,
    articles: {
      ...state.articles,
      entities: [],
      articlesCount: 0,
      loading: false,
      loaded: true,
    },
  }),
  updateArticle: (state, article: Article) => ({
    ...state,
    articles: {
      ...state.articles,
      entities: state.articles.entities.map(entity =>
        entity.slug !== article.slug ? entity : { ...entity, ...article },
      ),
      loading: false,
      loaded: true,
    },
  }),
  selectors: {
    listConfig: state => state.listConfig,
    articles: state => state.articles.entities,
    isLoading: state => state.articles.loading,
    articlesCount: state => state.articles.articlesCount,
    totalPages: ({ listConfig, articles }) =>
      Array.from(
        new Array(Math.ceil(articles.articlesCount / (listConfig?.filters?.limit ?? 1))),
        (val, index) => index + 1,
      ),
  },
});
