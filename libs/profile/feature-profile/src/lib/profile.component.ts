import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { AuthStateService } from '@realworld/auth/feature-auth';
import { injectAutoSignal, memo } from '@realworld/signals';
import { ProfileStateService } from './profile-state.service';

@UntilDestroy()
@Component({
  standalone: true,
  selector: 'cdt-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  currentUser = injectAutoSignal(AuthStateService).user;
  profile = injectAutoSignal(ProfileStateService);
  isUser = memo(
    () =>
      this.profile.username() === this.currentUser().username,
  );
}
