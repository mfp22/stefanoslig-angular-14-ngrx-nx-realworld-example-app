import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AdaptCommon, Source } from '@state-adapt/core';
import { tap } from 'rxjs';
import { errorHandlerInitialState } from './error-handler.state';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerFacade {
  error401$ = new Source<HttpErrorResponse>('[Error Handler] 401');
  error404$ = new Source<HttpErrorResponse>('[Error Handler] 404');
  error401Source$ = this.error401$.pipe(tap(() => this.router.navigate(['/login'])));
  error404Source$ = this.error404$.pipe(tap(() => this.router.navigate(['/'])));

  state$ = this.adapt.setter('errorHandler', errorHandlerInitialState, [this.error401Source$, this.error404Source$]);

  constructor(private adapt: AdaptCommon<any>, private router: Router) {}
}
