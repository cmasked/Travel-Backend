import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { BannerModule } from '../../../shared/enums';

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  bannerName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bannerCode!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  linkUrl?: string;

  @IsOptional()
  sortOrder?: number;

  @IsEnum(BannerModule, { message: 'Invalid banner module' })
  @IsNotEmpty()
  bannerModule!: BannerModule;
}
