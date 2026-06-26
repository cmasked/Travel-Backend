import { ApiMandatoryHeaders } from '../../swagger/decorators/api-mandatory-headers.decorator';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { MarkupsService } from './markups.service';
import { CreateMarkupDto } from './dto/create-markup.dto';
import { UpdateMarkupDto } from './dto/update-markup.dto';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { Markup } from './entities/markup.entity';
import { MessageResponse } from '../../shared/interfaces';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

/**
 * Markup endpoints — Admin only.
 * All routes prefixed /markups.
 */
@ApiTags('Markups')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@ApiMandatoryHeaders()
@Controller('markups')
export class MarkupsController {
  constructor(private readonly markupsService: MarkupsService) { }

  /** POST /markups — Create a new markup */
  @ApiOperation({ summary: 'Create Markup', description: 'Create a new pricing markup rule.' })
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
  @ApiOperation({ summary: 'List Markups', description: 'Retrieve all markup rules.' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Search by markup name' })
  @Get()
  async findAll(@Query('name') name?: string): Promise<Markup[]> {
    try {
      return await this.markupsService.findAll(name);
    } catch (error) {
      throw error;
    }
  }

  /** GET /markups/:id — Get a single markup by ID */
  @ApiOperation({ summary: 'Get Markup', description: 'Retrieve detail for a specific markup rule.' })
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Markup> {
    try {
      return await this.markupsService.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /** PATCH /markups/:id — Update an existing markup */
  @ApiOperation({ summary: 'Update Markup', description: 'Update an existing markup rule.' })
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
  @ApiOperation({ summary: 'Delete Markup', description: 'Delete a markup rule.' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<MessageResponse> {
    try {
      return await this.markupsService.remove(id);
    } catch (error) {
      throw error;
    }
  }
}
