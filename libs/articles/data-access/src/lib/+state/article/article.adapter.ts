import { Article, Comment, Profile } from '@realworld/core/api-types/src';

import { createAdapter } from '@state-adapt/core';
export interface ArticleState {
  data: Article;
  comments: Comment[];
  loading: boolean;
  loaded: boolean;
}

export const articleInitialState: ArticleState = {
  data: {
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

export const articleAdapter = createAdapter<ArticleState>()({
  noop: state => state,
  receiveArticle: (state, article: Article) => ({
    ...state,
    data: article,
    loaded: true,
    loading: false,
  }),
  resetArticle: state => ({
    ...state,
    data: articleInitialState.data,
    loaded: false,
    loading: false,
  }),
  addComment: (state, comment: Comment) => ({ ...state, comments: [...state.comments, comment] }),
  deleteComment: (state, id: number) => ({ ...state, comments: state.comments.filter(comment => comment.id !== id) }),
  receiveComments: (state, comments: Comment[]) => ({ ...state, comments }),
  resetComments: state => ({ ...state, comments: articleInitialState.comments }),
  setAuthor: (state, author: Profile) => ({ ...state, data: { ...state.data, author } }),
  setArticle: (state, data: Article) => ({ ...state, data }),
  selectors: {
    article: state => state.data,
    comments: state => state.comments,
    articleLoaded: state => state.loaded,
    authorUsername: state => state.data.author.username,
  },
});
