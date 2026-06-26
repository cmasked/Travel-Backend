import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** Forgot password — FRD §FR-US-026 */
export class ForgotPasswordDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email!: string;
}
