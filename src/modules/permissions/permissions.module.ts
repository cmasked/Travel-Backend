import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { Permission } from './entities/permission.entity';
import { AdminModule as AdminModuleEntity } from '../roles/entities/admin-module.entity';
import { AdminSubModule } from '../roles/entities/admin-sub-module.entity';
import { PermissionsRepository } from './permissions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, AdminModuleEntity, AdminSubModule])],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsRepository],
  exports: [PermissionsService],
})
export class PermissionsModule {}
