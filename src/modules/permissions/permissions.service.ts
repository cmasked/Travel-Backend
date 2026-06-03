import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionResponse } from './interfaces/permission-response.interface';
import { Permission } from './entities/permission.entity';
import { PermissionRepository } from './repositories/permission.repository';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<PermissionResponse> {
    const existingPermission = await this.permissionRepository.findByCodeOrName(createPermissionDto.code, createPermissionDto.name);

    if (existingPermission) {
      throw new ConflictException('Permission already exists');
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    const savedPermission = await this.permissionRepository.save(permission);
    return this.toResponse(savedPermission);
  }

  async findAll(): Promise<PermissionResponse[]> {
    const permissions = await this.permissionRepository.findAll();
    return permissions.map((permission) => this.toResponse(permission));
  }

  async findById(id: string): Promise<PermissionResponse> {
    const permission = await this.permissionRepository.findById(id);

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return this.toResponse(permission);
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<PermissionResponse> {
    const permission = await this.permissionRepository.findById(id);

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (updatePermissionDto.name !== undefined) {
      permission.name = updatePermissionDto.name;
    }

    if (updatePermissionDto.code !== undefined) {
      permission.code = updatePermissionDto.code;
    }

    const savedPermission = await this.permissionRepository.save(permission);
    return this.toResponse(savedPermission);
  }

  async remove(id: string): Promise<void> {
    const permission = await this.permissionRepository.findById(id);

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.permissionRepository.remove(permission);
  }

  toResponse(permission: Permission): PermissionResponse {
    return {
      id: permission.id,
      name: permission.name,
      code: permission.code,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  }
}
