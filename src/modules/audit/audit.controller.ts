import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { ForceLogoutDto } from './dto/force-logout.dto';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { MessageResponse } from '../../shared/interfaces';

/**
 * Audit endpoints — FRD §5.5.
 */
@Controller('users')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /** POST /users/:id/force-logout — Admin force logout (FR-US-042) */
  @UseGuards(AdminGuard)
  @Post(':id/force-logout')
  async forceLogout(
    @Param('id') userId: string,
    @Body() dto: ForceLogoutDto,
    @CurrentUser() admin: JwtPayload,
  ): Promise<MessageResponse> {
    try {
      return await this.auditService.forceLogout(userId, dto.all ?? false, admin.sub);
    } catch (error) {
      throw error;
    }
  }
}
