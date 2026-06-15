import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';

/**
 * Roles endpoints — FRD §5.4. Admin JWT required.
 */
@UseGuards(AdminGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /** GET /roles — List all roles, filterable by type (FR-US-033) */
  @Get()
  findAll(@Query('type') type?: string) {
    return this.rolesService.findAll(type);
  }

  /** POST /roles — Create a new role (FR-US-034) */
  @Post()
  create(@Body() dto: CreateRoleDto, @CurrentUser() admin: JwtPayload) {
    return this.rolesService.create(dto, admin.sub);
  }

  /** GET /roles/:id — Get role detail */
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.rolesService.findById(id);
  }
}
