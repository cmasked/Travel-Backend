import { Injectable, Logger, HttpException, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import { Permission } from './entities/permission.entity';
import { UpsertPermissionsDto } from './dto/upsert-permissions.dto';
import { RedisService } from '../redis/redis.service';
import { PermissionsRepository } from './permissions.repository';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(
    private readonly permissionsRepository: PermissionsRepository,
    private readonly redisService: RedisService,
  ) {}

  /**
   * FR-US-035 — Get permission matrix for a role, joined with module/sub-module names.
   */
  async findByRole(roleId: string): Promise<Permission[]> {
    try {
      return this.permissionsRepository.findByRole(roleId);
    } catch (error) {
      this.handleError(error, 'findByRole');
    }
  }

  /**
   * FR-US-036 — Upsert full permission set for a role (transactional).
   * Uses INSERT ... ON CONFLICT DO UPDATE pattern via save().
   */
  async upsertForRole(roleId: string, dto: UpsertPermissionsDto, adminId?: string): Promise<Permission[]> {
    try {
      await this.permissionsRepository.deleteByRole(roleId);

      const permissions = dto.permissions.map((p) =>
        this.permissionsRepository.create({
          roleId,
          moduleId: p.moduleId,
          subModuleId: p.subModuleId ?? null,
          canCreate: p.canCreate,
          canRead: p.canRead,
          canUpdate: p.canUpdate,
          canDelete: p.canDelete,
          isActive: true,
          createdBy: adminId,
          updatedBy: adminId,
        }),
      );

      const saved = await this.permissionsRepository.save(permissions);

      await this.redisService.delByPrefix(`perm:${roleId}:`);
      await this.redisService.publish('perm.cache_invalidated', {
        role_id: roleId,
        correlation_id: crypto.randomUUID(),
      });

      return saved as Permission[];
    } catch (error) {
      this.handleError(error, 'upsertForRole');
    }
  }

  /**
   * FR-US-037 — Permission check. Redis-cached with 5-min TTL.
   * Called by API Gateway on every protected request. Must be < 15ms p95.
   */
  async checkPermission(
    roleId: string,
    moduleId: number,
    action: 'create' | 'read' | 'update' | 'delete',
  ): Promise<boolean> {
    try {
      const cacheKey = `perm:${roleId}:${moduleId}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        const perms = JSON.parse(cached);
        return !!perms[`can_${action}`];
      }

      const perm = await this.permissionsRepository.findOneByRoleAndModule(roleId, moduleId);

      if (!perm) {
        await this.redisService.set(cacheKey, JSON.stringify({
          can_create: false,
          can_read: false,
          can_update: false,
          can_delete: false,
        }), 300);
        return false;
      }

      const permData = {
        can_create: perm.canCreate,
        can_read: perm.canRead,
        can_update: perm.canUpdate,
        can_delete: perm.canDelete,
      };
      await this.redisService.set(cacheKey, JSON.stringify(permData), 300);

      const actionKey = `can_${action}` as keyof typeof permData;
      return !!permData[actionKey];
    } catch (error) {
      this.handleError(error, 'checkPermission');
    }
  }

  private handleError(error: unknown, method: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    this.logger.error(`PermissionsService.${method} failed`, error instanceof Error ? error.stack : undefined);
    throw new InternalServerErrorException('Unexpected permissions service error');
  }
}
