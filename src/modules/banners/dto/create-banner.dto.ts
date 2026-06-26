import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { BannerModule } from '../../../shared/enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBannerDto {
  @ApiProperty({ example: 'Summer Vacation Sale' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  bannerName!: string;

  @ApiProperty({ example: 'SUMMER_2025' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bannerCode!: string;

  @ApiProperty({ example: 'Get 20% off on all summer flights.', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: ['https://example.com/banner1.png'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({ example: 'https://example.com/promo', required: false })
  @IsString()
  @IsOptional()
  linkUrl?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ example: BannerModule.FLIGHT, enum: BannerModule })
  @IsEnum(BannerModule, { message: 'Invalid banner module' })
  @IsNotEmpty()
  bannerModule!: BannerModule;
}
