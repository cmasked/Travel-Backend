import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** Verify email OTP — FRD §FR-US-009 */
export class VerifyOtpDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp!: string;
}
