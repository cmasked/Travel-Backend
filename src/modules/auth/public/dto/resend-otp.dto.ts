import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** Resend OTP — FRD §FR-US-011 */
export class ResendOtpDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email!: string;
}
