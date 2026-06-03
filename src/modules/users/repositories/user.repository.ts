import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private get repository(): Repository<User> {
    return this.dataSource.getRepository(User);
  }

  private get roleRepository(): Repository<Role> {
    return this.dataSource.getRepository(Role);
  }

  findAll(): Promise<User[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      relations: { roles: { permissions: true } },
    });
  }

  create(user: Partial<User>): User {
    return this.repository.create(user);
  }

  save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  remove(user: User): Promise<User> {
    return this.repository.remove(user);
  }

  async setRoles(userId: string, roleIds: string[]): Promise<User> {
    const user = await this.repository.findOne({ where: { id: userId }, relations: { roles: { permissions: true } } });

    if (!user) {
      throw new Error('User not found');
    }

    const roles = roleIds.length === 0 ? [] : await this.roleRepository.findByIds(roleIds);
    user.roles = roles;
    return this.repository.save(user);
  }
}
