import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthFacade } from '@realworld/auth/data-access';
import { ErrorHandlerFacade } from '@realworld/core/error-handler/src/lib/+state/error-handler.facade';
import { FooterComponent } from './layout/footer/footer.component';
import { NavbarComponent } from './layout/navbar/navbar.component';

@Component({
  selector: 'conduit-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [FooterComponent, NavbarComponent, RouterModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  user$ = this.authFacade.user$;
  isLoggedIn$ = this.authFacade.isLoggedIn$;

  constructor(private authFacade: AuthFacade, private errorHandler: ErrorHandlerFacade) {
    this.errorHandler.state$.subscribe();
  }
}
