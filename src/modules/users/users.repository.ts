import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, ILike } from 'typeorm';
import { UserAccount } from './entities/user-account.entity';
import { UserAccountAdditional } from './entities/user-account-additional.entity';
import { LoginLog } from '../audit/entities/login-log.entity';
import { Traveler } from '../travelers/entities/traveler.entity';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserAccount)
    private readonly userRepo: Repository<UserAccount>,
    @InjectRepository(LoginLog)
    private readonly loginLogRepo: Repository<LoginLog>,
    @InjectRepository(UserAccountAdditional)
    private readonly additionalRepo: Repository<UserAccountAdditional>,
    @InjectRepository(Traveler)
    private readonly travelerRepo: Repository<Traveler>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) { }

  findById(userId: string): Promise<UserAccount | null> {
    return this.userRepo.findOne({ where: { userId } });
  }

  findAll(
    where: Record<string, unknown>,
    page: number,
    limit: number,
    fromDate?: string,
    toDate?: string,
    name?: string,
  ): Promise<[UserAccount[], number]> {
    // If the admin provided date filters, add them to the where clause
    if (fromDate && toDate) {
      where['createdAt'] = Between(new Date(fromDate), new Date(toDate + 'T23:59:59.999Z'));
    } else if (fromDate) {
      where['createdAt'] = MoreThanOrEqual(new Date(fromDate));
    } else if (toDate) {
      where['createdAt'] = LessThanOrEqual(new Date(toDate + 'T23:59:59.999Z'));
    }

    let finalWhere: any = where;
    if (name) {
      finalWhere = [
        { ...where, firstName: ILike(`%${name}%`) },
        { ...where, lastName: ILike(`%${name}%`) },
      ];
    }

    return this.userRepo.findAndCount({
      where: finalWhere,
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


  findByEmail(email: string): Promise<UserAccount | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  /** Look up a role by its UUID */
  findRoleById(roleId: string): Promise<Role | null> {
    return this.roleRepo.findOne({ where: { id: roleId } });
  }

  /** Build a UserAccount object in memory (does NOT save yet) */
  createUser(partial: Partial<UserAccount>): UserAccount {
    return this.userRepo.create(partial);
  }

  /** Build a Traveler object in memory */
  createTraveler(partial: Partial<Traveler>): Traveler {
    return this.travelerRepo.create(partial);
  }

  /** Save a Traveler to the database */
  saveTraveler(traveler: Traveler): Promise<Traveler> {
    return this.travelerRepo.save(traveler);
  }

  /** Build a UserAccountAdditional object in memory */
  createAdditional(partial: Partial<UserAccountAdditional>): UserAccountAdditional {
    return this.additionalRepo.create(partial);
  }

  /** Save a UserAccountAdditional to the database */
  saveAdditional(additional: UserAccountAdditional): Promise<UserAccountAdditional> {
    return this.additionalRepo.save(additional);
  }
}
