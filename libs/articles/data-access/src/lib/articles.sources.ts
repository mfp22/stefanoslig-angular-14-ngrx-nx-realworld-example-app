import { Injectable, inject } from '@angular/core';
import { Subject, concatMap, share } from 'rxjs';
import { ActionsService } from './services/actions.service';
import { filterSuccess } from '@realworld/core/http-client/src';

@Injectable({ providedIn: 'root' })
export class ArticlesSources {
  actionsService = inject(ActionsService);

  favorite$ = new Subject<string>();
  favoriteSuccess$ = this.favorite$.pipe(
    concatMap((slug) => this.actionsService.favorite(slug)),
    filterSuccess,
    share(),
  );

  unfavorite$ = new Subject<string>();
  unfavoriteSuccess$ = this.unfavorite$.pipe(
    concatMap((slug) => this.actionsService.unfavorite(slug)),
    filterSuccess,
    share(),
  );
}
