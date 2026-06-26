import {
  ForbiddenException,
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
  HttpException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserAccount } from '../entities/user-account.entity';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { CreateSubAdminDto } from './dto/create-subadmin.dto';
import { ErrorCodes } from '../../../shared/constants/error-codes';
import { UserStatus, UserType, AuthProvider, TravelerTitle } from '../../../shared/enums';
import { RedisService } from '../../redis/redis.service';
import { UsersRepository } from '../users.repository';
import { UserListQuery, UserListResponse } from '../interfaces/user-response.interface';

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
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly redisService: RedisService,
  ) { }

  /** GET /admin/users — Admin list, paginated, filterable by date and role */
  async findAll(query: UserListQuery): Promise<UserListResponse> {
    try {
      const page = query.page ?? 1;
      const limit = Math.min(query.limit ?? 20, 50);
      const where: Record<string, unknown> = { isDeleted: false };
      if (query.userType) where['userType'] = query.userType;
      if (query.status) where['status'] = query.status;
      if (query.roleId) where['roleId'] = query.roleId;

      const [users, total] = await this.usersRepository.findAll(
        where,
        page,
        limit,
        query.fromDate,
        query.toDate,
      );

      const totalPages = Math.ceil(total / limit);

      return {
        data: users.map((u) => this.sanitizeUser(u)),
        meta: { total, page, limit, totalPages },
      };
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  /** GET /admin/users/:id — Admin view */
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
   * PATCH /admin/users/:id/status — Admin status change per FRD §6.1 state machine.
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

  /** POST /admin/users/:id/role — Assign role (FR-US-038) */
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

  async createSubAdmin(dto: CreateSubAdminDto, creatorAdminId: string): Promise<Partial<UserAccount>> {
    try {
      const email = dto.email.toLowerCase();
      const existing = await this.usersRepository.findByEmail(email);
      if (existing) {
        throw new ConflictException({ message: 'Email already exists', code: ErrorCodes.EMAIL_ALREADY_EXISTS });
      }

      const role = await this.usersRepository.findRoleById(dto.roleId);
      if (!role) {
        throw new NotFoundException({ message: 'Role not found', code: ErrorCodes.USER_NOT_FOUND });
      }

      const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

      const savedUser = await this.usersRepository.save(
        this.usersRepository.createUser({
          email,
          password: passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          userType: UserType.USER,
          status: UserStatus.ACTIVE,
          authProvider: AuthProvider.LOCAL,
          isEmailVerified: true,
          roleId: role.id,
          createdBy: creatorAdminId,
          updatedBy: creatorAdminId,
        })
      );

      await this.usersRepository.saveTraveler(
        this.usersRepository.createTraveler({
          userId: savedUser.userId,
          title: TravelerTitle.MR,
          firstName: dto.firstName,
          lastName: dto.lastName,
          dob: new Date('2000-01-01'),
          primaryTraveler: true,
        })
      );

      await this.usersRepository.saveAdditional(
        this.usersRepository.createAdditional({
          userId: savedUser.userId,
          featureFlags: {},
        })
      );

      return this.sanitizeUser(savedUser);
    } catch (error) {
      this.handleError(error, 'createSubAdmin');
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

    this.logger.error(`AdminUsersService.${method} failed`, error instanceof Error ? error.stack : undefined);
    throw new InternalServerErrorException('Unexpected admin user service error');
  }
}
