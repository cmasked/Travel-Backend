import {
  ForbiddenException,
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
  HttpException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserAccount } from './entities/user-account.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { ErrorCodes } from '../../shared/constants/error-codes';
import { UserStatus } from '../../shared/enums';
import { RedisService } from '../redis/redis.service';
import { UsersRepository } from './users.repository';

const BCRYPT_ROUNDS = 12;

/**
 * Valid status transitions per FRD §6.1 Account State Machine.
 */
const VALID_TRANSITIONS: Record<string, UserStatus[]> = {
  [UserStatus.PENDING_APPROVAL]: [UserStatus.ACTIVE, UserStatus.INACTIVE],
  [UserStatus.ACTIVE]: [UserStatus.SUSPENDED, UserStatus.INACTIVE],
  [UserStatus.SUSPENDED]: [UserStatus.ACTIVE],
  [UserStatus.INACTIVE]: [UserStatus.ACTIVE],
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly redisService: RedisService,
  ) {}

  /**
   * FR-US-021 — GET /users/me. Never return password hash.
   */
  async getProfile(userId: string): Promise<Partial<UserAccount>> {
    try {
      const user = await this.usersRepository.findById(userId);
      if (!user) throw new NotFoundException({ message: 'User not found', code: ErrorCodes.USER_NOT_FOUND });
      return this.sanitizeUser(user);
    } catch (error) {
      this.handleError(error, 'getProfile');
    }
  }

  /**
   * FR-US-022 — PATCH /users/me. Partial update, immutable fields blocked.
   */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<Partial<UserAccount>> {
    try {
      const user = await this.usersRepository.findById(userId);
      if (!user) throw new NotFoundException({ message: 'User not found', code: ErrorCodes.USER_NOT_FOUND });

      if (dto.firstName !== undefined) user.firstName = dto.firstName;
      if (dto.lastName !== undefined) user.lastName = dto.lastName;
      if (dto.gender !== undefined) user.gender = dto.gender;
      if (dto.title !== undefined) user.title = dto.title;
      if (dto.dob !== undefined) user.dob = new Date(dto.dob);
      if (dto.mobileNo !== undefined) user.mobileNo = dto.mobileNo;
      if (dto.dialCode !== undefined) user.dialCode = dto.dialCode;
      if (dto.dialCountry !== undefined) user.dialCountry = dto.dialCountry;
      if (dto.nationality !== undefined) user.nationality = dto.nationality;
      if (dto.preferredLanguage !== undefined) user.preferredLanguage = dto.preferredLanguage;
      if (dto.preferredCurrency !== undefined) user.preferredCurrency = dto.preferredCurrency;
      if (dto.state !== undefined) user.state = dto.state;
      if (dto.country !== undefined) user.country = dto.country;
      if (dto.address1 !== undefined) user.address1 = dto.address1;
      if (dto.postalCode !== undefined) user.postalCode = dto.postalCode;
      if (dto.city !== undefined) user.city = dto.city;

      user.updatedBy = userId;
      const saved = await this.usersRepository.save(user);
      return this.sanitizeUser(saved);
    } catch (error) {
      this.handleError(error, 'updateProfile');
    }
  }

  /**
   * FR-US-025 — Change password. Verify current → hash new → invalidate all sessions.
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    try {
      const user = await this.usersRepository.findById(userId);
      if (!user || !user.password) {
        throw new NotFoundException({ message: 'User not found', code: ErrorCodes.USER_NOT_FOUND });
      }

      const currentValid = await bcrypt.compare(dto.currentPassword, user.password);
      if (!currentValid) {
        throw new ForbiddenException({ message: 'Current password is incorrect', code: ErrorCodes.CURRENT_PASSWORD_WRONG });
      }

      const sameAsOld = await bcrypt.compare(dto.newPassword, user.password);
      if (sameAsOld) {
        throw new UnprocessableEntityException({ message: 'New password must differ from current', code: ErrorCodes.PASSWORD_SAME_AS_OLD });
      }

      const lp = dto.newPassword.toLowerCase();
      if (lp.includes(user.email.split('@')[0]) || lp.includes(user.firstName.toLowerCase()) || lp.includes(user.lastName.toLowerCase())) {
        throw new UnprocessableEntityException({ message: 'Password must not contain your email or name', code: ErrorCodes.PASSWORD_CONTAINS_PII });
      }

      user.password = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
      await this.usersRepository.save(user);
      await this.usersRepository.updateLoginSessionsExpired(userId);

      await this.redisService.publish('user.password_changed', {
        user_id: userId,
        correlation_id: crypto.randomUUID(),
      });

      return { message: 'Password changed. All sessions invalidated.' };
    } catch (error) {
      this.handleError(error, 'changePassword');
    }
  }

  // ─── Admin endpoints ─────────────────────────────────────────

  /** GET /users — Admin list, paginated, filterable */
  async findAll(query: {
    page?: number;
    limit?: number;
    userType?: string;
    status?: string;
  }): Promise<{ users: Partial<UserAccount>[]; total: number; page: number; limit: number }> {
    try {
      const page = query.page ?? 1;
      const limit = Math.min(query.limit ?? 20, 50);
      const where: Record<string, unknown> = { isDeleted: false };
      if (query.userType) where['userType'] = query.userType;
      if (query.status) where['status'] = query.status;

      const [users, total] = await this.usersRepository.findAll(where, page, limit);
      return { users: users.map((u) => this.sanitizeUser(u)), total, page, limit };
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  /** GET /users/:id — Admin view */
  async findById(userId: string): Promise<Partial<UserAccount>> {
    try {
      const user = await this.usersRepository.findById(userId);
      if (!user) throw new NotFoundException({ message: 'User not found', code: ErrorCodes.USER_NOT_FOUND });
      return this.sanitizeUser(user);
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  /**
   * PATCH /users/:id/status — Admin status change per FRD §6.1 state machine.
   */
  async updateStatus(userId: string, dto: UpdateUserStatusDto, adminId: string): Promise<Partial<UserAccount>> {
    try {
      const user = await this.usersRepository.findById(userId);
      if (!user) throw new NotFoundException({ message: 'User not found', code: ErrorCodes.USER_NOT_FOUND });

      const allowed = VALID_TRANSITIONS[user.status];
      if (!allowed || !allowed.includes(dto.status)) {
        throw new UnprocessableEntityException({
          message: `Cannot transition from ${user.status} to ${dto.status}`,
          code: ErrorCodes.INVALID_STATUS_TRANSITION,
        });
      }

      const oldStatus = user.status;

      if (dto.status === UserStatus.SUSPENDED && !dto.rejectionReason) {
        throw new UnprocessableEntityException({
          message: 'rejection_reason is required when suspending an account',
          code: ErrorCodes.VALIDATION_ERROR,
        });
      }

      user.status = dto.status;
      user.actionDate = new Date();
      user.updatedBy = adminId;

      if (dto.status === UserStatus.SUSPENDED) {
        user.rejectionReason = dto.rejectionReason ?? null;
        await this.usersRepository.updateLoginSessionsExpired(userId);
      }

      if (dto.status === UserStatus.ACTIVE && oldStatus === UserStatus.SUSPENDED) {
        user.rejectionReason = null;
      }

      const saved = await this.usersRepository.save(user);

      await this.redisService.publish('user.account_status_changed', {
        user_id: userId,
        new_status: dto.status,
        old_status: oldStatus,
        correlation_id: crypto.randomUUID(),
      });

      return this.sanitizeUser(saved);
    } catch (error) {
      this.handleError(error, 'updateStatus');
    }
  }

  /** POST /users/:id/role — Assign role (FR-US-038) */
  async assignRole(userId: string, roleId: string, adminId: string): Promise<Partial<UserAccount>> {
    try {
      const user = await this.usersRepository.findById(userId);
      if (!user) throw new NotFoundException({ message: 'User not found', code: ErrorCodes.USER_NOT_FOUND });

      user.roleId = roleId;
      user.updatedBy = adminId;
      const saved = await this.usersRepository.save(user);
      return this.sanitizeUser(saved);
    } catch (error) {
      this.handleError(error, 'assignRole');
    }
  }

  /** Strip password and sensitive fields from response */
  private sanitizeUser(user: UserAccount): Partial<UserAccount> {
    const { password, isDeleted, ...safe } = user;
    return safe;
  }

  private handleError(error: unknown, method: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    this.logger.error(`UsersService.${method} failed`, error instanceof Error ? error.stack : undefined);
    throw new InternalServerErrorException('Unexpected user service error');
  }
}
