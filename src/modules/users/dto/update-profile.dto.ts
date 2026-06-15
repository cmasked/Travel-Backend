import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Gender, Title } from '../../../shared/enums';

/**
 * Profile update DTO — FRD §FR-US-022.
 * Partial updates only. Non-updatable fields (email, user_id,
 * user_type, auth_provider) are excluded from the DTO.
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(Title)
  title?: Title;

  @IsOptional()
  @IsString()
  dob?: string; // ISO date string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  mobileNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  dialCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  dialCountry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nationality?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  preferredCurrency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  country?: string;

  @IsOptional()
  @IsString()
  address1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;
}
