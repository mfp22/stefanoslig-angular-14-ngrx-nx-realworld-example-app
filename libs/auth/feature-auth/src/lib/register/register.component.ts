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
import { RegisterStateService } from './register-state.service';

@Component({
  selector: 'cdt-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    CommonModule,
    DynamicFormComponent,
    RouterModule,
    ListErrorsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  store = injectAutoSignal(RegisterStateService);
}
