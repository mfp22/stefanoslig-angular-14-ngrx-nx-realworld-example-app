import { Injectable, inject, signal } from '@angular/core';
import { ActionsService } from '@realworld/articles/data-access';
import { Profile } from '@realworld/core/api-types';
import {
  filterError,
  filterSuccess,
} from '@realworld/core/http-client';
import { ProfileService } from '@realworld/profile/data-access';
import { connectSource, memo } from '@realworld/signals';
import {
  BehaviorSubject,
  Subject,
  distinctUntilChanged,
  exhaustMap,
  filter,
  map,
  merge,
  share,
  switchMap,
  timer,
} from 'rxjs';

export type State = Profile;

export const initialState: State = {
  username: '',
  bio: '',
  image: '',
  following: false,
  loading: true,
};

@Injectable({ providedIn: 'root' })
export class ProfileStateService {
  actionsService = inject(ActionsService);
  profileService = inject(ProfileService);

  state = signal(initialState);
  username = memo(() => this.state().username);
  bio = memo(() => this.state().bio);
  image = memo(() => this.state().image);
  following = memo(() => this.state().following);
  loading = memo(() => this.state().loading);

  routeParam$ = new BehaviorSubject<string>('');
  profile$ = this.routeParam$.pipe(
    filter((id) => id !== ''),
    distinctUntilChanged(),
    switchMap((id) => this.profileService.getProfile(id)),
    share(),
  );
  profileSuccess$ = this.profile$.pipe(filterSuccess, share());
  profileFailure$ = this.profile$.pipe(filterError, share());

  toggleFollowing$ = new Subject<void>();
  toggleFollowingSuccess$ = this.toggleFollowing$.pipe(
    exhaustMap(() =>
      this.following()
        ? this.actionsService.unfollowUser(this.username())
        : this.actionsService.followUser(this.username()),
    ),
    filterSuccess,
    share(),
  );

  newState$ = merge(
    this.profileSuccess$.pipe(
      map(
        (result): State => ({
          ...result.profile,
          loading: false,
        }),
      ),
    ),
    this.profileFailure$.pipe(
      map((): State => ({ ...initialState, loading: false })),
    ),
    this.toggleFollowingSuccess$.pipe(
      map((result): State => result.profile),
    ),
  );

  connection$ = connectSource(this.state, this.newState$).pipe(
    share({ resetOnRefCountZero: () => timer(1000) }),
  );
}
