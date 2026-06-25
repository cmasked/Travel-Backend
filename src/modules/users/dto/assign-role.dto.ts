import { IsUUID } from 'class-validator';

/** Assign role to user DTO — FRD §FR-US-038 */
export class AssignRoleDto {
  @IsUUID()
  roleId!: string;
}



