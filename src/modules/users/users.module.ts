import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicUsersService } from './public/public-users.service';
import { AdminUsersService } from './admin/admin-users.service';
import { PublicUsersController } from './public/public-users.controller';
import { AdminUsersController } from './admin/admin-users.controller';
import { UsersRepository } from './users.repository';
import { UserAccount } from './entities/user-account.entity';
import { UserAccountAdditional } from './entities/user-account-additional.entity';
import { LoginLog } from '../audit/entities/login-log.entity';
import { Traveler } from '../travelers/entities/traveler.entity';
import { Role } from '../roles/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAccount, UserAccountAdditional, LoginLog, Traveler, Role])],
  controllers: [PublicUsersController, AdminUsersController],
  providers: [PublicUsersService, AdminUsersService, UsersRepository],
  exports: [PublicUsersService, AdminUsersService],
})
export class UsersModule {}
