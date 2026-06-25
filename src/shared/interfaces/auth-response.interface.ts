export interface AuthUserSnapshot {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  isEmailVerified?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUserSnapshot;
}

export interface AdminAuthResponse extends AuthResponse {
  user: AuthUserSnapshot & { roleId: string | null };
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  userId: string;
  message: string;
}

export interface SessionValidationResponse {
  valid: boolean;
}
