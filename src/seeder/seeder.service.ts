import { Injectable, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PermissionRepository } from '../modules/permissions/repositories/permission.repository';
import { RoleRepository } from '../modules/roles/repositories/role.repository';
import { UserRepository } from '../modules/users/repositories/user.repository';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly roleRepository: RoleRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    const permissionsSeed = [
      { name: 'Manage users', code: 'manage_users' },
      { name: 'Manage roles', code: 'manage_roles' },
      { name: 'Manage permissions', code: 'manage_permissions' },
      { name: 'Read own profile', code: 'profile_read' },
      { name: 'Update own profile', code: 'profile_update' },
    ];

    const permissionEntities = [];
    for (const permissionSeed of permissionsSeed) {
      const existingPermission = await this.permissionRepository.findByCodeOrName(permissionSeed.code, permissionSeed.name);
      const permission = existingPermission ?? this.permissionRepository.create(permissionSeed);
      permissionEntities.push(existingPermission ?? (await this.permissionRepository.save(permission)));
    }

    const adminRoleSeed = { name: 'Administrator', code: 'admin' };
    const userRoleSeed = { name: 'User', code: 'user' };

    const adminRole = (await this.roleRepository.findByCodeOrName(adminRoleSeed.code, adminRoleSeed.name)) ?? this.roleRepository.create(adminRoleSeed);
    adminRole.permissions = permissionEntities;
    const savedAdminRole = await this.roleRepository.save(adminRole);

    const userPermissions = permissionEntities.filter((permission) => ['profile_read', 'profile_update'].includes(permission.code));
    const userRole = (await this.roleRepository.findByCodeOrName(userRoleSeed.code, userRoleSeed.name)) ?? this.roleRepository.create(userRoleSeed);
    userRole.permissions = userPermissions;
    await this.roleRepository.save(userRole);

    const adminEmail = 'admin@travel.local';
    const existingAdmin = await this.userRepository.findByEmail(adminEmail);

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('Admin@1234', 12);
      const adminUser = this.userRepository.create({
        name: 'System Admin',
        email: adminEmail,
        passwordHash,
        roles: [savedAdminRole],
      });

      await this.userRepository.save(adminUser);
    }
  }
}
