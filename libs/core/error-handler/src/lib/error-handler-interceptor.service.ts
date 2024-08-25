import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorHandlingInterceptor = (
  request: HttpRequest<any>,
  next: HttpHandlerFn,
): Observable<HttpEvent<any>> => {
  const router = inject(Router);

  return next(request).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          case 401:
            router.navigate(['/login']);
            break;
          case 404:
            router.navigate(['/']);
            break;
          default:
            throwError(error);
            break;
        }
      }
      return throwError(error);
    }),
  );
};
