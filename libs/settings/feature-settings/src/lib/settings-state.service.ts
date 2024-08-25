import { Injectable, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Validators } from '@angular/forms';
import { AuthStateService } from '@realworld/auth/feature-auth';
import {
  Field,
  FormStateBase,
  initialFormState,
} from '@realworld/core/forms';
import { connectSource } from '@realworld/signals';
import { map, merge } from 'rxjs';

const structure: Field[] = [
  {
    type: 'INPUT',
    name: 'image',
    placeholder: 'URL of profile picture',
    validator: [],
  },
  {
    type: 'INPUT',
    name: 'username',
    placeholder: 'Your Name',
    validator: [Validators.required],
  },
  {
    type: 'TEXTAREA',
    name: 'bio',
    placeholder: 'Short bio about you',
    validator: [],
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
    placeholder: 'New Password',
    validator: [Validators.required],
    attrs: {
      type: 'password',
    },
  },
];

@Injectable({ providedIn: 'root' })
export class SettingsStateService extends FormStateBase {
  authStateService = inject(AuthStateService);

  constructor() {
    super(signal({ ...initialFormState, structure }));
    const newState$ = toObservable(
      this.authStateService.user,
    ).pipe(map((user) => ({ ...this.state(), data: user })));
    this.connection$ = merge(
      this.connection$,
      this.authStateService.connection$,
      connectSource(this.state, newState$),
    );
  }
}
