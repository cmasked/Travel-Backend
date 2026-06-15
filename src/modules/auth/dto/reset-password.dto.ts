import { IsEmail, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

/** Reset password with OTP — FRD §FR-US-026 */
export class ResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6)
  otp!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one digit' })
  @Matches(/[!@#$%^&*]/, { message: 'Password must contain at least one special character' })
  newPassword!: string;
}
