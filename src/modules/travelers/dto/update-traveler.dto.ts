import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { TravelerTitle, Gender, DocumentType } from '../../../shared/enums';
import { ApiProperty } from '@nestjs/swagger';

/** Full update traveler DTO — FRD §FR-US-030 (PUT) */
export class UpdateTravelerDto {
  @ApiProperty({ example: TravelerTitle.MR, enum: TravelerTitle })
  @IsEnum(TravelerTitle)
  title!: TravelerTitle;

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

  @ApiProperty({ example: '1990-01-01' })
  @Type(() => Date)
  @IsDate()
  dob!: Date;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  mobileNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  dialCode?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  documentNumber?: string;

  @IsOptional()
  @IsString()
  documentExpiryDate?: string;

  @IsOptional()
  @IsString()
  documentPhoto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  nationality?: string;

  @IsOptional()
  foodPreference?: Record<string, unknown>;
}
