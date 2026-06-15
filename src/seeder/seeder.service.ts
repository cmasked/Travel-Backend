import { Injectable, Logger, OnModuleInit, HttpException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '../modules/roles/entities/role.entity';
import { AdminModule } from '../modules/roles/entities/admin-module.entity';
import { UserType, UserStatus, AuthProvider, RoleType, ModuleType, TravelerTitle } from '../shared/enums';
import { SeederRepository } from './seeder.repository';

/**
 * Seeds default roles, modules, permissions, and admin user.
 * Runs on application startup. Idempotent — skips if data exists.
 */
@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly seederRepository: SeederRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('Running database seeder...');

      const superAdmin = await this.upsertRole('super_admin', 'Super Administrator', RoleType.ADMIN);
      const userRole = await this.upsertRole('user', 'End Consumer', RoleType.USER);

      const usersModule = await this.upsertModule('Users', 'User management', ModuleType.ADMIN);
      const rolesModule = await this.upsertModule('Roles', 'Role management', ModuleType.ADMIN);
      const bookingsModule = await this.upsertModule('Bookings', 'Booking management', ModuleType.ADMIN);
      const hotelsModule = await this.upsertModule('Hotels', 'Hotel management', ModuleType.ADMIN);
      const reportsModule = await this.upsertModule('Reports', 'Reports & analytics', ModuleType.ADMIN);

      for (const mod of [usersModule, rolesModule, bookingsModule, hotelsModule, reportsModule]) {
        await this.upsertPermission(superAdmin.id, mod.id, null, true, true, true, true);
      }

      await this.upsertPermission(userRole.id, usersModule.id, null, false, true, true, false);

      const adminEmail = 'admin@mygozzo.local';
      let admin = await this.seederRepository.findUserByEmail(adminEmail);

      if (!admin) {
        const passwordHash = await bcrypt.hash('Admin@1234', 12);
        admin = await this.seederRepository.saveUser(this.seederRepository.createUser({
          email: adminEmail,
          password: passwordHash,
          firstName: 'System',
          lastName: 'Admin',
          userType: UserType.USER,
          status: UserStatus.ACTIVE,
          authProvider: AuthProvider.LOCAL,
          isEmailVerified: true,
          roleId: superAdmin.id,
        }));

        await this.seederRepository.saveTraveler(this.seederRepository.createTraveler({
          userId: admin.userId,
          title: TravelerTitle.MR,
          firstName: 'System',
          lastName: 'Admin',
          dob: new Date('1990-01-01'),
          primaryTraveler: true,
        }));

        await this.seederRepository.saveAdditional(this.seederRepository.createAdditional({
          userId: admin.userId,
          featureFlags: {},
        }));

        this.logger.log(`Admin user seeded: ${adminEmail} / Admin@1234`);
      }

      this.logger.log('Seeder completed successfully.');
    } catch (error) {
      this.handleError(error, 'onModuleInit');
    }
  }

  private async upsertRole(name: string, description: string, type: RoleType): Promise<Role> {
    let role = await this.seederRepository.findRoleByName(name);
    if (!role) {
      role = await this.seederRepository.saveRole(this.seederRepository.createRole({ name, description, type }));
    }
    return role;
  }

  private async upsertModule(name: string, description: string, moduleType: ModuleType): Promise<AdminModule> {
    let mod = await this.seederRepository.findModuleByName(name);
    if (!mod) {
      mod = await this.seederRepository.saveModule(this.seederRepository.createModule({ name, description, moduleType }));
    }
    return mod;
  }

  private async upsertPermission(
    roleId: string, moduleId: number, subModuleId: number | null,
    canCreate: boolean, canRead: boolean, canUpdate: boolean, canDelete: boolean,
  ): Promise<void> {
    let perm = await this.seederRepository.findPermission(roleId, moduleId);
    if (!perm) {
      perm = this.seederRepository.createPermission({ roleId, moduleId, subModuleId, canCreate, canRead, canUpdate, canDelete });
      await this.seederRepository.savePermission(perm);
    }
  }

  private handleError(error: unknown, method: string): never {
    this.logger.error(`SeederService.${method} failed`, error instanceof Error ? error.stack : undefined);
    throw new InternalServerErrorException('Unexpected seeder error');
  }
}
