import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAccount } from '../users/entities/user-account.entity';
import { UserAccountAdditional } from '../users/entities/user-account-additional.entity';
import { Traveler } from '../travelers/entities/traveler.entity';
import { LoginLog } from '../audit/entities/login-log.entity';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(UserAccount)
    private readonly userRepo: Repository<UserAccount>,
    @InjectRepository(Traveler)
    private readonly travelerRepo: Repository<Traveler>,
    @InjectRepository(LoginLog)
    private readonly loginLogRepo: Repository<LoginLog>,
    @InjectRepository(UserAccountAdditional)
    private readonly additionalRepo: Repository<UserAccountAdditional>,
  ) {}

  findUserByEmail(email: string): Promise<UserAccount | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  findUserById(userId: string): Promise<UserAccount | null> {
    return this.userRepo.findOne({ where: { userId } });
  }

  saveUser(user: UserAccount): Promise<UserAccount> {
    return this.userRepo.save(user);
  }

  createUser(partial: Partial<UserAccount>): UserAccount {
    return this.userRepo.create(partial);
  }

  createTraveler(partial: Partial<Traveler>): Traveler {
    return this.travelerRepo.create(partial);
  }

  saveTraveler(traveler: Traveler): Promise<Traveler> {
    return this.travelerRepo.save(traveler);
  }

  createAdditional(partial: Partial<UserAccountAdditional>): UserAccountAdditional {
    return this.additionalRepo.create(partial);
  }

  saveAdditional(additional: UserAccountAdditional): Promise<UserAccountAdditional> {
    return this.additionalRepo.save(additional);
  }

  createLoginLog(partial: Partial<LoginLog>): LoginLog {
    return this.loginLogRepo.create(partial);
  }

  saveLoginLog(loginLog: LoginLog): Promise<LoginLog> {
    return this.loginLogRepo.save(loginLog);
  }

  findLatestLoginLog(userId: string): Promise<LoginLog | null> {
    return this.loginLogRepo.findOne({ where: { userId }, order: { loginTime: 'DESC' } });
  }

  findActiveRefreshLogs(): Promise<LoginLog[]> {
    return this.loginLogRepo.find({ where: { isTokenExpired: false }, order: { loginTime: 'DESC' }, take: 100 });
  }

  findSessionById(sessionId: string): Promise<LoginLog | null> {
    return this.loginLogRepo.findOne({ where: { loginLogId: sessionId } });
  }

  findSessionByIdAndUser(sessionId: string, userId: string): Promise<LoginLog | null> {
    return this.loginLogRepo.findOne({ where: { loginLogId: sessionId, userId } });
  }

  findSessionValidationRow(sessionId: string): Promise<LoginLog | null> {
    return this.loginLogRepo.findOne({ where: { loginLogId: sessionId }, select: ['loginLogId', 'isTokenExpired'] });
  }

  expireUserSessions(userId: string): Promise<void> {
    return this.loginLogRepo.update({ userId, isTokenExpired: false }, { isTokenExpired: true }).then(() => undefined);
  }

  findByUserId(userId: string): Promise<LoginLog | null> {
    return this.loginLogRepo.findOne({ where: { userId }, order: { loginTime: 'DESC' } });
  }

  findLatestResetLog(userId: string): Promise<LoginLog | null> {
    return this.loginLogRepo.findOne({ where: { userId }, order: { loginTime: 'DESC' } });
  }
}
