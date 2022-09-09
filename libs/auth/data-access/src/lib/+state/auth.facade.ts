import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { getHttpSources, Source, toSource } from '@state-adapt/rxjs';
import { adapt } from '@state-adapt/angular';
import { exhaustMap, Subject, tap } from 'rxjs';
import { filter, map, mergeWith, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { LocalStorageJwtService } from '../services/local-storage-jwt.service';
import { authAdapter, authInitialState } from './auth.adapter';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  markUserAsStale$ = new Subject<void>();
  userRequest$ = this.localStorageJwtService.getItem().pipe(
    filter(token => !!token),
    mergeWith(this.markUserAsStale$),
    switchMap(() => this.authService.fetchUser()),
  );
  userRequest = getHttpSources('[Auth]', this.userRequest$, res => [!!res, res, 'Empty response']);

  loginRequest$ = new Source<any>('[Auth] loginRequest$');
  login$ = this.loginRequest$.pipe(exhaustMap(({ payload }) => this.authService.login(payload)));
  loginRequest = getHttpSources('[Auth]', this.login$, res => [!!res, res, 'Empty response']);

  registerRequest$ = new Source<any>('[Auth] registerRequest$');
  register$ = this.registerRequest$.pipe(exhaustMap(({ payload }) => this.authService.register(payload)));
  registerRequest = getHttpSources('[Auth]', this.register$, res => [!!res, res, 'Empty response']);

  loginOrRegisterSuccess$ = this.loginRequest.success$.pipe(
    mergeWith(this.registerRequest.success$),
    tap(({ payload: user }) => {
      this.localStorageJwtService.setItem(user.token);
      this.router.navigateByUrl('/');
    }),
  );
  loginOrRegisterError$ = this.loginRequest.error$.pipe(
    mergeWith(this.registerRequest.error$),
    map(action => ({ ...action, payload: { auth: action.payload } })),
  );

  logout$ = new Subject<void>();
  logoutSource$ = this.logout$.pipe(
    tap(() => {
      this.localStorageJwtService.removeItem();
      this.router.navigateByUrl('login');
    }),
    toSource('[Auth] logout$'),
  );

  store = adapt(['auth', authInitialState, authAdapter], {
    receiveUser: [this.userRequest.success$, this.loginOrRegisterSuccess$],
    setInProgress: [this.loginRequest$, this.registerRequest$],
    resetStatus: [this.loginOrRegisterSuccess$, this.loginOrRegisterError$],
    reset: [this.userRequest.error$, this.logoutSource$],
  });

  auth$ = this.store.state$;
  user$ = this.store.user$;
  isLoggedIn$ = this.store.loggedIn$;

  constructor(
    private authService: AuthService,
    private localStorageJwtService: LocalStorageJwtService,
    private router: Router,
  ) {}
}
