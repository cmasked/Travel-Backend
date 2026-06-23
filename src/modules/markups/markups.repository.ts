import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Markup } from './entities/markup.entity';

@Injectable()
export class MarkupsRepository {
  constructor(
    @InjectRepository(Markup)
    private readonly markupRepo: Repository<Markup>,
  ) {}

  findAll(): Promise<Markup[]> {
    return this.markupRepo.find({ order: { createdAt: 'DESC' } });
  }

  findById(markupId: string): Promise<Markup | null> {
    return this.markupRepo.findOne({ where: { markupId } });
  }

  findByNameAndModule(markupName: string, markupModule: string): Promise<Markup | null> {
    return this.markupRepo.findOne({ where: { markupName, markupModule: markupModule as any } });
  }

  create(partial: Partial<Markup>): Markup {
    return this.markupRepo.create(partial);
  }

  save(markup: Markup): Promise<Markup> {
    return this.markupRepo.save(markup);
  }

  async remove(markup: Markup): Promise<void> {
    await this.markupRepo.remove(markup);
  }
}
