import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { LoginLog } from '../audit/entities/login-log.entity';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { ErrorCodes } from '../../shared/constants/error-codes';
import { UserStatus, AccessTokenType } from '../../shared/enums';
import { RedisService } from '../redis/redis.service';
import { AuthRepository } from './auth.repository';
import { EncryptionService } from '../../shared/services/encryption.service';
import { MessageResponse, TokenRefreshResponse, SessionValidationResponse } from '../../shared/interfaces';

/**
 * Base authentication service containing shared logic
 * used by both PublicAuthService and AdminAuthService.
 *
 * Methods here: logout, refresh, validate, handleError.
 */
@Injectable()
export class BaseAuthService {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly authRepository: AuthRepository,
    protected readonly jwtService: JwtService,
    protected readonly redisService: RedisService,
    protected readonly encryptionService: EncryptionService,
  ) {}

  /**
   * FR-US-017 — Logout.
   */
  async logout(sessionId: string, userId: string): Promise<MessageResponse> {
    try {
      const loginLog = await this.authRepository.findSessionByIdAndUser(sessionId, userId);
      if (loginLog) {
        loginLog.isTokenExpired = true;
        await this.authRepository.saveLoginLog(loginLog);
      }

      await this.redisService.publish('user.logout', {
        user_id: userId,
        login_log_id: sessionId,
        correlation_id: crypto.randomUUID(),
      });

      return { message: 'Logged out successfully' };
    } catch (error) {
      this.handleError(error, 'logout');
    }
  }

  /**
   * FR-US-016 — Token refresh with rotation.
   */
  async refresh(refreshToken: string): Promise<TokenRefreshResponse> {
    try {
      const logs = await this.authRepository.findActiveRefreshLogs();
      let matchedLog: LoginLog | null = null;

      for (const log of logs) {
        if (log.refreshToken) {
          try {
            const stored = this.encryptionService.decrypt(log.refreshToken);
            if (stored === refreshToken) {
              matchedLog = log;
              break;
            }
          } catch {
            continue;
          }
        }
      }

      if (!matchedLog) {
        throw new UnauthorizedException({ message: 'Invalid refresh token', code: ErrorCodes.INVALID_REFRESH_TOKEN });
      }

      const user = await this.authRepository.findUserById(matchedLog.userId);
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new ForbiddenException({ message: 'Account not active', code: ErrorCodes.ACCOUNT_INACTIVE });
      }

      const newRefreshToken = crypto.randomBytes(64).toString('hex');
      const payload: JwtPayload = {
        sub: user.userId,
        type: user.userType,
        roleId: user.roleId,
        sessionId: matchedLog.loginLogId,
      };
      const newAccessToken = this.jwtService.sign(payload);

      matchedLog.accessToken = this.encryptionService.encrypt(newAccessToken);
      matchedLog.refreshToken = this.encryptionService.encrypt(newRefreshToken);
      matchedLog.accessTokenType = AccessTokenType.REFRESH;
      matchedLog.lastTokenRefreshedAt = new Date();
      await this.authRepository.saveLoginLog(matchedLog);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      this.handleError(error, 'refresh');
    }
  }

  /**
   * FR-US-019 — Validate session. Must complete < 20ms p95.
   */
  async validate(sessionId: string): Promise<SessionValidationResponse> {
    try {
      const log = await this.authRepository.findSessionValidationRow(sessionId);
      return { valid: !!log && !log.isTokenExpired };
    } catch (error) {
      this.handleError(error, 'validate');
    }
  }

  protected handleError(error: unknown, method: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    this.logger.error(`${this.constructor.name}.${method} failed`, error instanceof Error ? error.stack : undefined);
    throw new InternalServerErrorException('Unexpected auth service error');
  }
}
