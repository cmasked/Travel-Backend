import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserAccount } from './user-account.entity';

/**
 * FRD §3.2 user_account_additional.
 * 1:1 extension of user_account. Stores agent markup overrides
 * and per-user feature flags. DDL fix #9 applied: created_at + created_by added.
 */
@Entity({ name: 'user_account_additional' })
export class UserAccountAdditional {
  @PrimaryGeneratedColumn('uuid', { name: 'user_add_id' })
  userAddId!: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  @OneToOne(() => UserAccount, (user) => user.additional)
  @JoinColumn({ name: 'user_id' })
  userAccount!: UserAccount;

  @Column({ type: 'jsonb', nullable: true })
  markup!: Record<string, unknown> | null;

  @Column({ name: 'feature_flags', type: 'jsonb', default: '{}' })
  featureFlags!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string | null;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string | null;
}
