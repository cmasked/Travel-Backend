import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { Public } from '../../shared/decorators/public.decorator';
import { Banner } from './entities/banner.entity';
import { BannerListResponse } from './interfaces/banner-response.interface';
import { MessageResponse } from '../../shared/interfaces';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  /** POST /banners — Create a new banner (Admin) */
  @UseGuards(AdminGuard)
  @Post()
  async create(@Body() createBannerDto: CreateBannerDto, @CurrentUser() admin: JwtPayload): Promise<Partial<Banner>> {
    try {
      return await this.bannersService.create(createBannerDto, admin.sub);
    } catch (error) {
      throw error;
    }
  }

  /** GET /banners/public — Get all active banners (Public Frontend) */
  @Public()
  @Get('public')
  async findActivePublic(@Query('bannerModule') bannerModule?: string): Promise<Banner[]> {
    try {
      return await this.bannersService.findActivePublic(bannerModule);
    } catch (error) {
      throw error;
    }
  }

  /** GET /banners — List all banners, paginated (Admin) */
  @UseGuards(AdminGuard)
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('bannerModule') bannerModule?: string,
  ): Promise<BannerListResponse> {
    try {
      return await this.bannersService.findAll({
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
        bannerModule,
      });
    } catch (error) {
      throw error;
    }
  }

  /** GET /banners/:id — Get a single banner (Admin) */
  @UseGuards(AdminGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Partial<Banner>> {
    try {
      return await this.bannersService.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /** PATCH /banners/:id — Update a banner (Admin) */
  @UseGuards(AdminGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
    @CurrentUser() admin: JwtPayload,
  ): Promise<Partial<Banner>> {
    try {
      return await this.bannersService.update(id, updateBannerDto, admin.sub);
    } catch (error) {
      throw error;
    }
  }

  /** DELETE /banners/:id — Soft delete a banner (Admin) */
  @UseGuards(AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<MessageResponse> {
    try {
      return await this.bannersService.remove(id);
    } catch (error) {
      throw error;
    }
  }
}
