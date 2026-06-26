import { ApiMandatoryHeaders } from '../../swagger/decorators/api-mandatory-headers.decorator';
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { TravelersService } from './travelers.service';
import { CreateTravelerDto } from './dto/create-traveler.dto';
import { UpdateTravelerDto } from './dto/update-traveler.dto';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { Traveler } from './entities/traveler.entity';
import { MessageResponse } from '../../shared/interfaces';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Traveler endpoints — FRD §5.3.
 * All routes under /users/me/travelers. JWT required.
 */
@ApiTags('Travelers')
@ApiBearerAuth()
@ApiMandatoryHeaders()
@Controller('users/me/travelers')
export class TravelersController {
  constructor(private readonly travelersService: TravelersService) {}

  /** GET /users/me/travelers — List all saved travelers (FR-US-028) */
  @ApiOperation({ summary: 'List Travelers', description: 'Retrieve all saved travelers for the current user.' })
  @Get()
  async findAll(@CurrentUser() user: JwtPayload): Promise<Partial<Traveler>[]> {
    try {
      return await this.travelersService.findAll(user.sub);
    } catch (error) {
      throw error;
    }
  }

  /** POST /users/me/travelers — Add new traveler, max 10 (FR-US-029) */
  @ApiOperation({ summary: 'Create Traveler', description: 'Add a new traveler profile (max 10).' })
  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTravelerDto): Promise<Partial<Traveler>> {
    try {
      return await this.travelersService.create(user.sub, dto);
    } catch (error) {
      throw error;
    }
  }

  /** GET /users/me/travelers/:id — Detail with decrypted doc (FR-US-032) */
  @ApiOperation({ summary: 'Get Traveler', description: 'Retrieve detail for a specific traveler, including decrypted documents.' })
  @Get(':id')
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<Partial<Traveler>> {
    try {
      return await this.travelersService.findOne(user.sub, id);
    } catch (error) {
      throw error;
    }
  }

  /** PUT /users/me/travelers/:id — Full update (FR-US-030) */
  @ApiOperation({ summary: 'Update Traveler', description: 'Update a specific traveler profile.' })
  @Put(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTravelerDto,
  ): Promise<Partial<Traveler>> {
    try {
      return await this.travelersService.update(user.sub, id, dto);
    } catch (error) {
      throw error;
    }
  }

  /** DELETE /users/me/travelers/:id — Soft delete (FR-US-031) */
  @ApiOperation({ summary: 'Delete Traveler', description: 'Soft delete a traveler profile.' })
  @Delete(':id')
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<MessageResponse> {
    try {
      return await this.travelersService.remove(user.sub, id);
    } catch (error) {
      throw error;
    }
  }
}
