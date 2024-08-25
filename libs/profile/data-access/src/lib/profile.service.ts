import { Injectable } from '@angular/core';
import {
  Profile,
  ProfileResponse,
} from '@realworld/core/api-types';
import {
  ApiService,
  RequestObservable,
} from '@realworld/core/http-client';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private apiService: ApiService) {}

  getProfile(
    username: string,
  ): RequestObservable<{ profile: Profile }> {
    return this.apiService.get<ProfileResponse>(
      '/profiles/' + username,
    );
  }
}
