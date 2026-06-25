import { PartialType } from '@nestjs/mapped-types';
import { CreateBannerDto } from './create-banner.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateBannerDto extends PartialType(CreateBannerDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
