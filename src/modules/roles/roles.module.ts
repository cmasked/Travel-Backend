import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../permissions/entities/permission.entity';
import { PermissionRepository } from '../permissions/repositories/permission.repository';
import { Role } from './entities/role.entity';
import { RoleRepository } from './repositories/role.repository';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  controllers: [RolesController],
  providers: [RolesService, RoleRepository, PermissionRepository],
  exports: [RolesService, RoleRepository],
})
export class RolesModule {}
