import { IsArray, IsBoolean, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/** Single permission entry in the upsert payload */
export class PermissionEntryDto {
  @IsInt()
  moduleId!: number;

  @IsOptional()
  @IsInt()
  subModuleId?: number;

  @IsBoolean()
  canCreate!: boolean;

  @IsBoolean()
  canRead!: boolean;

  @IsBoolean()
  canUpdate!: boolean;

  @IsBoolean()
  canDelete!: boolean;
}

/**
 * Upsert full permission set for a role — FRD §FR-US-036.
 * Transactional: INSERT ... ON CONFLICT DO UPDATE.
 */
export class UpsertPermissionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionEntryDto)
  permissions!: PermissionEntryDto[];
}
