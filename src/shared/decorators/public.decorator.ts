import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks an endpoint as public — JwtAuthGuard will skip token validation.
 * Per FRD §7.2: /auth/register, /auth/login, /auth/verify-email,
 * /auth/forgot-password, /auth/resend-otp are public.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
