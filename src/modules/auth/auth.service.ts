import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserAccount } from '../users/entities/user-account.entity';
import { Traveler } from '../travelers/entities/traveler.entity';
import { LoginLog } from '../audit/entities/login-log.entity';
import { UserAccountAdditional } from '../users/entities/user-account-additional.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { ErrorCodes } from '../../shared/constants/error-codes';
import { UserStatus, UserType, AuthProvider, AccessTokenType, TravelerTitle } from '../../shared/enums';
import { RedisService } from '../redis/redis.service';
import { generateOtp, hashOtp, verifyOtp, isOtpExpired, OTP_MAX_VERIFY_ATTEMPTS, OTP_MAX_RESEND_ATTEMPTS, OTP_RESEND_WINDOW_MINUTES, ACCOUNT_LOCK_DURATION_MINUTES } from '../../shared/utils/otp.util';
import { maskEmail } from '../../shared/utils/pii-masker.util';
import { AuthRepository } from './auth.repository';
import { EncryptionService } from '../../shared/services/encryption.service';

const BCRYPT_ROUNDS = 12;
const FAILED_LOGIN_MAX = 10;
const FAILED_LOGIN_TTL_SECONDS = 15 * 60;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * FR-US-001, 002, 003, 005, 006 — Register with email/password.
   */
  async register(dto: RegisterDto): Promise<{ userId: string; message: string }> {
    try {
      const email = dto.email.toLowerCase();
      const existing = await this.authRepository.findUserByEmail(email);
      if (existing) {
        throw new ConflictException({ message: 'Email already exists', code: ErrorCodes.EMAIL_ALREADY_EXISTS });
      }

      const lowerPass = dto.password.toLowerCase();
      if (lowerPass.includes(email.split('@')[0]) || lowerPass.includes(dto.firstName.toLowerCase()) || lowerPass.includes(dto.lastName.toLowerCase())) {
        throw new UnprocessableEntityException({ message: 'Password must not contain your email or name', code: ErrorCodes.PASSWORD_CONTAINS_PII });
      }

      const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
      const savedUser = await this.authRepository.saveUser(this.authRepository.createUser({
        email,
        password: passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        userType: UserType.USER,
        status: UserStatus.ACTIVE,
        authProvider: AuthProvider.LOCAL,
        isEmailVerified: false,
      }));

      await this.authRepository.saveTraveler(this.authRepository.createTraveler({
        userId: savedUser.userId,
        title: TravelerTitle.MR,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dob: new Date('2000-01-01'),
        primaryTraveler: true,
      }));

      await this.authRepository.saveAdditional(this.authRepository.createAdditional({
        userId: savedUser.userId,
        featureFlags: {},
      }));

      const otp = generateOtp();
      const otpHash = await hashOtp(otp);
      await this.authRepository.saveLoginLog(this.authRepository.createLoginLog({
        userId: savedUser.userId,
        otp: otpHash,
        otpTime: new Date(),
        otpAttempts: 1,
        isTokenExpired: true,
        accessTokenType: AccessTokenType.LOGIN,
      }));

      await this.redisService.publish('user.verification_otp_requested', {
        user_id: savedUser.userId,
        channel: 'email',
        correlation_id: crypto.randomUUID(),
      });

      this.logger.log(`[DEV] OTP for ${maskEmail(email)}: ${otp}`);

      await this.redisService.publish('user.registered', {
        user_id: savedUser.userId,
        user_type: UserType.USER,
        correlation_id: crypto.randomUUID(),
      });

      return { userId: savedUser.userId, message: 'Registration successful. Please verify your email with the OTP sent.' };
    } catch (error) {
      this.handleError(error, 'register');
    }
  }

  /**
   * FR-US-009, 010 — Verify email OTP.
   */
  async verifyEmail(dto: VerifyOtpDto): Promise<{ message: string }> {
    try {
      const email = dto.email.toLowerCase();
      const user = await this.authRepository.findUserByEmail(email);
      if (!user) throw new NotFoundException({ message: 'User not found', code: ErrorCodes.USER_NOT_FOUND });

      const loginLog = await this.authRepository.findLatestLoginLog(user.userId);
      if (!loginLog || !loginLog.otp || !loginLog.otpTime) {
        throw new UnprocessableEntityException({ message: 'No OTP found. Request a new one.', code: ErrorCodes.OTP_EXPIRED });
      }

      if (loginLog.otpVerifyAttempts >= OTP_MAX_VERIFY_ATTEMPTS) {
        throw new UnprocessableEntityException({ message: 'OTP invalidated after too many attempts. Request a new one.', code: ErrorCodes.OTP_MAX_ATTEMPTS });
      }

      if (isOtpExpired(loginLog.otpTime)) {
        throw new UnprocessableEntityException({ message: 'OTP has expired. Request a new one.', code: ErrorCodes.OTP_EXPIRED });
      }

      const isValid = await verifyOtp(dto.otp, loginLog.otp);
      if (!isValid) {
        loginLog.otpVerifyAttempts += 1;
        await this.authRepository.saveLoginLog(loginLog);
        throw new UnprocessableEntityException({ message: 'Invalid OTP', code: ErrorCodes.OTP_INVALID });
      }

      user.isEmailVerified = true;
      await this.authRepository.saveUser(user);

      loginLog.isOtpVerified = true;
      loginLog.otp = null;
      loginLog.otpTime = null;
      await this.authRepository.saveLoginLog(loginLog);

      await this.redisService.publish('user.email_verified', {
        user_id: user.userId,
        correlation_id: crypto.randomUUID(),
      });

      return { message: 'Email verified successfully' };
    } catch (error) {
      this.handleError(error, 'verifyEmail');
    }
  }

  /**
   * FR-US-011 — Resend OTP with rate limiting.
   */
  async resendOtp(dto: ResendOtpDto): Promise<{ message: string }> {
    try {
      const email = dto.email.toLowerCase();
      const user = await this.authRepository.findUserByEmail(email);
      if (!user) throw new NotFoundException({ message: 'User not found', code: ErrorCodes.USER_NOT_FOUND });

      const loginLog = await this.authRepository.findLatestLoginLog(user.userId);

      if (loginLog && loginLog.otpTime) {
        const windowMs = OTP_RESEND_WINDOW_MINUTES * 60 * 1000;
        const inWindow = Date.now() - loginLog.otpTime.getTime() < windowMs;

        if (inWindow && loginLog.otpAttempts >= OTP_MAX_RESEND_ATTEMPTS) {
          user.status = UserStatus.INACTIVE;
          await this.authRepository.saveUser(user);
          throw new UnprocessableEntityException({
            message: `Account temporarily locked for ${ACCOUNT_LOCK_DURATION_MINUTES} minutes due to excessive OTP requests`,
            code: ErrorCodes.OTP_RESEND_LIMIT,
          });
        }
      }

      const otp = generateOtp();
      const otpHash = await hashOtp(otp);

      if (loginLog) {
        loginLog.otp = otpHash;
        loginLog.otpTime = new Date();
        loginLog.otpAttempts += 1;
        loginLog.otpVerifyAttempts = 0;
        loginLog.isOtpVerified = false;
        await this.authRepository.saveLoginLog(loginLog);
      } else {
        await this.authRepository.saveLoginLog(this.authRepository.createLoginLog({
          userId: user.userId,
          otp: otpHash,
          otpTime: new Date(),
          otpAttempts: 1,
          isTokenExpired: true,
          accessTokenType: AccessTokenType.LOGIN,
        }));
      }

      await this.redisService.publish('user.verification_otp_requested', {
        user_id: user.userId,
        channel: 'email',
        correlation_id: crypto.randomUUID(),
      });

      this.logger.log(`[DEV] Resend OTP for ${maskEmail(email)}: ${otp}`);

      return { message: 'OTP resent successfully' };
    } catch (error) {
      this.handleError(error, 'resendOtp');
    }
  }

  /**
   * FR-US-013, 014, 015, 040 — Login with email/password.
   */
  async login(dto: LoginDto, ip?: string, userAgent?: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Record<string, unknown>;
  }> {
    try {
      const email = dto.email.toLowerCase();
      const failKey = `failed_logins:${email}`;
      const failCount = parseInt((await this.redisService.get(failKey)) ?? '0', 10);
      if (failCount >= FAILED_LOGIN_MAX) {
        throw new ForbiddenException({
          message: 'Account locked due to too many failed login attempts. Try again in 15 minutes.',
          code: ErrorCodes.ACCOUNT_LOCKED,
        });
      }

      const user = await this.authRepository.findUserByEmail(email);
      if (!user || !user.password) {
        await this.redisService.incr(failKey);
        await this.redisService.expire(failKey, FAILED_LOGIN_TTL_SECONDS);
        throw new UnauthorizedException({ message: 'Invalid credentials', code: ErrorCodes.INVALID_CREDENTIALS });
      }

      const passwordValid = await bcrypt.compare(dto.password, user.password);
      if (!passwordValid) {
        await this.redisService.incr(failKey);
        await this.redisService.expire(failKey, FAILED_LOGIN_TTL_SECONDS);
        throw new UnauthorizedException({ message: 'Invalid credentials', code: ErrorCodes.INVALID_CREDENTIALS });
      }

      if (!user.isEmailVerified) {
        throw new ForbiddenException({ message: 'Email not verified', code: ErrorCodes.EMAIL_NOT_VERIFIED });
      }

      if (user.status !== UserStatus.ACTIVE) {
        const codeMap: Record<string, string> = {
          [UserStatus.INACTIVE]: ErrorCodes.ACCOUNT_INACTIVE,
          [UserStatus.SUSPENDED]: ErrorCodes.ACCOUNT_SUSPENDED,
          [UserStatus.PENDING_APPROVAL]: ErrorCodes.ACCOUNT_PENDING,
        };
        throw new ForbiddenException({
          message: `Account is ${user.status}`,
          code: codeMap[user.status] ?? ErrorCodes.ACCOUNT_INACTIVE,
        });
      }

      await this.redisService.del(failKey);

      const refreshTokenRaw = crypto.randomBytes(64).toString('hex');
      const loginLog = await this.authRepository.saveLoginLog(this.authRepository.createLoginLog({
        userId: user.userId,
        ip: ip ?? null,
        deviceInformation: userAgent ? userAgent.substring(0, 500) : null,
        accessTokenType: AccessTokenType.LOGIN,
        refreshToken: this.encryptionService.encrypt(refreshTokenRaw),
        isTokenExpired: false,
      }));

      const payload: JwtPayload = {
        sub: user.userId,
        type: user.userType,
        roleId: user.roleId,
        sessionId: loginLog.loginLogId,
      };
      const accessToken = this.jwtService.sign(payload);

      loginLog.accessToken = this.encryptionService.encrypt(accessToken);
      await this.authRepository.saveLoginLog(loginLog);

      await this.redisService.publish('user.login', {
        user_id: user.userId,
        device_type: loginLog.loginDevice,
        correlation_id: crypto.randomUUID(),
      });

      return {
        accessToken,
        refreshToken: refreshTokenRaw,
        user: {
          userId: user.userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          isEmailVerified: user.isEmailVerified,
        },
      };
    } catch (error) {
      this.handleError(error, 'login');
    }
  }

  /**
   * FR-US-017 — Logout.
   */
  async logout(sessionId: string, userId: string): Promise<{ message: string }> {
    try {
      const loginLog = await this.authRepository.findSessionByIdAndUser(sessionId, userId);
      if (loginLog) {
        loginLog.isTokenExpired = true;
        await this.authRepository.saveLoginLog(loginLog);
      }

      await this.redisService.publish('user.logout', {
        user_id: userId,
        login_log_id: sessionId,
        correlation_id: crypto.randomUUID(),
      });

      return { message: 'Logged out successfully' };
    } catch (error) {
      this.handleError(error, 'logout');
    }
  }

  /**
   * FR-US-016 — Token refresh with rotation.
   */
  async refresh(dto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const logs = await this.authRepository.findActiveRefreshLogs();
      let matchedLog: LoginLog | null = null;

      for (const log of logs) {
        if (log.refreshToken) {
          try {
            const stored = this.encryptionService.decrypt(log.refreshToken);
            if (stored === dto.refreshToken) {
              matchedLog = log;
              break;
            }
          } catch {
            continue;
          }
        }
      }

      if (!matchedLog) {
        throw new UnauthorizedException({ message: 'Invalid refresh token', code: ErrorCodes.INVALID_REFRESH_TOKEN });
      }

      const user = await this.authRepository.findUserById(matchedLog.userId);
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new ForbiddenException({ message: 'Account not active', code: ErrorCodes.ACCOUNT_INACTIVE });
      }

      const newRefreshToken = crypto.randomBytes(64).toString('hex');
      const payload: JwtPayload = {
        sub: user.userId,
        type: user.userType,
        roleId: user.roleId,
        sessionId: matchedLog.loginLogId,
      };
      const newAccessToken = this.jwtService.sign(payload);

      matchedLog.accessToken = this.encryptionService.encrypt(newAccessToken);
      matchedLog.refreshToken = this.encryptionService.encrypt(newRefreshToken);
      matchedLog.accessTokenType = AccessTokenType.REFRESH;
      matchedLog.lastTokenRefreshedAt = new Date();
      await this.authRepository.saveLoginLog(matchedLog);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      this.handleError(error, 'refresh');
    }
  }

  /**
   * FR-US-019 — Validate session. Must complete < 20ms p95.
   */
  async validate(sessionId: string): Promise<{ valid: boolean }> {
    try {
      const log = await this.authRepository.findSessionValidationRow(sessionId);
      return { valid: !!log && !log.isTokenExpired };
    } catch (error) {
      this.handleError(error, 'validate');
    }
  }

  /**
   * FR-US-026 — Forgot password: generate reset OTP.
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    try {
      const email = dto.email.toLowerCase();
      const user = await this.authRepository.findUserByEmail(email);

      if (!user) return { message: 'If this email exists, a reset OTP has been sent.' };

      const otp = generateOtp();
      const otpHash = await hashOtp(otp);

      await this.authRepository.saveLoginLog(this.authRepository.createLoginLog({
        userId: user.userId,
        otp: otpHash,
        otpTime: new Date(),
        otpAttempts: 1,
        isTokenExpired: true,
        accessTokenType: AccessTokenType.LOGIN,
      }));

      await this.redisService.publish('user.password_reset_requested', {
        user_id: user.userId,
        correlation_id: crypto.randomUUID(),
      });

      this.logger.log(`[DEV] Password reset OTP for ${maskEmail(email)}: ${otp}`);

      return { message: 'If this email exists, a reset OTP has been sent.' };
    } catch (error) {
      this.handleError(error, 'forgotPassword');
    }
  }

  /**
   * FR-US-026 — Reset password with OTP.
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    try {
      const email = dto.email.toLowerCase();
      const user = await this.authRepository.findUserByEmail(email);
      if (!user) throw new NotFoundException({ message: 'User not found', code: ErrorCodes.USER_NOT_FOUND });

      const loginLog = await this.authRepository.findLatestResetLog(user.userId);
      if (!loginLog || !loginLog.otp || !loginLog.otpTime) {
        throw new UnprocessableEntityException({ message: 'No reset OTP found', code: ErrorCodes.OTP_EXPIRED });
      }

      if (loginLog.otpVerifyAttempts >= OTP_MAX_VERIFY_ATTEMPTS) {
        throw new UnprocessableEntityException({ message: 'OTP invalidated', code: ErrorCodes.OTP_MAX_ATTEMPTS });
      }

      if (isOtpExpired(loginLog.otpTime)) {
        throw new UnprocessableEntityException({ message: 'OTP expired', code: ErrorCodes.OTP_EXPIRED });
      }

      const isValid = await verifyOtp(dto.otp, loginLog.otp);
      if (!isValid) {
        loginLog.otpVerifyAttempts += 1;
        await this.authRepository.saveLoginLog(loginLog);
        throw new UnprocessableEntityException({ message: 'Invalid OTP', code: ErrorCodes.OTP_INVALID });
      }

      if (user.password) {
        const sameAsOld = await bcrypt.compare(dto.newPassword, user.password);
        if (sameAsOld) {
          throw new UnprocessableEntityException({ message: 'New password must differ from previous', code: ErrorCodes.PASSWORD_SAME_AS_OLD });
        }
      }

      user.password = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
      await this.authRepository.saveUser(user);

      loginLog.otp = null;
      loginLog.otpTime = null;
      loginLog.isOtpVerified = true;
      await this.authRepository.saveLoginLog(loginLog);

      await this.authRepository.expireUserSessions(user.userId);

      await this.redisService.publish('user.password_changed', {
        user_id: user.userId,
        correlation_id: crypto.randomUUID(),
      });

      return { message: 'Password reset successfully. All sessions have been invalidated.' };
    } catch (error) {
      this.handleError(error, 'resetPassword');
    }
  }

  private handleError(error: unknown, method: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    this.logger.error(`AuthService.${method} failed`, error instanceof Error ? error.stack : undefined);
    throw new InternalServerErrorException('Unexpected auth service error');
  }
}
