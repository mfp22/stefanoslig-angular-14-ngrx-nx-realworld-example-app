import { Injectable } from '@angular/core';
import { Action, Source } from '@state-adapt/core';
import { Adapt } from '@state-adapt/ngrx';
import { Observable } from 'rxjs';
import { formsAdapter, FormsState } from './forms.adapter';
import { Errors } from './forms.interfaces';

@Injectable({ providedIn: 'root' })
export class NgrxFormsFacade {
  constructor(private adapt: Adapt) {}

  createFormStore(featureName: string, initialState: FormsState, errors$?: Observable<Action<Errors>>) {
    const sources = {
      formUpdate$: new Source<any>(`[${featureName}] formUpdate$`),
      setUntouched$: new Source<void>(`[${featureName}] setUntouched$`),
      errors$,
    };

    const store = this.adapt.init([`${featureName}.form`, formsAdapter, initialState], {
      updateData: sources.formUpdate$,
      setUntouched: sources.setUntouched$,
      setErrors: sources.errors$, // || [],
    });

    return { sources, store };
  }
}
