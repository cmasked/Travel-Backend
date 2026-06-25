import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Change password DTO — FRD §FR-US-025.
 * Requires current password verification + password policy on new password.
 */
export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123!' })
  @IsString()
  currentPassword!: string;

  @ApiProperty({ example: 'NewSecureP@ssw0rd!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/[A-Z]/, { message: 'New password must contain at least one uppercase letter' })
  @Matches(/[0-9]/, { message: 'New password must contain at least one digit' })
  @Matches(/[!@#$%^&*]/, { message: 'New password must contain at least one special character' })
  newPassword!: string;
}
