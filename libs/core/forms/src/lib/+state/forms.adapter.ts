import { createAdapter } from '@state-adapt/core';
import { Errors, Field } from './forms.interfaces';

export interface FormsState {
  data: any;
  structure: Field[];
  valid: boolean;
  errors: Errors;
  touched: boolean;
}

export const formsInitialState: FormsState = {
  data: {},
  structure: [],
  valid: true,
  errors: {},
  touched: false,
};

export const formsAdapter = createAdapter<FormsState>()({
  setData: (state, data: any) => ({ ...state, data, erros: {} }),
  updateData: (state, data: any) => ({ ...state, data: { ...state.data, ...data }, errors: {} }),
  setErrors: (state, errors: Errors) => ({ ...state, errors }),
  resetErrors: state => ({ ...state, errors: {} }),
  setUntouched: state => ({ ...state, touched: false }),
  selectors: {
    data: state => state.data,
    structure: state => state.structure,
    errors: state => state.errors,
    touched: state => state.touched,
  },
});
