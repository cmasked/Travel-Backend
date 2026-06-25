export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Record<string, unknown>;
}

export interface AdminAuthResponse extends AuthResponse {
  roleId: string | null;
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
