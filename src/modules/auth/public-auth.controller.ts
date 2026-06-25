import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PublicAuthService } from './public-auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../../shared/decorators/public.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { ClientHeaders, ClientHeadersData } from '../../shared/decorators/client-headers.decorator';

/**
 * Public (customer-facing) authentication endpoints.
 * All routes prefixed /auth.
 */
@Controller('auth')
export class PublicAuthController {
  constructor(private readonly publicAuthService: PublicAuthService) {}

  /** POST /auth/register — Public, 10/min per IP (FR-US-001) */
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      return await this.publicAuthService.register(dto);
    } catch (error) {
      throw error;
    }
  }

  /** POST /auth/login — Public, 10/min per IP (FR-US-013) */
  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @ClientHeaders() headers: ClientHeadersData,
  ) {
    try {
      return await this.publicAuthService.login(dto, headers.ip, headers.device);
    } catch (error) {
      throw error;
    }
  }

  /** POST /auth/logout — JWT Required (FR-US-017) */
  @Post('logout')
  async logout(@CurrentUser() user: JwtPayload) {
    try {
      return await this.publicAuthService.logout(user.sessionId, user.sub);
    } catch (error) {
      throw error;
    }
  }

  /** POST /auth/refresh — Refresh Token (FR-US-016) */
  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    try {
      return await this.publicAuthService.refresh(dto.refreshToken);
    } catch (error) {
      throw error;
    }
  }

  /** POST /auth/verify-email — Public (FR-US-009) */
  @Public()
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyOtpDto) {
    try {
      return await this.publicAuthService.verifyEmail(dto);
    } catch (error) {
      throw error;
    }
  }

  /** POST /auth/resend-otp — Public, 5/min (FR-US-011) */
  @Public()
  @Post('resend-otp')
  async resendOtp(@Body() dto: ResendOtpDto) {
    try {
      return await this.publicAuthService.resendOtp(dto);
    } catch (error) {
      throw error;
    }
  }

  /** POST /auth/forgot-password — Public, 5/min per IP (FR-US-026) */
  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    try {
      return await this.publicAuthService.forgotPassword(dto);
    } catch (error) {
      throw error;
    }
  }

  /** POST /auth/reset-password — OTP Token (FR-US-026) */
  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    try {
      return await this.publicAuthService.resetPassword(dto);
    } catch (error) {
      throw error;
    }
  }

  /** GET /auth/validate — Internal, no limit (FR-US-019). Must be < 20ms p95. */
  @Public()
  @Get('validate')
  async validate(@Query('sessionId') sessionId: string) {
    try {
      return await this.publicAuthService.validate(sessionId);
    } catch (error) {
      throw error;
    }
  }
}
