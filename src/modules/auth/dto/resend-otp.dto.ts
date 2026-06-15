import { IsEmail } from 'class-validator';

/** Resend OTP — FRD §FR-US-011 */
export class ResendOtpDto {
  @IsEmail()
  email!: string;
}
