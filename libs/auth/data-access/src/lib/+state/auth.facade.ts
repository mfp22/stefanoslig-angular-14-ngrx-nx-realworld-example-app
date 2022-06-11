import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as fromNgrxForms from '@realworld/core/forms';
import { NgrxFormsFacade } from '@realworld/core/forms/src';
import { getHttpSources, Source, toSource } from '@state-adapt/core';
import { Adapt } from '@state-adapt/ngrx';
import { exhaustMap, Subject, tap, withLatestFrom } from 'rxjs';
import { filter, mergeWith, switchMap } from 'rxjs/operators';
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

  loginRequest$ = new Source<void>('[Auth] loginRequest$');
  login$ = this.loginRequest$.pipe(
    withLatestFrom(this.ngrxFormsFacade.data$),
    exhaustMap(([, data]) => this.authService.login(data)),
  );
  loginRequest = getHttpSources('[Auth]', this.login$, res => [!!res, res, 'Empty response']);

  registerRequest$ = new Source<void>('[Auth] registerRequest$');
  register$ = this.registerRequest$.pipe(
    withLatestFrom(this.ngrxFormsFacade.data$),
    exhaustMap(([, data]) => this.authService.register(data)),
  );
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
    tap(({ payload: err }) => {
      console.log(fromNgrxForms.setErrors({ errors: { err } }));
    }),
  );

  logout$ = new Subject<void>();
  logoutSource$ = this.logout$.pipe(
    tap(() => {
      this.localStorageJwtService.removeItem();
      this.router.navigateByUrl('login');
    }),
    toSource('[Auth] logout$'),
  );

  store = this.adapt.init(['auth2', authAdapter, authInitialState], {
    receiveUser: [this.userRequest.success$, this.loginOrRegisterSuccess$],
    setInProgress: [this.loginRequest$, this.registerRequest$],
    resetStatus: [this.loginOrRegisterSuccess$, this.loginOrRegisterError$],
    reset: [this.userRequest.error$, this.logoutSource$],
  });

  auth$ = this.store.state$;
  user$ = this.store.user$;
  isLoggedIn$ = this.store.loggedIn$;

  constructor(
    private adapt: Adapt,
    private authService: AuthService,
    private ngrxFormsFacade: NgrxFormsFacade,
    private localStorageJwtService: LocalStorageJwtService,
    private router: Router,
  ) {}
}
