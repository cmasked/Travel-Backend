import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  findAll(where: Record<string, unknown>): Promise<Role[]> {
    return this.roleRepo.find({ where, order: { createdAt: 'ASC' } });
  }

  findByName(name: string): Promise<Role | null> {
    return this.roleRepo.findOne({ where: { name } });
  }

  findById(id: string): Promise<Role | null> {
    return this.roleRepo.findOne({ where: { id, isDeleted: false } });
  }

  create(partial: Partial<Role>): Role {
    return this.roleRepo.create(partial);
  }

  save(role: Role): Promise<Role> {
    return this.roleRepo.save(role);
  }
}
