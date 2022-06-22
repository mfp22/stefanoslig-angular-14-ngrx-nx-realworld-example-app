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

const initialState = { ...formsInitialState, structure };

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, ListErrorsComponent, DynamicFormComponent, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  storeContainer = this.ngrxFormsFacade.createFormStore('register', initialState, this.facade.loginOrRegisterError$);
  store = this.storeContainer.store;
  structure$ = this.store.structure$;
  data$ = this.store.data$;
  errors$ = this.store.errors$;

  submit$ = this.facade.registerRequest$;

  constructor(private ngrxFormsFacade: NgrxFormsFacade, private facade: AuthFacade) {}
}
