import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginLog } from './entities/login-log.entity';
import { ForceLogoutLog } from './entities/force-logout-log.entity';
import { UserAccount } from '../users/entities/user-account.entity';

@Injectable()
export class AuditRepository {
  constructor(
    @InjectRepository(LoginLog)
    private readonly loginLogRepo: Repository<LoginLog>,
    @InjectRepository(ForceLogoutLog)
    private readonly forceLogoutRepo: Repository<ForceLogoutLog>,
    @InjectRepository(UserAccount)
    private readonly userRepo: Repository<UserAccount>,
  ) {}

  findUserById(userId: string): Promise<UserAccount | null> {
    return this.userRepo.findOne({ where: { userId } });
  }

  expireAllSessions(userId: string): Promise<void> {
    return this.loginLogRepo.update({ userId, isTokenExpired: false }, { isTokenExpired: true }).then(() => undefined);
  }

  createForceLogout(partial: Partial<ForceLogoutLog>): ForceLogoutLog {
    return this.forceLogoutRepo.create(partial);
  }

  saveForceLogout(forceLogout: ForceLogoutLog): Promise<ForceLogoutLog> {
    return this.forceLogoutRepo.save(forceLogout);
  }
}
