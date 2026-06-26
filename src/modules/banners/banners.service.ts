import {
  ConflictException,
  Injectable,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ErrorCodes } from '../../shared/constants/error-codes';
import { BannersRepository } from './banners.repository';
import { MessageResponse } from '../../shared/interfaces';
import { BannerListResponse } from './interfaces/banner-response.interface';
import { buildPaginationMeta } from '../../shared/utils/pagination.util';

@Injectable()
export class BannersService {
  private readonly logger = new Logger(BannersService.name);

  constructor(private readonly bannersRepository: BannersRepository) {}

  /** Create a new banner */
  async create(dto: CreateBannerDto, adminId: string): Promise<Banner> {
    try {
      const existing = await this.bannersRepository.findByCode(dto.bannerCode);
      if (existing) {
        throw new ConflictException({
          message: 'A banner with this code already exists',
          code: ErrorCodes.BANNER_ALREADY_EXISTS,
        });
      }

      const banner = this.bannersRepository.create({
        bannerName: dto.bannerName,
        bannerCode: dto.bannerCode,
        description: dto.description ?? null,
        images: dto.images ?? [],
        linkUrl: dto.linkUrl ?? null,
        sortOrder: dto.sortOrder ?? 0,
        bannerModule: dto.bannerModule,
        createdBy: adminId,
      });

      return this.bannersRepository.save(banner);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  /** Admin list all banners (paginated) */
  async findAll(query: { page?: number; limit?: number; bannerModule?: string; name?: string }): Promise<BannerListResponse> {
    try {
      const page = query.page ?? 1;
      const limit = Math.min(query.limit ?? 20, 50);
      const where: Record<string, unknown> = { isDeleted: false };
      
      if (query.bannerModule) {
        where['bannerModule'] = query.bannerModule;
      }

      const [banners, total] = await this.bannersRepository.findAll(where, page, limit, query.name);

      return {
        data: banners,
        meta: buildPaginationMeta(total, page, limit),
      };
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  /** Public list all active banners */
  async findActivePublic(bannerModule?: string): Promise<Banner[]> {
    try {
      return this.bannersRepository.findActivePublic(bannerModule);
    } catch (error) {
      this.handleError(error, 'findActivePublic');
    }
  }

  /** Get a single banner by ID */
  async findById(bannerId: string): Promise<Banner> {
    try {
      const banner = await this.bannersRepository.findById(bannerId);
      if (!banner) {
        throw new NotFoundException({
          message: 'Banner not found',
          code: ErrorCodes.BANNER_NOT_FOUND,
        });
      }
      return banner;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  /** Update an existing banner */
  async update(bannerId: string, dto: UpdateBannerDto, adminId: string): Promise<Banner> {
    try {
      const banner = await this.findById(bannerId);

      if (dto.bannerCode && dto.bannerCode !== banner.bannerCode) {
        const existing = await this.bannersRepository.findByCode(dto.bannerCode);
        if (existing) {
          throw new ConflictException({
            message: 'A banner with this code already exists',
            code: ErrorCodes.BANNER_ALREADY_EXISTS,
          });
        }
      }

      if (dto.bannerName !== undefined) banner.bannerName = dto.bannerName;
      if (dto.bannerCode !== undefined) banner.bannerCode = dto.bannerCode;
      if (dto.description !== undefined) banner.description = dto.description ?? null;
      if (dto.images !== undefined) banner.images = dto.images ?? [];
      if (dto.linkUrl !== undefined) banner.linkUrl = dto.linkUrl ?? null;
      if (dto.sortOrder !== undefined) banner.sortOrder = dto.sortOrder;
      if (dto.bannerModule !== undefined) banner.bannerModule = dto.bannerModule;
      if (dto.isActive !== undefined) banner.isActive = dto.isActive;

      banner.updatedBy = adminId;

      return this.bannersRepository.save(banner);
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  /** Soft-delete a banner */
  async remove(bannerId: string): Promise<MessageResponse> {
    try {
      const banner = await this.findById(bannerId);
      await this.bannersRepository.remove(banner);
      return { message: 'Banner deleted successfully' };
    } catch (error) {
      this.handleError(error, 'remove');
    }
  }

  private handleError(error: unknown, method: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    this.logger.error(`BannersService.${method} failed`, error instanceof Error ? error.stack : undefined);
    throw new InternalServerErrorException('Unexpected banner service error');
  }
}
