import { IsEmail, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for Super Admins creating new Sub-Admins.
 * Enforces strict validation for internal staff creation.
 */
export class CreateSubAdminDto {
  @ApiProperty({ example: 'admin@travel.com' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: 'Admin' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'User' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: 'TempP@ssw0rd!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100)
  password!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID('4', { message: 'roleId must be a valid UUID' })
  @IsNotEmpty({ message: 'roleId is required for sub-admins' })
  roleId!: string;



}
