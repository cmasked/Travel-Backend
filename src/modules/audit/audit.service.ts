import { Injectable, Logger, NotFoundException, HttpException, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import { ErrorCodes } from '../../shared/constants/error-codes';
import { RedisService } from '../redis/redis.service';
import { AuditRepository } from './audit.repository';
import { MessageResponse } from '../../shared/interfaces';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private readonly auditRepository: AuditRepository,
    private readonly redisService: RedisService,
  ) {}

  /**
   * FR-US-042 — Force logout.
   * If all = true: set is_token_expired = true on ALL login_logs for user.
   * Always creates an immutable force_logout_logs row.
   */
  async forceLogout(userId: string, all: boolean, adminId: string): Promise<MessageResponse> {
    try {
      const user = await this.auditRepository.findUserById(userId);
      if (!user) throw new NotFoundException({ message: 'User not found', code: ErrorCodes.USER_NOT_FOUND });

      if (all) {
        await this.auditRepository.expireAllSessions(userId);
      }

      const forceLog = this.auditRepository.createForceLogout({
        userId,
        isForceLogoutToAll: all,
        createdBy: adminId,
      });
      await this.auditRepository.saveForceLogout(forceLog);

      await this.redisService.publish('user.force_logout', {
        user_id: userId,
        all,
        admin_id: adminId,
        correlation_id: crypto.randomUUID(),
      });

      return { message: all ? 'All sessions invalidated' : 'Force logout recorded' };
    } catch (error) {
      this.handleError(error, 'forceLogout');
    }
  }

  private handleError(error: unknown, method: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    this.logger.error(`AuditService.${method} failed`, error instanceof Error ? error.stack : undefined);
    throw new InternalServerErrorException('Unexpected audit service error');
  }
}
