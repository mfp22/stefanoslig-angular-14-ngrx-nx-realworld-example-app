import { Profile } from '@realworld/core/api-types/src';
import { createAdapter } from '@state-adapt/core';

export type ProfileState = Profile;

export const profileInitialState: ProfileState = {
  username: '',
  bio: '',
  image: '',
  following: false,
  loading: false,
};

export const profileAdapter = createAdapter<ProfileState>()({
  request: state => ({ ...state, loading: true }),
  receive: (state, profile: ProfileState) => ({ ...profile, loading: false }),
  selectors: {
    following: state => state.following,
    username: state => state.username,
  },
});
