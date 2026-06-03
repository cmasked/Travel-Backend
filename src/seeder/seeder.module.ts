import { Module } from '@nestjs/common';
import { PermissionsModule } from '../modules/permissions/permissions.module';
import { RolesModule } from '../modules/roles/roles.module';
import { UsersModule } from '../modules/users/users.module';
import { SeederService } from './seeder.service';

@Module({
  imports: [UsersModule, RolesModule, PermissionsModule],
  providers: [SeederService],
})
export class SeederModule {}
