import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const normalizedEmail = createUserDto.email.toLowerCase();
    const existingUser = await this.usersRepository.findOne({ where: { email: normalizedEmail } });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 12);
    const user = this.usersRepository.create({
      name: createUserDto.name,
      email: normalizedEmail,
      passwordHash,
    });

    const savedUser = await this.usersRepository.save(user);
    return this.toResponse(savedUser);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find({ order: { createdAt: 'DESC' } });
    return users.map((user) => this.toResponse(user));
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.findEntityById(id);
    return this.toResponse(user);
  }

  async findEntityById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmailWithPassword(email: string): Promise<User> {
    const normalizedEmail = email.toLowerCase();
    const user = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.findEntityById(id);

    if (updateUserDto.email && updateUserDto.email.toLowerCase() !== user.email) {
      const existingUser = await this.usersRepository.findOne({ where: { email: updateUserDto.email.toLowerCase() } });

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

    const savedUser = await this.usersRepository.save(user);
    return this.toResponse(savedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findEntityById(id);
    await this.usersRepository.remove(user);
  }

  toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
