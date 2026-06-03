import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Permission } from '../../permissions/entities/permission.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private get repository(): Repository<Role> {
    return this.dataSource.getRepository(Role);
  }

  private get permissionRepository(): Repository<Permission> {
    return this.dataSource.getRepository(Permission);
  }

  findAll(): Promise<Role[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  findById(id: string): Promise<Role | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByCodeOrName(code: string, name: string): Promise<Role | null> {
    return this.repository.findOne({
      where: [{ code }, { name }],
    });
  }

  findByCodes(codes: string[]): Promise<Role[]> {
    if (codes.length === 0) {
      return Promise.resolve([]);
    }

    return this.repository.find({ where: { code: In(codes) } });
  }

  create(role: Partial<Role>): Role {
    return this.repository.create(role);
  }

  save(role: Role): Promise<Role> {
    return this.repository.save(role);
  }

  remove(role: Role): Promise<Role> {
    return this.repository.remove(role);
  }

  async setPermissions(roleId: string, permissionIds: string[]): Promise<Role> {
    const role = await this.repository.findOne({ where: { id: roleId }, relations: { permissions: true } });

    if (!role) {
      throw new Error('Role not found');
    }

    const permissions = permissionIds.length === 0 ? [] : await this.permissionRepository.find({ where: { id: In(permissionIds) } });
    role.permissions = permissions;
    return this.repository.save(role);
  }
}
