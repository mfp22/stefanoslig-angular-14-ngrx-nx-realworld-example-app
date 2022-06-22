import { Injectable } from '@angular/core';
import { Action, AdaptCommon, Source } from '@state-adapt/core';
import { Observable } from 'rxjs';
import { formsAdapter, FormsState } from './forms.adapter';
import { Errors } from './forms.interfaces';

@Injectable({ providedIn: 'root' })
export class NgrxFormsFacade {
  constructor(private adapt: AdaptCommon) {}

  createFormStore(featureName: string, initialState: FormsState, errors$?: Observable<Action<Errors>>) {
    const sources = { errors$ };

    const store = this.adapt.init([`${featureName}.form`, formsAdapter, initialState], {
      setErrors: sources.errors$ || [],
    });

    return { sources, store };
  }
}
