import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { TravelersService } from './travelers.service';
import { CreateTravelerDto } from './dto/create-traveler.dto';
import { UpdateTravelerDto } from './dto/update-traveler.dto';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';

/**
 * Traveler endpoints — FRD §5.3.
 * All routes under /users/me/travelers. JWT required.
 */
@Controller('users/me/travelers')
export class TravelersController {
  constructor(private readonly travelersService: TravelersService) {}

  /** GET /users/me/travelers — List all saved travelers (FR-US-028) */
  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.travelersService.findAll(user.sub);
  }

  /** POST /users/me/travelers — Add new traveler, max 10 (FR-US-029) */
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTravelerDto) {
    return this.travelersService.create(user.sub, dto);
  }

  /** GET /users/me/travelers/:id — Detail with decrypted doc (FR-US-032) */
  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.travelersService.findOne(user.sub, id);
  }

  /** PUT /users/me/travelers/:id — Full update (FR-US-030) */
  @Put(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTravelerDto,
  ) {
    return this.travelersService.update(user.sub, id, dto);
  }

  /** DELETE /users/me/travelers/:id — Soft delete (FR-US-031) */
  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.travelersService.remove(user.sub, id);
  }
}
