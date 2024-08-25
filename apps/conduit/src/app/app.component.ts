import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './layout/footer/footer.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { injectAutoSignal } from '@realworld/signals';
import { AuthStateService } from '@realworld/auth/feature-auth';

@Component({
  selector: 'cdt-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    FooterComponent,
    NavbarComponent,
    RouterModule,
    CommonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  store = injectAutoSignal(AuthStateService);
}
