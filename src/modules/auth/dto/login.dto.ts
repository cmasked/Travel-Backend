import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** Login DTO — FRD §FR-US-013 */
export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
