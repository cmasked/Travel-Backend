import { UserResponse } from './user-response.interface';

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
}
