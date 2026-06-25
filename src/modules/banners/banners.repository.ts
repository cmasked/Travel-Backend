import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';

@Injectable()
export class BannersRepository {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepo: Repository<Banner>,
  ) {}

  create(partial: Partial<Banner>): Banner {
    return this.bannerRepo.create(partial);
  }

  save(banner: Banner): Promise<Banner> {
    return this.bannerRepo.save(banner);
  }

  findAll(where: Record<string, unknown>, page: number, limit: number): Promise<[Banner[], number]> {
    return this.bannerRepo.findAndCount({
      where,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findActivePublic(bannerModule?: string): Promise<Banner[]> {
    const where: Record<string, unknown> = { isActive: true, isDeleted: false };
    if (bannerModule) where['bannerModule'] = bannerModule;
    return this.bannerRepo.find({ where, order: { sortOrder: 'ASC', createdAt: 'DESC' } });
  }

  findById(bannerId: string): Promise<Banner | null> {
    return this.bannerRepo.findOne({ where: { bannerId, isDeleted: false } });
  }

  findByCode(bannerCode: string): Promise<Banner | null> {
    return this.bannerRepo.findOne({ where: { bannerCode, isDeleted: false } });
  }

  remove(banner: Banner): Promise<Banner> {
    banner.isDeleted = true;
    banner.isActive = false;
    return this.bannerRepo.save(banner);
  }
}
