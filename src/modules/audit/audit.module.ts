import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { LoginLog } from './entities/login-log.entity';
import { ForceLogoutLog } from './entities/force-logout-log.entity';
import { UserAccount } from '../users/entities/user-account.entity';
import { AuditRepository } from './audit.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LoginLog, ForceLogoutLog, UserAccount])],
  controllers: [AuditController],
  providers: [AuditService, AuditRepository],
  exports: [AuditService],
})
export class AuditModule {}
