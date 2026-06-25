import { PartialType } from '@nestjs/mapped-types';
import { CreateBannerDto } from './create-banner.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateBannerDto extends PartialType(CreateBannerDto) {
  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
