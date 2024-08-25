import { Inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, catchError, filter, of } from 'rxjs';
import { API_URL } from './api-url.token';

function toRequestObservable<T>(source: Observable<T>) {
  return source.pipe(
    catchError((result) => of(result.error as { errors: {} })),
  );
}
export function filterSuccess<T>(
  source: RequestObservable<T>,
): Observable<T> {
  return source.pipe(
    filter(
      (result): result is T => !('errors' in (result as object)),
    ),
  );
}
export function filterError<T>(
  source: RequestObservable<T>,
): Observable<{ errors: {} }> {
  return source.pipe(
    filter(
      (result): result is { errors: {} } =>
        'errors' in (result as object),
    ),
  );
}

export type RequestObservable<T> = Observable<
  T | { errors: {} }
>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(
    private http: HttpClient,
    @Inject(API_URL) private api_url: string,
  ) {}

  get<T>(
    url: string,
    params: HttpParams = new HttpParams(),
  ): RequestObservable<T> {
    return this.http
      .get<T>(`${this.api_url}${url}`, {
        headers: this.headers,
        params,
      })
      .pipe(toRequestObservable);
  }

  post<T, D>(url: string, data?: D): RequestObservable<T> {
    return this.http
      .post<T>(`${this.api_url}${url}`, JSON.stringify(data), {
        headers: this.headers,
      })
      .pipe(toRequestObservable);
  }

  put<T, D>(url: string, data: D): RequestObservable<T> {
    return this.http
      .put<T>(`${this.api_url}${url}`, JSON.stringify(data), {
        headers: this.headers,
      })
      .pipe(toRequestObservable);
  }

  delete<T>(url: string): RequestObservable<T> {
    return this.http
      .delete<T>(`${this.api_url}${url}`, {
        headers: this.headers,
      })
      .pipe(toRequestObservable);
  }

  get headers(): HttpHeaders {
    const headersConfig = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    return new HttpHeaders(headersConfig);
  }
}
