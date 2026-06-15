import { IsEmail } from 'class-validator';

/** Forgot password — FRD §FR-US-026 */
export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}
