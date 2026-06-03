import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponse } from './interfaces/user-response.interface';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from '../roles/repositories/role.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async create(createUserDto: CreateUserDto, roleCodes: string[] = ['user']): Promise<UserResponse> {
    const normalizedEmail = createUserDto.email.toLowerCase();
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 12);
    const roles = await this.roleRepository.findByCodes(roleCodes);
    const user = this.userRepository.create({
      name: createUserDto.name,
      email: normalizedEmail,
      passwordHash,
      roles,
    });

    const savedUser = await this.userRepository.save(user);
    return this.toResponse(savedUser);
  }

  async findAll(): Promise<UserResponse[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => this.toResponse(user));
  }

  async findById(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toResponse(user);
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findByEmailWithPassword(email.toLowerCase());
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email && updateUserDto.email.toLowerCase() !== user.email) {
      const existingUser = await this.userRepository.findByEmail(updateUserDto.email.toLowerCase());

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    if (updateUserDto.name !== undefined) {
      user.name = updateUserDto.name;
    }

    if (updateUserDto.email !== undefined) {
      user.email = updateUserDto.email.toLowerCase();
    }

    if (updateUserDto.password !== undefined) {
      user.passwordHash = await bcrypt.hash(updateUserDto.password, 12);
    }

    const savedUser = await this.userRepository.save(user);
    return this.toResponse(savedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);
  }

  async assignRoles(id: string, roleIds: string[]): Promise<UserResponse> {
    const user = await this.userRepository.setRoles(id, roleIds);
    return this.toResponse(user);
  }

  toResponse(user: User): UserResponse {
    const roles = user.roles ?? [];
    const permissions = [...new Set(roles.flatMap((role) => role.permissions?.map((permission) => permission.code) ?? []))];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: roles.map((role) => role.code),
      permissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
