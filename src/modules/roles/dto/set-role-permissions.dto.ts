import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class SetRolePermissionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  permissionIds!: string[];
}
