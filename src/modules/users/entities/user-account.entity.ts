import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType, UserStatus, AuthProvider, Gender, Title } from '../../../shared/enums';
import { Role } from '../../roles/entities/role.entity';
import { Traveler } from '../../travelers/entities/traveler.entity';
import { UserAccountAdditional } from './user-account-additional.entity';

/**
 * Core identity table — FRD §3.1 user_account.
 * Every platform user has exactly one row.
 * DDL corrections applied: city as varchar(100) per schema fix #3.
 */
@Entity({ name: 'user_account' })
export class UserAccount {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  userId!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  password!: string | null;

  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  isEmailVerified!: boolean;

  @Column({ name: 'user_type', type: 'varchar', length: 20, default: UserType.USER })
  userType!: UserType;

  @Column({ type: 'varchar', length: 20, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Column({ name: 'auth_provider', type: 'varchar', length: 20, default: AuthProvider.LOCAL })
  authProvider!: AuthProvider;

  @Column({ name: 'google_id', type: 'varchar', length: 255, nullable: true, unique: true })
  googleId!: string | null;

  @Column({ name: 'first_name', type: 'varchar', length: 50 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 50 })
  lastName!: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender!: Gender | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  title!: Title | null;

  @Column({ type: 'date', nullable: true })
  dob!: Date | null;

  @Column({ name: 'mobile_no', type: 'varchar', length: 20, nullable: true })
  mobileNo!: string | null;

  @Column({ name: 'dial_code', type: 'varchar', length: 5, nullable: true })
  dialCode!: string | null;

  @Column({ name: 'dial_country', type: 'varchar', length: 50, nullable: true })
  dialCountry!: string | null;

  @Column({ name: 'is_mobile_verified', type: 'boolean', default: false })
  isMobileVerified!: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nationality!: string | null;

  @Column({ name: 'preferred_language', type: 'varchar', length: 50, nullable: true })
  preferredLanguage!: string | null;

  @Column({ name: 'preferred_currency', type: 'varchar', length: 50, nullable: true })
  preferredCurrency!: string | null;

  @Column({ name: 'profile_image', type: 'text', nullable: true })
  profileImage!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  state!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  country!: string | null;

  @Column({ name: 'address_1', type: 'text', nullable: true })
  address1!: string | null;

  @Column({ name: 'postal_code', type: 'varchar', length: 10, nullable: true })
  postalCode!: string | null;

  /** Corrected from jsonb to varchar(100) per DDL fix #3 */
  @Column({ type: 'varchar', length: 100, nullable: true })
  city!: string | null;

  @Column({ name: 'company_name', type: 'varchar', length: 255, nullable: true })
  companyName!: string | null;

  @Column({ name: 'business_tax_id', type: 'varchar', length: 30, nullable: true })
  businessTaxId!: string | null;

  @Column({ name: 'rejection_reason', type: 'varchar', length: 500, nullable: true })
  rejectionReason!: string | null;

  @Column({ name: 'action_date', type: 'timestamptz', nullable: true })
  actionDate!: Date | null;

  /** Single role per user — confirmed decision (FRD §FR-US-038) */
  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId!: string | null;

  @ManyToOne(() => Role, { nullable: true, eager: false })
  @JoinColumn({ name: 'role_id' })
  role!: Role | null;

  @OneToMany(() => Traveler, (traveler) => traveler.userAccount)
  travelers!: Traveler[];

  @OneToOne(() => UserAccountAdditional, (additional) => additional.userAccount)
  additional!: UserAccountAdditional | null;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string | null;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string | null;
}
