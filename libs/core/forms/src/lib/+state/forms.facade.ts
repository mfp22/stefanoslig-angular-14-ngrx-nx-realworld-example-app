import { Injectable } from '@angular/core';
import { adapt } from '@state-adapt/angular';
import { Action } from '@state-adapt/core';
import { Observable } from 'rxjs';
import { formsAdapter, FormsState } from './forms.adapter';
import { Errors } from './forms.interfaces';

@Injectable({ providedIn: 'root' })
export class NgrxFormsFacade {
  createFormStore(featureName: string, initialState: FormsState, errors$?: Observable<Action<Errors>>) {
    const sources = { errors$ };

    const store = adapt([`${featureName}.form`, initialState, formsAdapter], {
      setErrors: sources.errors$ || [],
    });

    return { sources, store };
  }
}
