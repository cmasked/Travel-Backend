import { ApiMandatoryHeaders } from '../../../swagger/decorators/api-mandatory-headers.decorator';
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreateSubAdminDto } from './dto/create-subadmin.dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../../shared/interfaces/jwt-payload.interface';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { UserAccount } from '../entities/user-account.entity';
import { UserListResponse } from '../interfaces/user-response.interface';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin Users')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@ApiMandatoryHeaders()
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) { }

  /** GET /admin/users — List users, paginated, filterable by date and role (Admin) */
  @ApiOperation({ summary: 'List Users', description: 'Retrieve a paginated list of users. Admin only.' })
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
      return await this.adminUsersService.findAll({
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

  /** GET /admin/users/:id — Admin view */
  @ApiOperation({ summary: 'Get User by ID', description: 'Retrieve details of a specific user. Admin only.' })
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Partial<UserAccount>> {
    try {
      return await this.adminUsersService.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /** PATCH /admin/users/:id/status — Update user status (Admin) */
  @ApiOperation({ summary: 'Update User Status', description: 'Update the status of a specific user. Admin only.' })
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() admin: JwtPayload,
  ): Promise<Partial<UserAccount>> {
    try {
      return await this.adminUsersService.updateStatus(id, dto, admin.sub);
    } catch (error) {
      throw error;
    }
  }

  /** POST /admin/users/:id/role — Assign role to user */
  @ApiOperation({ summary: 'Assign Role', description: 'Assign a role to a specific user. Admin only.' })
  @Post(':id/role')
  async assignRole(
    @Param('id') id: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser() admin: JwtPayload,
  ): Promise<Partial<UserAccount>> {
    try {
      return await this.adminUsersService.assignRole(id, dto.roleId, admin.sub);
    } catch (error) {
      throw error;
    }
  }

  /** POST /admin/users/sub-admin — Create a new sub-admin user */
  @ApiOperation({ summary: 'Create Sub-Admin', description: 'Create a new sub-admin user. Admin only.' })
  @Post('sub-admin')
  async createSubAdmin(
    @Body() dto: CreateSubAdminDto,
    @CurrentUser() admin: JwtPayload,
  ): Promise<Partial<UserAccount>> {
    try {
      return await this.adminUsersService.createSubAdmin(dto, admin.sub);
    } catch (error) {
      throw error;
    }
  }
}
