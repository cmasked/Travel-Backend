import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreateSubAdminDto } from './dto/create-subadmin.dto';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { UserAccount } from './entities/user-account.entity';
import { MessageResponse } from '../../shared/interfaces';
import { UserListResponse } from './interfaces/user-response.interface';

/**
 * User endpoints — FRD §5.2 + §5.5 (admin).
 * Routes prefixed /users.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // ─── Self-service (JWT required) ─────────────────────────────

  /** GET /users/me — Retrieve own profile (FR-US-021) */
  @Get('me')
  async getProfile(@CurrentUser() user: JwtPayload): Promise<Partial<UserAccount>> {
    try {
      return await this.usersService.getProfile(user.sub);
    } catch (error) {
      throw error;
    }
  }

  /** PATCH /users/me — Update own profile (FR-US-022) */
  @Patch('me')
  async updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto): Promise<Partial<UserAccount>> {
    try {
      return await this.usersService.updateProfile(user.sub, dto);
    } catch (error) {
      throw error;
    }
  }

  /** POST /users/me/change-password — (FR-US-025) */
  @Post('me/change-password')
  async changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto): Promise<MessageResponse> {
    try {
      return await this.usersService.changePassword(user.sub, dto);
    } catch (error) {
      throw error;
    }
  }

  // ─── Admin endpoints ─────────────────────────────────────────

  /** GET /users — List users, paginated, filterable by date and role (Admin) */
  @UseGuards(AdminGuard)
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userType') userType?: string,
    @Query('status') status?: string,
    @Query('roleId') roleId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ): Promise<UserListResponse> {
    try {
      return await this.usersService.findAll({
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
        userType,
        status,
        roleId,
        fromDate,
        toDate,
      });
    } catch (error) {
      throw error;
    }
  }

  /** GET /users/:id — Admin view (FR-US-044: no PII in logs) */
  @UseGuards(AdminGuard)
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Partial<UserAccount>> {
    try {
      return await this.usersService.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /** PATCH /users/:id/status — Update user status (Admin) */
  @UseGuards(AdminGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() admin: JwtPayload,
  ): Promise<Partial<UserAccount>> {
    try {
      return await this.usersService.updateStatus(id, dto, admin.sub);
    } catch (error) {
      throw error;
    }
  }

  /** POST /users/:id/role — Assign role to user (FR-US-038) */
  @UseGuards(AdminGuard)
  @Post(':id/role')
  async assignRole(
    @Param('id') id: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser() admin: JwtPayload,
  ): Promise<Partial<UserAccount>> {
    try {
      return await this.usersService.assignRole(id, dto.roleId, admin.sub);
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /users/sub-admin — Create a new sub-admin user
   * Only existing Admins with a valid JWT token can call this.
   */
  @UseGuards(AdminGuard)
  @Post('sub-admin')
  async createSubAdmin(
    @Body() dto: CreateSubAdminDto,
    @CurrentUser() admin: JwtPayload,
  ): Promise<Partial<UserAccount>> {
    try {
      return await this.usersService.createSubAdmin(dto, admin.sub);
    } catch (error) {
      throw error;
    }
  }
}