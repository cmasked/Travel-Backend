import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Markup } from './entities/markup.entity';
import { MarkupsController } from './markups.controller';
import { MarkupsService } from './markups.service';
import { MarkupsRepository } from './markups.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Markup])],
  controllers: [MarkupsController],
  providers: [MarkupsService, MarkupsRepository],
  exports: [MarkupsService],
})
export class MarkupsModule {}
