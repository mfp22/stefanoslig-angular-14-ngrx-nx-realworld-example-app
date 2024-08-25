import { Errors, Field } from './forms.interfaces';
import { signal } from '@angular/core';
import { Observable, Subject, map, merge } from 'rxjs';
import { connectSource, memo } from '@realworld/signals';

export interface FormState {
  data: any;
  structure: Field[];
  valid: boolean;
  errors: Errors;
  touched: boolean;
}

export const initialFormState: FormState = {
  data: {},
  structure: [],
  valid: true,
  errors: {},
  touched: false,
};

export class FormStateBase {
  data = memo(() => this.state().data);
  errors = memo(() => {
    const e = this.state().errors;
    return Object.keys(e || {}).map((key) => `${key} ${e[key]}`);
  });
  structure = memo(() => this.state().structure);
  touched = memo(() => this.state().touched);
  valid = memo(() => this.state().valid);

  newData$ = new Subject<any>();
  dataUpdate$ = new Subject<any>();
  reset$ = new Subject<void>();

  newState$ = merge(
    this.newData$.pipe(
      map((data) => ({ ...this.state(), data })),
    ),
    this.dataUpdate$.pipe(
      map((data) => ({
        ...this.state(),
        data: { ...this.data(), ...data, touched: true },
      })),
    ),
    this.reset$.pipe(map(() => initialFormState)),
  );

  connection$ = connectSource(
    this.state,
    this.newState$,
  ) as Observable<any>;

  constructor(protected state = signal(initialFormState)) {}
}
