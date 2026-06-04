import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { PermissionResponse } from '../../shared/interfaces/permission-response.interface';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsService } from './permissions.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  findAll(): Promise<PermissionResponse[]> {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PermissionResponse> {
    return this.permissionsService.findById(id);
  }

  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto): Promise<PermissionResponse> {
    return this.permissionsService.create(createPermissionDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto): Promise<PermissionResponse> {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.permissionsService.remove(id);
  }
}
