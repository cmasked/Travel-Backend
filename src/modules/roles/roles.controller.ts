import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { Role } from './entities/role.entity';

/**
 * Roles endpoints — FRD §5.4. Admin JWT required.
 */
@UseGuards(AdminGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /** GET /roles — List all roles, filterable by type (FR-US-033) */
  @Get()
  async findAll(@Query('type') type?: string): Promise<Role[]> {
    try {
      return await this.rolesService.findAll(type);
    } catch (error) {
      throw error;
    }
  }

  /** POST /roles — Create a new role (FR-US-034) */
  @Post()
  async create(@Body() dto: CreateRoleDto, @CurrentUser() admin: JwtPayload): Promise<Partial<Role>> {
    try {
      return await this.rolesService.create(dto, admin.sub);
    } catch (error) {
      throw error;
    }
  }

  /** GET /roles/:id — Get role detail */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Role | null> {
    try {
      return await this.rolesService.findById(id);
    } catch (error) {
      throw error;
    }
  }
}
