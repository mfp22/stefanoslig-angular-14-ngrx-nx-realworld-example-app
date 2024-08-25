import { Injectable, inject, signal } from '@angular/core';
import { Validators } from '@angular/forms';
import { AuthService } from '@realworld/auth/data-access/src/lib/services/auth.service';
import {
  Field,
  FormStateBase,
  initialFormState,
} from '@realworld/core/forms';
import { connectSource } from '@realworld/signals';
import {
  filterError,
  filterSuccess,
} from '@realworld/core/http-client';
import { Subject, exhaustMap, map, merge, share } from 'rxjs';

const structure: Field[] = [
  {
    type: 'INPUT',
    name: 'email',
    placeholder: 'Username',
    validator: [Validators.required],
  },
  {
    type: 'INPUT',
    name: 'password',
    placeholder: 'Password',
    validator: [Validators.required],
    attrs: {
      type: 'password',
    },
  },
];

@Injectable({ providedIn: 'root' })
export class LoginStateService extends FormStateBase {
  authService = inject(AuthService);

  login$ = new Subject<void>();
  loginResult$ = this.login$.pipe(
    exhaustMap(() => this.authService.login(this.data())),
    share(),
  );
  loginSuccess$ = this.loginResult$.pipe(filterSuccess);
  loginFailure$ = this.loginResult$.pipe(filterError);

  constructor() {
    super(signal({ ...initialFormState, structure }));
    const newState$ = this.loginFailure$.pipe(
      map((result) => ({
        ...this.state(),
        errors: result.errors,
      })),
    );
    this.connection$ = merge(
      this.connection$,
      connectSource(this.state, newState$),
    );
  }
}
