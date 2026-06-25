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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) { }

  /** POST /banners — Create a new banner (Admin) */
  @ApiOperation({ summary: 'Create Banner', description: 'Create a new promotional banner. Admin only.' })
  @ApiBearerAuth()
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
  @ApiOperation({ summary: 'Get Public Banners', description: 'Retrieve all active banners for the public frontend.' })
  @ApiQuery({ name: 'bannerModule', required: false, type: String })
  @Public()
  @Get('public')
  async findActivePublic(@Query('bannerModule') bannerModule?: string
  ): Promise<Banner[]> {
    try {
      return await this.bannersService.findActivePublic(bannerModule);
    } catch (error) {
      throw error;
    }
  }

  /** GET /banners — List all banners, paginated (Admin) */
  @ApiOperation({ summary: 'List All Banners', description: 'Retrieve a paginated list of all banners. Admin only.' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'bannerModule', required: false, type: String })
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
  @ApiOperation({ summary: 'Get Banner', description: 'Retrieve detail for a specific banner. Admin only.' })
  @ApiBearerAuth()
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
  @ApiOperation({ summary: 'Update Banner', description: 'Update an existing banner. Admin only.' })
  @ApiBearerAuth()
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
  @ApiOperation({ summary: 'Delete Banner', description: 'Soft delete a banner. Admin only.' })
  @ApiBearerAuth()
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
