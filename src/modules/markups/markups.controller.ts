import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MarkupsService } from './markups.service';
import { CreateMarkupDto } from './dto/create-markup.dto';
import { UpdateMarkupDto } from './dto/update-markup.dto';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { Markup } from './entities/markup.entity';
import { MessageResponse } from '../../shared/interfaces';

/**
 * Markup endpoints — Admin only.
 * All routes prefixed /markups.
 */
@UseGuards(AdminGuard)
@Controller('markups')
export class MarkupsController {
  constructor(private readonly markupsService: MarkupsService) { }

  /** POST /markups — Create a new markup */
  @Post()
  async create(
    @Body() dto: CreateMarkupDto,
    @CurrentUser() admin: JwtPayload,
  ): Promise<Markup> {
    try {
      return await this.markupsService.create(dto, admin.sub);
    } catch (error) {
      throw error;
    }
  }

  /** GET /markups — List all markups */
  @Get()
  async findAll(): Promise<Markup[]> {
    try {
      return await this.markupsService.findAll();
    } catch (error) {
      throw error;
    }
  }

  /** GET /markups/:id — Get a single markup by ID */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Markup> {
    try {
      return await this.markupsService.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /** PATCH /markups/:id — Update an existing markup */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMarkupDto,
    @CurrentUser() admin: JwtPayload,
  ): Promise<Markup> {
    try {
      return await this.markupsService.update(id, dto, admin.sub);
    } catch (error) {
      throw error;
    }
  }

  /** DELETE /markups/:id — Delete a markup */
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<MessageResponse> {
    try {
      return await this.markupsService.remove(id);
    } catch (error) {
      throw error;
    }
  }
}
