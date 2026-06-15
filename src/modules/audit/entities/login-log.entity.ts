import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserAccount } from '../../users/entities/user-account.entity';
import { AccessTokenType, LoginDevice } from '../../../shared/enums';

/**
 * FRD §3.7 login_logs.
 * Primary session and audit table. Every login attempt, OTP event,
 * token refresh creates or updates a row.
 *
 * DDL fixes applied:
 * - #5: account_id removed (redundant with user_id FK)
 * - #6: accessTokenType renamed to access_token_type
 * - #7: impersonation_by changed from jsonb to uuid
 *
 * Security: access_token and refresh_token encrypted at rest.
 * Tokens must never appear in application logs.
 */
@Entity({ name: 'login_logs' })
export class LoginLog {
  @PrimaryGeneratedColumn('uuid', { name: 'login_log_id' })
  loginLogId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserAccount)
  @JoinColumn({ name: 'user_id' })
  userAccount!: UserAccount;

  @CreateDateColumn({ name: 'login_time', type: 'timestamptz' })
  loginTime!: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip!: string | null;

  @Column({ name: 'login_device', type: 'varchar', length: 10, nullable: true })
  loginDevice!: LoginDevice | null;

  @Column({ name: 'device_information', type: 'text', nullable: true })
  deviceInformation!: string | null;

  @Column({ name: 'is_token_expired', type: 'boolean', default: false })
  isTokenExpired!: boolean;

  /** OTP hash — bcrypt, never stored in plain text (FRD §6.3) */
  @Column({ type: 'varchar', length: 100, nullable: true })
  otp!: string | null;

  @Column({ name: 'is_otp_verified', type: 'boolean', default: false })
  isOtpVerified!: boolean;

  @Column({ name: 'otp_time', type: 'timestamptz', nullable: true })
  otpTime!: Date | null;

  @Column({ name: 'otp_attempts', type: 'int', default: 0 })
  otpAttempts!: number;

  @Column({ name: 'otp_verify_attempts', type: 'int', default: 0 })
  otpVerifyAttempts!: number;

  /** Encrypted at rest with AES-256-GCM (FRD §6.4) */
  @Column({ name: 'access_token', type: 'text', nullable: true })
  accessToken!: string | null;

  /** Encrypted at rest with AES-256-GCM (FRD §6.4) */
  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken!: string | null;

  /** Renamed from camelCase per DDL fix #6 */
  @Column({ name: 'access_token_type', type: 'varchar', length: 20, default: AccessTokenType.LOGIN })
  accessTokenType!: AccessTokenType;

  @Column({ type: 'boolean', default: false })
  impersonation!: boolean;

  /** Corrected from jsonb to uuid per DDL fix #7 */
  @Column({ name: 'impersonation_by', type: 'uuid', nullable: true })
  impersonationBy!: string | null;

  @Column({ name: 'last_token_refreshed_at', type: 'timestamptz', nullable: true })
  lastTokenRefreshedAt!: Date | null;
}
