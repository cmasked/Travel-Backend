import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserAccount } from './entities/user-account.entity';
import { UserAccountAdditional } from './entities/user-account-additional.entity';
import { LoginLog } from '../audit/entities/login-log.entity';
import { UsersRepository } from './users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserAccount, UserAccountAdditional, LoginLog])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
