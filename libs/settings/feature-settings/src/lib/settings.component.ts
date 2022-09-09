import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthFacade } from '@realworld/auth/data-access';
import { authInitialState } from '@realworld/auth/data-access/src/lib/+state/auth.adapter';
import { DynamicFormComponent, Field, ListErrorsComponent, NgrxFormsFacade } from '@realworld/core/forms';
import { formsInitialState } from '@realworld/core/forms/src/lib/+state/forms.adapter';
import { SettingsService } from '@realworld/settings/data-access/src';
import { getHttpSources, joinStores } from '@state-adapt/rxjs';
import { concatMap, map, Subject, tap, withLatestFrom } from 'rxjs';

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

const initialState = { ...formsInitialState, structure, data: authInitialState };

@Component({
  standalone: true,
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  imports: [CommonModule, DynamicFormComponent, ListErrorsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  submit$ = new Subject<any>();
  submitRequest$ = this.submit$.pipe(
    withLatestFrom(this.authFacade.user$),
    concatMap(([data, user]) => {
      const mergedData = {
        ...user,
        image: data.image,
        username: data.username,
        bio: data.bio,
        pass: data.pass,
        email: data.email,
      };
      return this.settingsService.update(mergedData);
    }),
    tap(result => {
      this.authFacade.markUserAsStale$.next();
      this.router.navigate(['profile', result.user.username]);
    }),
  );
  submitRequest = getHttpSources('Settings', this.submitRequest$, res => [!!res, res, 'No response']);

  error$ = this.submitRequest.error$.pipe(map(action => ({ ...action, payload: { error: action.payload } })));
  storeContainer = this.ngrxFormsFacade.createFormStore('settings', initialState, this.error$);

  store = this.storeContainer.store;
  errors$ = this.store.errors$;
  structure$ = this.store.structure$;
  data$ = joinStores({ auth: this.authFacade.store, form: this.store })({
    data: s => (s.form.data.username ? s.form.data : s.auth.user),
  })().data$;

  logout$ = this.authFacade.logout$;

  constructor(
    private router: Router,
    private settingsService: SettingsService,
    private authFacade: AuthFacade,
    private ngrxFormsFacade: NgrxFormsFacade,
  ) {}
}
