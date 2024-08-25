import { WritableSignal } from '@angular/core';
import {
  Observable,
  tap,
  share,
  finalize,
  merge,
  NEVER,
} from 'rxjs';

/**
 * https://dev.to/mfp22/introducing-the-auto-signal-pattern-1a5h
 */
export function connectSource<State>(
  state: WritableSignal<State>,
  source$: Observable<State>,
) {
  const initialState = state();
  return merge(source$, NEVER).pipe(
    tap((s) => state.set(s)),
    finalize(() => state.set(initialState)),
    share(),
  );
}
