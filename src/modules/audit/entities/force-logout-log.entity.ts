import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserAccount } from '../../users/entities/user-account.entity';

/**
 * FRD §3.8 force_logout_logs.
 * Immutable audit record of admin-initiated logout events.
 * DDL fix #8 applied: created_by changed from text to uuid.
 */
@Entity({ name: 'force_logout_logs' })
export class ForceLogoutLog {
  @PrimaryGeneratedColumn('increment', { name: 'force_logout_log_id' })
  forceLogoutLogId!: number;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserAccount)
  @JoinColumn({ name: 'user_id' })
  userAccount!: UserAccount;

  @CreateDateColumn({ name: 'logout_time', type: 'timestamptz' })
  logoutTime!: Date;

  @Column({ name: 'is_force_logout_to_all', type: 'boolean', default: false })
  isForceLogoutToAll!: boolean;

  /** Corrected from text to uuid per DDL fix #8 */
  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string | null;
}
