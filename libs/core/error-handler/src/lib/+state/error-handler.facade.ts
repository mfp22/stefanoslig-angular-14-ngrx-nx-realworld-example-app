import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { adapt } from '@state-adapt/angular';
import { Source } from '@state-adapt/core';
import { mergeWith, tap } from 'rxjs';
import { errorHandlerInitialState } from './error-handler.state';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerFacade {
  error401$ = new Source<HttpErrorResponse>('[Error Handler] 401');
  error404$ = new Source<HttpErrorResponse>('[Error Handler] 404');
  error401Source$ = this.error401$.pipe(tap(() => this.router.navigate(['/login'])));
  error404Source$ = this.error404$.pipe(tap(() => this.router.navigate(['/'])));

  state$ = adapt('errorHandler', errorHandlerInitialState, this.error401Source$.pipe(mergeWith(this.error404Source$)))
    .state$;

  constructor(private router: Router) {}
}
