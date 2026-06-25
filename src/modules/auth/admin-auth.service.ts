import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { ErrorCodes } from '../../shared/constants/error-codes';
import { UserStatus, AccessTokenType } from '../../shared/enums';
import { RedisService } from '../redis/redis.service';
import { AuthRepository } from './auth.repository';
import { EncryptionService } from '../../shared/services/encryption.service';
import { BaseAuthService } from './base-auth.service';

const FAILED_LOGIN_MAX = 10;
const FAILED_LOGIN_TTL_SECONDS = 15 * 60;

/**
 * Admin authentication service.
 * Handles admin-specific login logic.
 * Inherits logout, refresh, validate from BaseAuthService.
 */
@Injectable()
export class AdminAuthService extends BaseAuthService {
  constructor(
    authRepository: AuthRepository,
    jwtService: JwtService,
    redisService: RedisService,
    encryptionService: EncryptionService,
  ) {
    super(authRepository, jwtService, redisService, encryptionService);
  }

  /**
   * Admin login — same password check as public, but:
   * 1. Requires user to have a roleId (i.e., they must be an admin).
   * 2. Skips OTP verification (admins are pre-verified).
   * 3. Returns roleId in the response for dashboard use.
   */
  async login(dto: LoginDto, ip?: string, userAgent?: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Record<string, unknown>;
  }> {
    try {
      const email = dto.email.toLowerCase();
      const failKey = `failed_admin_logins:${email}`;
      const failCount = parseInt((await this.redisService.get(failKey)) ?? '0', 10);
      if (failCount >= FAILED_LOGIN_MAX) {
        throw new ForbiddenException({
          message: 'Account locked due to too many failed login attempts. Try again in 15 minutes.',
          code: ErrorCodes.ACCOUNT_LOCKED,
        });
      }

      const user = await this.authRepository.findUserByEmail(email);
      if (!user || !user.password) {
        await this.redisService.incr(failKey);
        await this.redisService.expire(failKey, FAILED_LOGIN_TTL_SECONDS);
        throw new UnauthorizedException({ message: 'Invalid credentials', code: ErrorCodes.INVALID_CREDENTIALS });
      }

      // Admin-specific check: user must have a roleId
      if (!user.roleId) {
        throw new ForbiddenException({ message: 'Admin access required', code: ErrorCodes.PERMISSION_DENIED });
      }

      const passwordValid = await bcrypt.compare(dto.password, user.password);
      if (!passwordValid) {
        await this.redisService.incr(failKey);
        await this.redisService.expire(failKey, FAILED_LOGIN_TTL_SECONDS);
        throw new UnauthorizedException({ message: 'Invalid credentials', code: ErrorCodes.INVALID_CREDENTIALS });
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new ForbiddenException({
          message: `Account is ${user.status}`,
          code: ErrorCodes.ACCOUNT_INACTIVE,
        });
      }

      await this.redisService.del(failKey);

      const refreshTokenRaw = crypto.randomBytes(64).toString('hex');
      const loginLog = await this.authRepository.saveLoginLog(this.authRepository.createLoginLog({
        userId: user.userId,
        ip: ip ?? null,
        deviceInformation: userAgent ? userAgent.substring(0, 500) : null,
        accessTokenType: AccessTokenType.LOGIN,
        refreshToken: this.encryptionService.encrypt(refreshTokenRaw),
        isTokenExpired: false,
      }));

      const payload: JwtPayload = {
        sub: user.userId,
        type: user.userType,
        roleId: user.roleId,
        sessionId: loginLog.loginLogId,
      };
      const accessToken = this.jwtService.sign(payload);

      loginLog.accessToken = this.encryptionService.encrypt(accessToken);
      await this.authRepository.saveLoginLog(loginLog);

      await this.redisService.publish('admin.login', {
        user_id: user.userId,
        device_type: loginLog.loginDevice,
        correlation_id: crypto.randomUUID(),
      });

      return {
        accessToken,
        refreshToken: refreshTokenRaw,
        user: {
          userId: user.userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          roleId: user.roleId,
        },
      };
    } catch (error) {
      this.handleError(error, 'login');
    }
  }
}
