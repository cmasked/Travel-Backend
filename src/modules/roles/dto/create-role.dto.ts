import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { RoleType } from '../../../shared/enums';
import { ApiProperty } from '@nestjs/swagger';

/** Create role DTO — FRD §FR-US-034 */
export class CreateRoleDto {
  @ApiProperty({ example: 'Customer Support' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @ApiProperty({ example: 'Handles customer queries', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({ example: RoleType.ADMIN, enum: RoleType })
  @IsEnum(RoleType)
  type!: RoleType;
}
