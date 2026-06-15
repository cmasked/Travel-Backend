import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
  ) {}

  findByRole(roleId: string): Promise<Permission[]> {
    return this.permRepo.find({ where: { roleId, isActive: true }, relations: ['module', 'subModule'], order: { moduleId: 'ASC', subModuleId: 'ASC' } });
  }

  deleteByRole(roleId: string): Promise<void> {
    return this.permRepo.delete({ roleId }).then(() => undefined);
  }

  create(partial: Partial<Permission>): Permission {
    return this.permRepo.create(partial);
  }

  save(permissions: Permission[]): Promise<Permission[]> {
    return this.permRepo.save(permissions);
  }

  findOneByRoleAndModule(roleId: string, moduleId: number): Promise<Permission | null> {
    return this.permRepo.findOne({ where: { roleId, moduleId, isActive: true } });
  }
}
