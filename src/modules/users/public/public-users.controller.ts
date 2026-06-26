import { ApiMandatoryHeaders } from '../../../swagger/decorators/api-mandatory-headers.decorator';
import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { PublicUsersService } from './public-users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../../shared/interfaces/jwt-payload.interface';
import { UserAccount } from '../entities/user-account.entity';
import { MessageResponse } from '../../../shared/interfaces';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Public Users')
@ApiBearerAuth()
@ApiMandatoryHeaders()
@Controller('users')
export class PublicUsersController {
  constructor(private readonly publicUsersService: PublicUsersService) { }

  /** GET /users/me — Retrieve own profile (FR-US-021) */
  @ApiOperation({ summary: 'Get Own Profile', description: 'Retrieve the profile of the currently authenticated user.' })
  @Get('me')
  async getProfile(@CurrentUser() user: JwtPayload): Promise<Partial<UserAccount>> {
    try {
      return await this.publicUsersService.getProfile(user.sub);
    } catch (error) {
      throw error;
    }
  }

  /** PATCH /users/me — Update own profile (FR-US-022) */
  @ApiOperation({ summary: 'Update Own Profile', description: 'Update the profile of the currently authenticated user.' })
  @Patch('me')
  async updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto): Promise<Partial<UserAccount>> {
    try {
      return await this.publicUsersService.updateProfile(user.sub, dto);
    } catch (error) {
      throw error;
    }
  }

  /** POST /users/me/change-password — (FR-US-025) */
  @ApiOperation({ summary: 'Change Password', description: 'Change the password of the currently authenticated user.' })
  @Post('me/change-password')
  async changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto): Promise<MessageResponse> {
    try {
      return await this.publicUsersService.changePassword(user.sub, dto);
    } catch (error) {
      throw error;
    }
  }
}
