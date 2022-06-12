import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { AuthFacade } from '@realworld/auth/data-access';
import { ProfileFacade } from '@realworld/profile/data-access';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@UntilDestroy()
@Component({
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  store = this.facade.createProfileStore(this.route.params.pipe(map(params => params['username'])));

  followToggleRequest$ = this.store.sources.followToggleRequest$;

  profile$ = this.store.store.state$;
  currentUser$ = this.authFacade.user$;
  isUser$ = combineLatest([this.profile$, this.currentUser$]).pipe(map(([p, u]) => p.username === u.username));

  constructor(private route: ActivatedRoute, private facade: ProfileFacade, private authFacade: AuthFacade) {}
}
