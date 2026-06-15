import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ModuleType } from '../../../shared/enums';
import { AdminSubModule } from './admin-sub-module.entity';

/**
 * FRD §3.5 admin_modules.
 * Top-level feature areas (e.g. Hotels, Bookings, Users, Reports).
 * Integer PK is acceptable — platform-defined, not user-generated.
 */
@Entity({ name: 'admin_modules' })
export class AdminModule {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @Column({ name: 'module_type', type: 'varchar', length: 10, default: ModuleType.ADMIN })
  moduleType!: ModuleType;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => AdminSubModule, (sub) => sub.module)
  subModules!: AdminSubModule[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
