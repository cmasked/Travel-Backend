import { ApiMandatoryHeaders } from '../../../swagger/decorators/api-mandatory-headers.decorator';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PublicAuthService } from './public-auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../../../shared/decorators/public.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../../shared/interfaces/jwt-payload.interface';
import { ClientHeaders, ClientHeadersData } from '../../../shared/decorators/client-headers.decorator';
import { RegisterResponse, AuthResponse, MessageResponse, TokenRefreshResponse, SessionValidationResponse } from '../../../shared/interfaces';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Public (customer-facing) authentication endpoints.
 * All routes prefixed /auth.
 */
@ApiTags('Public Auth')
@ApiMandatoryHeaders()
@Controller('auth')
export class PublicAuthController {
  constructor(private readonly publicAuthService: PublicAuthService) {}

  /** POST /auth/register — Public, 10/min per IP (FR-US-001) */
  @ApiOperation({ summary: 'Register User', description: 'Create a new customer account.' })
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<RegisterResponse> {
    try {
      return await this.publicAuthService.register(dto);
    } catch (error) {
      throw error;
    }
  }

  /** POST /auth/login — Public, 10/min per IP (FR-US-013) */
  @ApiOperation({ summary: 'Login', description: 'Authenticate a customer and receive tokens.' })
  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @ClientHeaders() headers: ClientHeadersData,
  ): Promise<AuthResponse> {
    try {
      return await this.publicAuthService.login(dto, headers.ip, headers.device);
    } catch (error) {
      throw error;
    }
  }

  /** POST /auth/logout — JWT Required (FR-US-017) */
  @ApiOperation({ summary: 'Logout', description: 'Invalidates the current session token.' })
  @ApiBearerAuth()
  @Post('logout')
  async logout(@CurrentUser() user: JwtPayload): Promise<MessageResponse> {
    try {
      return await this.publicAuthService.logout(user.sessionId, user.sub);
    } catch (error) {
      throw error;
    }
  }

  /** POST /auth/refresh — Refresh Token (FR-US-016) */
  @ApiOperation({ summary: 'Refresh Token', description: 'Get a new access token using a refresh token.' })
  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenRefreshResponse> {
    try {
      return await this.publicAuthService.refresh(dto.refreshToken);
    } catch (error) {
      throw error;
    }
  }

  /** POST /auth/verify-email — Public (FR-US-009) */
  @ApiOperation({ summary: 'Verify Email', description: 'Verify an email address using an OTP.' })
  @Public()
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyOtpDto): Promise<MessageResponse> {
    try {
      return await this.publicAuthService.verifyEmail(dto);
    } catch (error) {
      throw error;
    }
  }

  /** POST /auth/resend-otp — Public, 5/min (FR-US-011) */
  @ApiOperation({ summary: 'Resend OTP', description: 'Resend the email verification OTP.' })
  @Public()
  @Post('resend-otp')
  async resendOtp(@Body() dto: ResendOtpDto): Promise<MessageResponse> {
    try {
      return await this.publicAuthService.resendOtp(dto);
    } catch (error) {
      throw error;
    }
  }

  /** POST /auth/forgot-password — Public, 5/min per IP (FR-US-026) */
  @ApiOperation({ summary: 'Forgot Password', description: 'Send a password reset OTP.' })
  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<MessageResponse> {
    try {
      return await this.publicAuthService.forgotPassword(dto);
    } catch (error) {
      throw error;
    }
  }

  /** POST /auth/reset-password — OTP Token (FR-US-026) */
  @ApiOperation({ summary: 'Reset Password', description: 'Reset password using an OTP.' })
  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<MessageResponse> {
    try {
      return await this.publicAuthService.resetPassword(dto);
    } catch (error) {
      throw error;
    }
  }

  /** GET /auth/validate — Internal, no limit (FR-US-019). Must be < 20ms p95. */
  @ApiOperation({ summary: 'Validate Session', description: 'Internal API to validate a session ID.' })
  @Public()
  @Get('validate')
  async validate(@Query('sessionId') sessionId: string): Promise<SessionValidationResponse> {
    try {
      return await this.publicAuthService.validate(sessionId);
    } catch (error) {
      throw error;
    }
  }
}
