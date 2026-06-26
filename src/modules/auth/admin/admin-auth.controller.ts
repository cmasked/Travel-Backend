import { ApiMandatoryHeaders } from '../../../swagger/decorators/api-mandatory-headers.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../../../shared/decorators/public.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../../shared/interfaces/jwt-payload.interface';
import { ClientHeaders, ClientHeadersData } from '../../../shared/decorators/client-headers.decorator';
import { AdminAuthResponse, TokenRefreshResponse, MessageResponse } from '../../../shared/interfaces';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Admin authentication endpoints.
 * All routes prefixed /auth/admin.
 * No registration here — admins are created via POST /users/sub-admin.
 * blaise matuti
 */
@ApiTags('Admin Auth')
@ApiMandatoryHeaders()
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) { }

  /** POST /auth/admin/login — Public (admin login with roleId check) */
  @ApiOperation({ summary: 'Admin Login', description: 'Authenticate an admin user and receive tokens.' })
  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @ClientHeaders() headers: ClientHeadersData,
  ): Promise<AdminAuthResponse> {
    try {
      return await this.adminAuthService.login(dto, headers.ip, headers.device);
    } catch (error) {
      throw error;
    }
  }

  /** POST /auth/admin/logout — JWT Required */
  @ApiOperation({ summary: 'Admin Logout', description: 'Invalidates the current session token.' })
  @ApiBearerAuth()
  @Post('logout')
  async logout(@CurrentUser() user: JwtPayload): Promise<MessageResponse> {
    try {
      return await this.adminAuthService.logout(user.sessionId, user.sub);
    } catch (error) {
      throw error;
    }
  }

  /** POST /auth/admin/refresh — Refresh admin token */
  @ApiOperation({ summary: 'Refresh Token', description: 'Get a new access token using a refresh token.' })
  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenRefreshResponse> {
    try {
      return await this.adminAuthService.refresh(dto.refreshToken);
    } catch (error) {
      throw error;
    }
  }
}
