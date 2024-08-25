import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  LocalStorageJwtService,
  localStorageKey,
} from '@realworld/auth/data-access';
import { AuthService } from '@realworld/auth/data-access/src/lib/services/auth.service';
import { User } from '@realworld/core/api-types';
import {
  filterError,
  filterSuccess,
} from '@realworld/core/http-client';
import { connectSource, memo } from '@realworld/signals';
import {
  Subject,
  exhaustMap,
  filter,
  map,
  merge,
  share,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { LoginStateService } from './login/login-state.service';
import { RegisterStateService } from './register/register-state.service';

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
  loggedIn: localStorage.getItem(localStorageKey) !== null, // token needs to be verified, but this is just for UI smoothness
  status: Status.INIT,
  user: {
    email: '',
    token: '',
    username: '',
    bio: '',
    image: '',
  },
};

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  router = inject(Router);
  localStorageJwtService = inject(LocalStorageJwtService);
  loginStateService = inject(LoginStateService);
  registerStateService = inject(RegisterStateService);
  authService = inject(AuthService);

  state = signal(authInitialState);
  loggedIn = memo(() => this.state().loggedIn);
  status = memo(() => this.state().status);
  user = memo(() => this.state().user);

  user$ = this.localStorageJwtService.getItem().pipe(
    take(1),
    filter((token) => !!token),
    switchMap(() => this.authService.user()),
    share(),
  );
  userSuccess$ = this.user$.pipe(filterSuccess);
  userFailure$ = this.user$.pipe(filterError);

  userUpdate$ = new Subject<User>();
  updatedUser$ = this.userUpdate$.pipe(
    exhaustMap((user) => this.authService.update(user)),
    filterSuccess,
    share(),
  );

  userWithEffect$ = merge(
    this.loginStateService.loginSuccess$,
    this.registerStateService.registerSuccess$,
    this.updatedUser$,
  ).pipe(
    tap((response) => {
      this.localStorageJwtService.setItem(response.user.token);
      const dest = this.router.url.includes('settings')
        ? ['profile', response.user.username]
        : ['/'];
      this.router.navigate(dest);
    }),
  );

  logout$ = new Subject<void>();
  logoutWithEffect$ = this.logout$.pipe(
    tap(() => {
      this.localStorageJwtService.removeItem();
      this.router.navigateByUrl('login');
    }),
  );

  newState$ = merge(
    this.userSuccess$.pipe(
      map(({ user }) => ({ loggedIn: true, user })),
    ),
    merge(this.userFailure$, this.logoutWithEffect$).pipe(
      map(() => ({ ...authInitialState, loggedIn: false })),
    ),
    merge(
      this.loginStateService.login$,
      this.registerStateService.register$,
    ).pipe(map(() => ({ status: Status.IN_PROGRESS }))),
    this.userWithEffect$.pipe(
      map(({ user }) => ({
        loggedIn: true,
        status: Status.INIT,
        user,
      })),
    ),
    merge(
      this.loginStateService.loginFailure$,
      this.registerStateService.registerFailure$,
    ).pipe(map(() => ({ status: Status.INIT }))),
  );

  connection$ = connectSource(this.state, this.newState$);
}
