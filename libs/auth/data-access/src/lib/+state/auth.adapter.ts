import { User } from '@realworld/core/api-types/src';
import { createAdapter } from '@state-adapt/core';

export interface AuthState {
  loggedIn: boolean;
  user: User;
  status: Status;
}

export enum Status {
  INIT = 'INIT',
  IN_PROGRESS = 'IN_PROGRESS',
}

export const authInitialState: AuthState = {
  loggedIn: false,
  status: Status.INIT,
  user: {
    email: '',
    token: '',
    username: '',
    bio: '',
    image: '',
  },
};

const receiveUser = (state: AuthState, user: User) => ({ ...state, loggedIn: true, user });

export const authAdapter = createAdapter<AuthState>()({
  receiveUser,
  setInProgress: state => ({ ...state, status: Status.IN_PROGRESS }),
  resetStatus: state => ({ ...state, status: Status.IN_PROGRESS }),
  selectors: {
    user: state => state.user,
    loggedIn: state => state.loggedIn,
  },
});
