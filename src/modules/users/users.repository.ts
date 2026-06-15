import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAccount } from './entities/user-account.entity';
import { LoginLog } from '../audit/entities/login-log.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserAccount)
    private readonly userRepo: Repository<UserAccount>,
    @InjectRepository(LoginLog)
    private readonly loginLogRepo: Repository<LoginLog>,
  ) {}

  findById(userId: string): Promise<UserAccount | null> {
    return this.userRepo.findOne({ where: { userId } });
  }

  findAll(where: Record<string, unknown>, page: number, limit: number): Promise<[UserAccount[], number]> {
    return this.userRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  save(user: UserAccount): Promise<UserAccount> {
    return this.userRepo.save(user);
  }

  updateLoginSessionsExpired(userId: string): Promise<void> {
    return this.loginLogRepo.update({ userId, isTokenExpired: false }, { isTokenExpired: true }).then(() => undefined);
  }
}
