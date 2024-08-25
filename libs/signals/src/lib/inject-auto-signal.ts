import { inject, ProviderToken } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

/**
 * https://dev.to/mfp22/introducing-the-auto-signal-pattern-1a5h
 */
export function injectAutoSignal<
  T,
  Service extends { connection$: Observable<T> },
>(token: ProviderToken<Service>) {
  const service = inject(token);
  service.connection$.pipe(takeUntilDestroyed()).subscribe();
  return service;
}
