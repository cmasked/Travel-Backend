import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../modules/roles/entities/role.entity';
import { AdminModule } from '../modules/roles/entities/admin-module.entity';
import { AdminSubModule } from '../modules/roles/entities/admin-sub-module.entity';
import { Permission } from '../modules/permissions/entities/permission.entity';
import { UserAccount } from '../modules/users/entities/user-account.entity';
import { UserAccountAdditional } from '../modules/users/entities/user-account-additional.entity';
import { Traveler } from '../modules/travelers/entities/traveler.entity';

@Injectable()
export class SeederRepository {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(AdminModule) private readonly moduleRepo: Repository<AdminModule>,
    @InjectRepository(AdminSubModule) private readonly subModuleRepo: Repository<AdminSubModule>,
    @InjectRepository(Permission) private readonly permRepo: Repository<Permission>,
    @InjectRepository(UserAccount) private readonly userRepo: Repository<UserAccount>,
    @InjectRepository(UserAccountAdditional) private readonly additionalRepo: Repository<UserAccountAdditional>,
    @InjectRepository(Traveler) private readonly travelerRepo: Repository<Traveler>,
  ) {}

  findRoleByName(name: string): Promise<Role | null> {
    return this.roleRepo.findOne({ where: { name } });
  }

  createRole(partial: Partial<Role>): Role {
    return this.roleRepo.create(partial);
  }

  saveRole(role: Role): Promise<Role> {
    return this.roleRepo.save(role);
  }

  findModuleByName(name: string): Promise<AdminModule | null> {
    return this.moduleRepo.findOne({ where: { name } });
  }

  createModule(partial: Partial<AdminModule>): AdminModule {
    return this.moduleRepo.create(partial);
  }

  saveModule(module: AdminModule): Promise<AdminModule> {
    return this.moduleRepo.save(module);
  }

  findPermission(roleId: string, moduleId: number): Promise<Permission | null> {
    return this.permRepo.findOne({ where: { roleId, moduleId } });
  }

  createPermission(partial: Partial<Permission>): Permission {
    return this.permRepo.create(partial);
  }

  savePermission(permission: Permission): Promise<Permission> {
    return this.permRepo.save(permission);
  }

  findUserByEmail(email: string): Promise<UserAccount | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  createUser(partial: Partial<UserAccount>): UserAccount {
    return this.userRepo.create(partial);
  }

  saveUser(user: UserAccount): Promise<UserAccount> {
    return this.userRepo.save(user);
  }

  createTraveler(partial: Partial<Traveler>): Traveler {
    return this.travelerRepo.create(partial);
  }

  saveTraveler(traveler: Traveler): Promise<Traveler> {
    return this.travelerRepo.save(traveler);
  }

  createAdditional(partial: Partial<UserAccountAdditional>): UserAccountAdditional {
    return this.additionalRepo.create(partial);
  }

  saveAdditional(additional: UserAccountAdditional): Promise<UserAccountAdditional> {
    return this.additionalRepo.save(additional);
  }
}
