import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Registration DTO — FRD §FR-US-001, FR-US-006.
 * Mandatory fields: email, password, first_name, last_name.
 * Password policy per FRD §6.2.
 */
export class RegisterDto {
  @ApiProperty({ example: 'axiom@gmail.com' })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: 'Ax1om!!!' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(100)
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one digit' })
  @Matches(/[!@#$%^&*]/, { message: 'Password must contain at least one special character (!@#$%^&*)' })
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName!: string;
}
