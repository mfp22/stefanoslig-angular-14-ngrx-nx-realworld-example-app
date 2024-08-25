import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Article,
  ArticleResponse,
  MultipleCommentsResponse,
  SingleCommentResponse,
} from '@realworld/core/api-types';
import {
  ApiService,
  RequestObservable,
} from '@realworld/core/http-client';
import { ArticleListConfig } from '../article-list.type';

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  constructor(private apiService: ApiService) {}

  getArticle(slug: string): RequestObservable<ArticleResponse> {
    return this.apiService.get<ArticleResponse>(
      '/articles/' + slug,
    );
  }

  getComments(
    slug: string,
  ): RequestObservable<MultipleCommentsResponse> {
    return this.apiService.get<MultipleCommentsResponse>(
      `/articles/${slug}/comments`,
    );
  }

  deleteArticle(slug: string): RequestObservable<void> {
    return this.apiService.delete<void>('/articles/' + slug);
  }

  deleteComment(
    commentId: number,
    slug: string,
  ): RequestObservable<void> {
    return this.apiService.delete<void>(
      `/articles/${slug}/comments/${commentId}`,
    );
  }

  addComment(
    slug: string,
    payload = '',
  ): RequestObservable<SingleCommentResponse> {
    return this.apiService.post<
      SingleCommentResponse,
      { comment: { body: string } }
    >(`/articles/${slug}/comments`, {
      comment: { body: payload },
    });
  }

  query(config: ArticleListConfig): RequestObservable<{
    articles: Article[];
    articlesCount: number;
  }> {
    return this.apiService.get<{
      articles: Article[];
      articlesCount: number;
    }>(
      '/articles' + (config.type === 'FEED' ? '/feed' : ''),
      this.toHttpParams(config.filters),
    );
  }

  publishArticle(
    article: Article,
  ): RequestObservable<ArticleResponse> {
    if (article.slug) {
      return this.apiService.put<
        ArticleResponse,
        ArticleResponse
      >('/articles/' + article.slug, {
        article: article,
      });
    }
    return this.apiService.post<
      ArticleResponse,
      ArticleResponse
    >('/articles/', { article: article });
  }

  // TODO: remove any
  private toHttpParams(params: any) {
    return Object.getOwnPropertyNames(params).reduce(
      (p, key) => p.set(key, params[key]),
      new HttpParams(),
    );
  }
}
