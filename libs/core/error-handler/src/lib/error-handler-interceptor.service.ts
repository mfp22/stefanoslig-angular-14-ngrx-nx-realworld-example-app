import { HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { HttpInterceptor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ErrorHandlerFacade } from './+state/error-handler.facade';

@Injectable()
export class ErrorHandlerInterceptorService implements HttpInterceptor {
  constructor(private facade: ErrorHandlerFacade) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const errorSources = {
      401: this.facade.error401$,
      404: this.facade.error404$,
    };
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          const source = errorSources[error.status as keyof typeof errorSources];
          source ? source.next(error) : throwError(error);
        }
        return throwError(error);
      }),
    );
  }
}
