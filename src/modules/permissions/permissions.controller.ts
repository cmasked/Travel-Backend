import { ApiMandatoryHeaders } from '../../swagger/decorators/api-mandatory-headers.decorator';
import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { UpsertPermissionsDto } from './dto/upsert-permissions.dto';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { Public } from '../../shared/decorators/public.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { Permission } from './entities/permission.entity';
import { MessageResponse } from '../../shared/interfaces';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Permissions endpoints — FRD §5.4.
 */
@ApiTags('Permissions')
@ApiMandatoryHeaders()
@Controller()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }

  /** GET /roles/:id/permissions — Permission matrix for a role (FR-US-035) */
  @ApiOperation({ summary: 'Get Permissions for Role', description: 'Retrieve the permission matrix for a specific role.' })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Get('roles/:id/permissions')
  async findByRole(@Param('id') roleId: string): Promise<Permission[]> {
    try {
      return await this.permissionsService.findByRole(roleId);
    } catch (error) {
      throw error;
    }
  }

  /** PUT /roles/:id/permissions — Upsert full permission set (FR-US-036) */
  @ApiOperation({ summary: 'Upsert Permissions', description: 'Update the full permission matrix for a role.' })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Put('roles/:id/permissions')
  async upsertForRole(
    @Param('id') roleId: string,
    @Body() dto: UpsertPermissionsDto,
    @CurrentUser() admin: JwtPayload,
  ): Promise<Permission[]> {
    try {
      return await this.permissionsService.upsertForRole(roleId, dto, admin.sub);
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /permissions/check — Internal permission check (FR-US-037).
   * Called by API Gateway. Must be < 15ms p95. Redis-cached.
   */
  @ApiOperation({ summary: 'Check Permission', description: 'Internal permission check called by API Gateway.' })
  @Public()
  @Get('permissions/check')
  async checkPermission(
    @Query('role_id') roleId: string,
    @Query('module_id') moduleId: string,
    @Query('action') action: string,
  ): Promise<{ allowed: boolean }> {
    try {
      const allowed = await this.permissionsService.checkPermission(
        roleId,
        parseInt(moduleId, 10),
        action as 'create' | 'read' | 'update' | 'delete',
      );
      return { allowed };
    } catch (error) {
      throw error;
    }
  }
}
// EOF: End of controller
