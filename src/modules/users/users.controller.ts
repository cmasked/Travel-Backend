import { Body, Controller, Delete, Get, Param, Patch, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { UserResponse } from '../../shared/interfaces/user-response.interface';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Permissions('manage_users')
  @Get()
  findAll(): Promise<UserResponse[]> {
    return this.usersService.findAll();
  }

  @Get('me')
  me(@CurrentUser() user: JwtPayload): Promise<UserResponse> {
    return this.usersService.findById(user.sub);
  }

  @Permissions('manage_users')
  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserResponse> {
    return this.usersService.findById(id);
  }

  @Get('me/profile')
  profile(@CurrentUser() user: JwtPayload): Promise<UserResponse> {
    return this.usersService.findById(user.sub);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: JwtPayload, @Body() updateUserDto: UpdateUserDto): Promise<UserResponse> {
    return this.usersService.update(user.sub, updateUserDto);
  }

  @Permissions('manage_users')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserResponse> {
    return this.usersService.update(id, updateUserDto);
  }

  @Permissions('manage_users')
  @Put(':id/roles')
  assignRoles(@Param('id') id: string, @Body() assignRolesDto: AssignRolesDto): Promise<UserResponse> {
    return this.usersService.assignRoles(id, assignRolesDto.roleIds);
  }

  @Permissions('manage_users')
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
