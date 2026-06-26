import { IsArray, IsBoolean, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/** Single permission entry in the upsert payload */
export class PermissionEntryDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  moduleId!: number;

  @IsOptional()
  @IsInt()
  subModuleId?: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  canCreate!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  canRead!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  canUpdate!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  canDelete!: boolean;
}

/**
 * Upsert full permission set for a role — FRD §FR-US-036.
 * Transactional: INSERT ... ON CONFLICT DO UPDATE.
 */
export class UpsertPermissionsDto {
  @ApiProperty({ type: [PermissionEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionEntryDto)
  permissions!: PermissionEntryDto[];
}
