/**
 * JWT payload structure per FRD §4.3 (FR-US-013).
 * JWT payload: { sub: user_id, type: user_type, role_id, iat, exp }
 * Signed with RS256.
 */
export interface JwtPayload {
  /** user_account.user_id */
  sub: string;
  /** user_account.user_type */
  type: string;
  /** user_account.role_id (nullable) */
  roleId: string | null;
  /** login_logs.login_log_id — used for session validation */
  sessionId: string;
  iat?: number;
  exp?: number;
}
