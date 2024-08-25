import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  DynamicFormComponent,
  ListErrorsComponent,
} from '@realworld/core/forms';
import { injectAutoSignal } from '@realworld/signals';
import { LoginStateService } from './login-state.service';

@Component({
  selector: 'cdt-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    DynamicFormComponent,
    RouterModule,
    ListErrorsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  store = injectAutoSignal(LoginStateService);
}
