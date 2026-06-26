import { IsEnum, IsOptional, IsString, MaxLength, IsNotEmpty } from 'class-validator';
import { UserStatus } from '../../../../shared/enums';
import { ApiProperty } from '@nestjs/swagger';

/** Update user status (admin) — FRD §6.1 state machine */
export class UpdateUserStatusDto {
  @ApiProperty({ example: 'uuid-here', description: 'The ID of the user to update' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ example: UserStatus.ACTIVE, enum: UserStatus })
  @IsEnum(UserStatus)
  status!: UserStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
