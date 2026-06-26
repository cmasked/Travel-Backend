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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Admin Users')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@ApiMandatoryHeaders()
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) { }

  /** GET /admin/users — List users, paginated, filterable by date and role (Admin) */
  @ApiOperation({ summary: 'List Users', description: 'Retrieve a paginated list of users. Admin only.' })
  @ApiQuery({ name: 'page', required: false, type: String, description: 'Page number', example: '1' })
  @ApiQuery({ name: 'limit', required: false, type: String, description: 'Items per page', example: '20' })
  @ApiQuery({ name: 'userType', required: false, type: String, description: 'Filter by user type' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by user status' })
  @ApiQuery({ name: 'roleId', required: false, type: String, description: 'Filter by role ID' })
  @ApiQuery({ name: 'fromDate', required: false, type: String, description: 'Filter by start date' })
  @ApiQuery({ name: 'toDate', required: false, type: String, description: 'Filter by end date' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Search by first or last name' })
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userType') userType?: string,
    @Query('status') status?: string,
    @Query('roleId') roleId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('name') name?: string,
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
        name,
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

  /** PATCH /admin/users/status — Update user status (Admin) */
  @ApiOperation({ summary: 'Update User Status', description: 'Update the status of a specific user using the JSON body. Admin only.' })
  @Patch('status')
  async updateStatus(
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() admin: JwtPayload,
  ): Promise<Partial<UserAccount>> {
    try {
      return await this.adminUsersService.updateStatus(dto.userId, dto, admin.sub);
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
