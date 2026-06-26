import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Traveler } from './entities/traveler.entity';

@Injectable()
export class TravelersRepository {
  constructor(
    @InjectRepository(Traveler)
    private readonly travelerRepo: Repository<Traveler>,
  ) {}

  findAll(userId: string, name?: string): Promise<Traveler[]> {
    const where: any = { userId, isDeleted: false };
    
    let finalWhere: any = where;
    if (name) {
      finalWhere = [
        { ...where, firstName: ILike(`%${name}%`) },
        { ...where, lastName: ILike(`%${name}%`) },
      ];
    }
    
    return this.travelerRepo.find({ where: finalWhere, order: { primaryTraveler: 'DESC', createdAt: 'DESC' } });
  }

  countByUser(userId: string): Promise<number> {
    return this.travelerRepo.count({ where: { userId, isDeleted: false } });
  }

  findOneById(userId: string, travelerId: string): Promise<Traveler | null> {
    return this.travelerRepo.findOne({ where: { travelerId, userId, isDeleted: false } });
  }

  create(partial: Partial<Traveler>): Traveler {
    return this.travelerRepo.create(partial);
  }

  save(traveler: Traveler): Promise<Traveler> {
    return this.travelerRepo.save(traveler);
  }
}
