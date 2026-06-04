import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PermissionRepository } from '../../modules/permissions/repositories/permission.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { SetRolePermissionsDto } from './dto/set-role-permissions.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponse } from '../../shared/interfaces/role-response.interface';
import { Role } from './entities/role.entity';
import { RoleRepository } from './repositories/role.repository';

@Injectable()
export class RolesService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleResponse> {
    const existingRole = await this.roleRepository.findByCodeOrName(createRoleDto.code, createRoleDto.name);

    if (existingRole) {
      throw new ConflictException('Role already exists');
    }

    const role = this.roleRepository.create(createRoleDto);
    const savedRole = await this.roleRepository.save(role);
    return this.toResponse(savedRole);
  }

  async findAll(): Promise<RoleResponse[]> {
    const roles = await this.roleRepository.findAll();
    return roles.map((role) => this.toResponse(role));
  }

  async findById(id: string): Promise<RoleResponse> {
    const role = await this.roleRepository.findById(id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return this.toResponse(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleResponse> {
    const role = await this.roleRepository.findById(id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (updateRoleDto.code && updateRoleDto.code !== role.code) {
      const existingRole = await this.roleRepository.findByCodeOrName(updateRoleDto.code, updateRoleDto.name ?? updateRoleDto.code);

      if (existingRole && existingRole.id !== id) {
        throw new ConflictException('Role already exists');
      }
    }

    if (updateRoleDto.name !== undefined) {
      role.name = updateRoleDto.name;
    }

    if (updateRoleDto.code !== undefined) {
      role.code = updateRoleDto.code;
    }

    const savedRole = await this.roleRepository.save(role);
    return this.toResponse(savedRole);
  }

  async remove(id: string): Promise<void> {
    const role = await this.roleRepository.findById(id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.roleRepository.remove(role);
  }

  async setPermissions(id: string, dto: SetRolePermissionsDto): Promise<RoleResponse> {
    const role = await this.roleRepository.findById(id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permissions = await Promise.all(dto.permissionIds.map((permissionId) => this.permissionRepository.findById(permissionId)));
    const validPermissions = permissions.filter((permission): permission is NonNullable<typeof permission> => Boolean(permission));

    if (validPermissions.length !== dto.permissionIds.length) {
      throw new NotFoundException('One or more permissions were not found');
    }

    const updatedRole = await this.roleRepository.setPermissions(id, dto.permissionIds);
    return this.toResponse(updatedRole);
  }

  toResponse(role: Role): RoleResponse {
    return {
      id: role.id,
      name: role.name,
      code: role.code,
      permissions: (role.permissions ?? []).map((permission) => permission.code),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
