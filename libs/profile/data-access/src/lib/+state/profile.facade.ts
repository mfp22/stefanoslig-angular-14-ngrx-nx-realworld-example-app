import { Injectable } from '@angular/core';
import { ActionsService } from '@realworld/articles/data-access/src';
import { Action } from '@state-adapt/core';
import { getHttpSources, Source } from '@state-adapt/rxjs';
import { adapt, watch } from '@state-adapt/angular';
import { concatMap, Observable, switchMap, withLatestFrom } from 'rxjs';
import { ProfileService } from '../profile.service';
import { profileAdapter, profileInitialState } from './profile.adapter';

@Injectable({ providedIn: 'root' })
export class ProfileFacade {
  constructor(private actionsService: ActionsService, private profileService: ProfileService) {}

  createProfileStore(username$: Observable<string>) {
    const path = 'profile';

    const profileRequest$ = username$.pipe(switchMap(username => this.profileService.getProfile(username)));
    const profileRequest = getHttpSources('[Profile]', profileRequest$, res => [!!res, res, 'Error']);

    const sources = {
      followToggleRequest$: new Source<string>('[Profile] followToggleRequest$'),
    };

    const spyFollowing$ = watch(path, profileAdapter).following$;
    const followToggle$ = sources.followToggleRequest$.pipe(
      withLatestFrom(spyFollowing$),
      concatMap(([{ payload: username }, following]) =>
        following ? this.actionsService.unfollowUser(username) : this.actionsService.followUser(username),
      ),
    );
    const followToggleRequest = getHttpSources('[Profile] [Follow Toggle]', followToggle$, res => [
      !!res,
      res.profile,
      'Error',
    ]);

    const store = adapt([path, profileInitialState, profileAdapter], {
      request: profileRequest.request$ as Observable<Action<any>>,
      receive: profileRequest.success$,
      reset: profileRequest.error$,
      set: followToggleRequest.success$,
    });

    return { store, sources };
  }
}
