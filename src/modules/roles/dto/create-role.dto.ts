import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { RoleType } from '../../../shared/enums';

/** Create role DTO — FRD §FR-US-034 */
export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsEnum(RoleType)
  type!: RoleType;
}
