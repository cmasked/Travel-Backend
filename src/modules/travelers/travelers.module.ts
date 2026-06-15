import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelersController } from './travelers.controller';
import { TravelersService } from './travelers.service';
import { Traveler } from './entities/traveler.entity';
import { TravelersRepository } from './travelers.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Traveler])],
  controllers: [TravelersController],
  providers: [TravelersService, TravelersRepository],
  exports: [TravelersService],
})
export class TravelersModule {}
