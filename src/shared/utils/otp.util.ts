import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

/**
 * OTP utilities per FRD §6.3:
 * - 6-digit numeric codes
 * - Generated using cryptographically secure random source (crypto.randomInt)
 * - Stored as bcrypt hash — never in plain text
 * - Valid for 10 minutes from otp_time
 * - Max 5 verification attempts before invalidation
 * - Max 5 resend requests per 15-minute window
 */

const OTP_LENGTH = 6;
const OTP_BCRYPT_ROUNDS = 12;

/** Generate a cryptographically secure 6-digit OTP */
export function generateOtp(): string {
  const min = Math.pow(10, OTP_LENGTH - 1);     // 100000
  const max = Math.pow(10, OTP_LENGTH) - 1;      // 999999
  const otp = crypto.randomInt(min, max + 1);
  return otp.toString();
}

/** Hash an OTP using bcrypt (cost 12) for storage */
export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, OTP_BCRYPT_ROUNDS);
}

/** Verify an OTP against its bcrypt hash */
export async function verifyOtp(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

/** Check if OTP has expired (10-minute window per FRD §6.3) */
export function isOtpExpired(otpTime: Date): boolean {
  const TEN_MINUTES_MS = 10 * 60 * 1000;
  return Date.now() - otpTime.getTime() > TEN_MINUTES_MS;
}

/** OTP policy constants */
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_MAX_VERIFY_ATTEMPTS = 5;
export const OTP_MAX_RESEND_ATTEMPTS = 5;
export const OTP_RESEND_WINDOW_MINUTES = 15;
export const ACCOUNT_LOCK_DURATION_MINUTES = 15;
