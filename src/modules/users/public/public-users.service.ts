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
import { UserAccount } from '../entities/user-account.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ErrorCodes } from '../../../shared/constants/error-codes';
import { RedisService } from '../../redis/redis.service';
import { UsersRepository } from '../users.repository';
import { MessageResponse } from '../../../shared/interfaces';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class PublicUsersService {
  private readonly logger = new Logger(PublicUsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly redisService: RedisService,
  ) { }

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
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<MessageResponse> {
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

  /** Strip password and sensitive fields from response */
  private sanitizeUser(user: UserAccount): Partial<UserAccount> {
    const { password, isDeleted, ...safe } = user;
    return safe;
  }

  private handleError(error: unknown, method: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    this.logger.error(`PublicUsersService.${method} failed`, error instanceof Error ? error.stack : undefined);
    throw new InternalServerErrorException('Unexpected user service error');
  }
}
