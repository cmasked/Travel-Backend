import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserAccount } from '../../users/entities/user-account.entity';
import { TravelerTitle, Gender, DocumentType } from '../../../shared/enums';

/**
 * FRD §3.3 traveler.
 * Saved traveler profiles owned by a user. Max 10 per user.
 * primary_traveler = true for the auto-created profile copy.
 * DDL fix #10 applied: nationality as varchar(3) instead of jsonb.
 */
@Entity({ name: 'traveler' })
export class Traveler {
  @PrimaryGeneratedColumn('uuid', { name: 'traveler_id' })
  travelerId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserAccount, (user) => user.travelers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  userAccount!: UserAccount;

  @Column({ type: 'varchar', length: 10 })
  title!: TravelerTitle;

  @Column({ name: 'first_name', type: 'varchar', length: 50 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 50 })
  lastName!: string;

  @Column({ type: 'date' })
  dob!: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender!: Gender | null;

  @Column({ name: 'mobile_no', type: 'varchar', length: 20, nullable: true })
  mobileNo!: string | null;

  @Column({ name: 'dial_code', type: 'varchar', length: 5, nullable: true })
  dialCode!: string | null;

  @Column({ name: 'document_type', type: 'varchar', length: 20, nullable: true })
  documentType!: DocumentType | null;

  /** Encrypted with AES-256-GCM per FRD §FR-US-032 */
  @Column({ name: 'document_number', type: 'varchar', length: 255, nullable: true })
  documentNumber!: string | null;

  @Column({ name: 'document_expiry_date', type: 'date', nullable: true })
  documentExpiryDate!: Date | null;

  @Column({ name: 'document_photo', type: 'text', nullable: true })
  documentPhoto!: string | null;

  @Column({ name: 'primary_traveler', type: 'boolean', default: false })
  primaryTraveler!: boolean;

  /** Corrected from jsonb to varchar(3) per DDL fix #10 */
  @Column({ type: 'varchar', length: 3, nullable: true })
  nationality!: string | null;

  @Column({ name: 'food_preference', type: 'jsonb', nullable: true })
  foodPreference!: Record<string, unknown> | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
