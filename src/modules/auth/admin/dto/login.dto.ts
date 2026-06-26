import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** Login DTO — FRD §FR-US-013 */
export class LoginDto {
  @ApiProperty({ example: 'axiom@gmail.com' })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: 'Ax1om!!!' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
