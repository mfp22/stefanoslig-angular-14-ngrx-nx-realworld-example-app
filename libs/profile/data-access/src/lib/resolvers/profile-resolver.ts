import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
} from '@angular/router';
import { filter, map, startWith, take } from 'rxjs';

import { ProfileStateService } from '@realworld/profile/feature-profile/src/lib/profile-state.service';

export const profileResolver: ResolveFn<boolean> = (
  route: ActivatedRouteSnapshot,
) => {
  const profileStateService = inject(ProfileStateService);

  profileStateService.routeParam$.next(route.params['username']);

  return profileStateService.connection$.pipe(
    startWith(null),
    map(() => !!profileStateService.username()),
    filter((l) => l),
    take(1),
  );
};
