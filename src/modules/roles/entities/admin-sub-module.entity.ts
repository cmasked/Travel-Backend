import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminModule } from './admin-module.entity';

/**
 * FRD §3.5 admin_sub_modules.
 * Granular sections within a module.
 */
@Entity({ name: 'admin_sub_modules' })
export class AdminSubModule {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'module_id', type: 'int' })
  moduleId!: number;

  @ManyToOne(() => AdminModule, (m) => m.subModules)
  @JoinColumn({ name: 'module_id' })
  module!: AdminModule;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
