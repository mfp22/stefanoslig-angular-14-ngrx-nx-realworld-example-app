import { Injectable } from '@angular/core';
import {
  ApiService,
  filterSuccess,
} from '@realworld/core/http-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TagService {
  constructor(private apiService: ApiService) {}

  getTags(): Observable<{ tags: string[] }> {
    return this.apiService
      .get<{ tags: string[] }>('/tags')
      .pipe(filterSuccess);
  }
}
