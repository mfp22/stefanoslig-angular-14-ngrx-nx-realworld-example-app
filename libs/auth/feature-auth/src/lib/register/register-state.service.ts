import { Injectable, inject, signal } from '@angular/core';
import { Validators } from '@angular/forms';
import { AuthService } from '@realworld/auth/data-access';
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
    name: 'username',
    placeholder: 'Username',
    validator: [Validators.required],
  },
  {
    type: 'INPUT',
    name: 'email',
    placeholder: 'Email',
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
export class RegisterStateService extends FormStateBase {
  authService = inject(AuthService);

  register$ = new Subject<void>();
  registerResult$ = this.register$.pipe(
    exhaustMap(() => this.authService.register(this.data())),
    share(),
  );
  registerSuccess$ = this.registerResult$.pipe(filterSuccess);
  registerFailure$ = this.registerResult$.pipe(filterError);

  constructor() {
    super(signal({ ...initialFormState, structure }));
    const newState$ = this.registerFailure$.pipe(
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
