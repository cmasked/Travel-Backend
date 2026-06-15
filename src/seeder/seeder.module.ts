import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { Role } from '../modules/roles/entities/role.entity';
import { AdminModule as AdminModuleEntity } from '../modules/roles/entities/admin-module.entity';
import { AdminSubModule } from '../modules/roles/entities/admin-sub-module.entity';
import { Permission } from '../modules/permissions/entities/permission.entity';
import { UserAccount } from '../modules/users/entities/user-account.entity';
import { UserAccountAdditional } from '../modules/users/entities/user-account-additional.entity';
import { Traveler } from '../modules/travelers/entities/traveler.entity';
import { SeederRepository } from './seeder.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      AdminModuleEntity,
      AdminSubModule,
      Permission,
      UserAccount,
      UserAccountAdditional,
      Traveler,
    ]),
  ],
  providers: [SeederService, SeederRepository],
})
export class SeederModule {}
