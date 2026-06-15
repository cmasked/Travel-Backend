import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

/** Verify email OTP — FRD §FR-US-009 */
export class VerifyOtpDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp!: string;
}
