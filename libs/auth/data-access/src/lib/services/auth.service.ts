import { Injectable } from '@angular/core';
import {
  LoginUser,
  LoginUserRequest,
  NewUser,
  NewUserRequest,
  User,
  UserResponse,
} from '@realworld/core/api-types';
import {
  ApiService,
  RequestObservable,
} from '@realworld/core/http-client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private apiService: ApiService) {}

  user(): RequestObservable<UserResponse> {
    return this.apiService.get<UserResponse>('/user');
  }

  login(
    credentials: LoginUser,
  ): RequestObservable<UserResponse> {
    return this.apiService.post<UserResponse, LoginUserRequest>(
      '/users/login',
      { user: credentials },
    );
  }

  register(
    credentials: NewUser,
  ): RequestObservable<UserResponse> {
    return this.apiService.post<UserResponse, NewUserRequest>(
      '/users',
      { user: credentials },
    );
  }

  update(user: User): RequestObservable<UserResponse> {
    return this.apiService.put<UserResponse, UserResponse>(
      '/user',
      { user },
    );
  }
}
