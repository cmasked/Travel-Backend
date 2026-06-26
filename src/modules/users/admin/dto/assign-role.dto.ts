import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** Assign role to user DTO — FRD §FR-US-038 */
export class AssignRoleDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  roleId!: string;
}



