import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { AuthStateService } from '@realworld/auth/feature-auth';
import {
  DynamicFormComponent,
  ListErrorsComponent,
} from '@realworld/core/forms';
import { injectAutoSignal } from '@realworld/signals';
import { SettingsStateService } from './settings-state.service';

@Component({
  standalone: true,
  selector: 'cdt-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  imports: [
    CommonModule,
    DynamicFormComponent,
    ListErrorsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  authStateService = injectAutoSignal(AuthStateService);
  settingsStateService = injectAutoSignal(SettingsStateService);
}
