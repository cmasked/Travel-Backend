import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private get repository(): Repository<Permission> {
    return this.dataSource.getRepository(Permission);
  }

  findAll(): Promise<Permission[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  findById(id: string): Promise<Permission | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByCodeOrName(code: string, name: string): Promise<Permission | null> {
    return this.repository.findOne({
      where: [{ code }, { name }],
    });
  }

  findByCodes(codes: string[]): Promise<Permission[]> {
    if (codes.length === 0) {
      return Promise.resolve([]);
    }

    return this.repository.find({ where: { code: In(codes) } });
  }

  create(permission: Partial<Permission>): Permission {
    return this.repository.create(permission);
  }

  save(permission: Permission): Promise<Permission> {
    return this.repository.save(permission);
  }

  remove(permission: Permission): Promise<Permission> {
    return this.repository.remove(permission);
  }
}
