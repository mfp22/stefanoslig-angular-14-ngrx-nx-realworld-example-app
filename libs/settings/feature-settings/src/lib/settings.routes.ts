import { Routes } from '@angular/router';
import { AuthGuardService } from '@realworld/auth/data-access';
import { SettingsComponent } from './settings.component';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    component: SettingsComponent,
    canActivate: [AuthGuardService],
  },
];
