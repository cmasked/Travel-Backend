import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { UpsertPermissionsDto } from './dto/upsert-permissions.dto';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { Public } from '../../shared/decorators/public.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';

/**
 * Permissions endpoints — FRD §5.4.
 */
@Controller()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /** GET /roles/:id/permissions — Permission matrix for a role (FR-US-035) */
  @UseGuards(AdminGuard)
  @Get('roles/:id/permissions')
  findByRole(@Param('id') roleId: string) {
    return this.permissionsService.findByRole(roleId);
  }

  /** PUT /roles/:id/permissions — Upsert full permission set (FR-US-036) */
  @UseGuards(AdminGuard)
  @Put('roles/:id/permissions')
  upsertForRole(
    @Param('id') roleId: string,
    @Body() dto: UpsertPermissionsDto,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.permissionsService.upsertForRole(roleId, dto, admin.sub);
  }

  /**
   * GET /permissions/check — Internal permission check (FR-US-037).
   * Called by API Gateway. Must be < 15ms p95. Redis-cached.
   */
  @Public()
  @Get('permissions/check')
  async checkPermission(
    @Query('role_id') roleId: string,
    @Query('module_id') moduleId: string,
    @Query('action') action: string,
  ) {
    const allowed = await this.permissionsService.checkPermission(
      roleId,
      parseInt(moduleId, 10),
      action as 'create' | 'read' | 'update' | 'delete',
    );
    return { allowed };
  }
}
