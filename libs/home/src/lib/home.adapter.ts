import { createAdapter } from '@state-adapt/core';
import { HomeState } from './home.model';

export const homeAdapter = createAdapter<HomeState>()({
  setTags: (state, tags: HomeState['tags']) => ({ ...state, tags }),
  resetTags: state => ({ ...state, tags: [] as HomeState['tags'] }),
  selectors: {
    tags: state => state.tags,
  },
});
