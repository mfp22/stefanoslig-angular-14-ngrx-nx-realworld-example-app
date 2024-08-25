import { inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable, filter, map, startWith, take } from 'rxjs';
import { ArticleStateService } from './article-state.service';

export function canActivateArticle(
  route: ActivatedRouteSnapshot,
): Observable<boolean> {
  const articleStateService = inject(ArticleStateService);

  articleStateService.routeParam$.next(route.params['slug']);

  return articleStateService.connection$.pipe(
    startWith(null),
    map(() => !!articleStateService.article().slug),
    filter((l) => l),
    take(1),
  );
}
