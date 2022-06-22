import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthFacade } from '@realworld/auth/data-access';
import { DynamicFormComponent, Field, ListErrorsComponent, NgrxFormsFacade } from '@realworld/core/forms';
import { formsInitialState } from '@realworld/core/forms/src/lib/+state/forms.adapter';

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

const initialState = { ...formsInitialState, structure };

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, ListErrorsComponent, DynamicFormComponent, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  storeContainer = this.ngrxFormsFacade.createFormStore('login', initialState, this.facade.loginOrRegisterError$);
  store = this.storeContainer.store;
  structure$ = this.store.structure$;
  data$ = this.store.data$;
  errors$ = this.store.errors$;

  submit$ = this.facade.loginRequest$;

  constructor(private ngrxFormsFacade: NgrxFormsFacade, private facade: AuthFacade) {}
}
