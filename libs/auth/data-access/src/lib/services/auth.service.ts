import { ApiService } from '@realworld/core/http-client';
import { User, UserResponse } from '@realworld/core/api-types';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { LoginUser, LoginUserRequest, NewUserRequest, NewUser } from '@realworld/core/api-types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private apiService: ApiService) {}

  fetchUser(): Observable<User> {
    return this.apiService.get<UserResponse>('/user').pipe(map(({ user }) => user));
  }

  login(credentials: LoginUser): Observable<User> {
    return this.apiService
      .post<UserResponse, LoginUserRequest>('/users/login', { user: credentials })
      .pipe(map(({ user }) => user));
  }

  register(credentials: NewUser): Observable<User> {
    return this.apiService
      .post<UserResponse, NewUserRequest>('/users', { user: credentials })
      .pipe(map(({ user }) => user));
  }
}
