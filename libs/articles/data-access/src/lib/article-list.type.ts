import { Article } from '@realworld/core/api-types';

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

export type ListType = 'ALL' | 'FEED';

export interface Articles {
  entities: Article[];
  articlesCount: number;
  loaded: boolean;
  loading: boolean;
}
