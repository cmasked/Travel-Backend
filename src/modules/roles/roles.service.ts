import {
  ConflictException,
  Injectable,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { ErrorCodes } from '../../shared/constants/error-codes';
import { RolesRepository } from './roles.repository';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    private readonly rolesRepository: RolesRepository,
  ) {}

  /** FR-US-033 — List all active, non-deleted roles. Filterable by type and name. */
  async findAll(type?: string, name?: string): Promise<Role[]> {
    try {
      const where: Record<string, unknown> = { isActive: true, isDeleted: false };
      if (type) where['type'] = type;
      return this.rolesRepository.findAll(where, name);
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  /** FR-US-034 — Create role. name must be unique, type immutable after creation. */
  async create(dto: CreateRoleDto, adminId?: string): Promise<Role> {
    try {
      const existing = await this.rolesRepository.findByName(dto.name);
      if (existing) {
        throw new ConflictException({ message: 'Role name already exists', code: ErrorCodes.ROLE_ALREADY_EXISTS });
      }

      const role = this.rolesRepository.create({
        name: dto.name,
        description: dto.description,
        type: dto.type,
        createdBy: adminId,
      });
      return this.rolesRepository.save(role);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  /** GET /roles/:id */
  async findById(id: string): Promise<Role> {
    try {
      const role = await this.rolesRepository.findById(id);
      if (!role) throw new NotFoundException({ message: 'Role not found', code: ErrorCodes.ROLE_NOT_FOUND });
      return role;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  private handleError(error: unknown, method: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    this.logger.error(`RolesService.${method} failed`, error instanceof Error ? error.stack : undefined);
    throw new InternalServerErrorException('Unexpected role service error');
  }
}
