import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { AdminGuard } from '../../shared/guards/admin.guard';

/**
 * User endpoints — FRD §5.2 + §5.5 (admin).
 * Routes prefixed /users.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── Self-service (JWT required) ─────────────────────────────

  /** GET /users/me — Retrieve own profile (FR-US-021) */
  @Get('me')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.getProfile(user.sub);
  }

  /** PATCH /users/me — Update own profile (FR-US-022) */
  @Patch('me')
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  /** POST /users/me/change-password — (FR-US-025) */
  @Post('me/change-password')
  changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.sub, dto);
  }

  // ─── Admin endpoints ─────────────────────────────────────────

  /** GET /users — List users, paginated (Admin) */
  @UseGuards(AdminGuard)
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userType') userType?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      userType,
      status,
    });
  }

  /** GET /users/:id — Admin view (FR-US-044: no PII in logs) */
  @UseGuards(AdminGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  /** PATCH /users/:id/status — Update user status (Admin) */
  @UseGuards(AdminGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.usersService.updateStatus(id, dto, admin.sub);
  }

  /** POST /users/:id/role — Assign role to user (FR-US-038) */
  @UseGuards(AdminGuard)
  @Post(':id/role')
  assignRole(
    @Param('id') id: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.usersService.assignRole(id, dto.roleId, admin.sub);
  }
}
