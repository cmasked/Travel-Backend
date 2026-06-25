import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { Banner } from './entities/banner.entity';
import { BannersRepository } from './banners.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Banner])],
  controllers: [BannersController],
  providers: [BannersService, BannersRepository],
  exports: [BannersService],
})
export class BannersModule {}
