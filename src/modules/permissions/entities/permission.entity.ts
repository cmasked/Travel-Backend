import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { AdminModule } from '../../roles/entities/admin-module.entity';
import { AdminSubModule } from '../../roles/entities/admin-sub-module.entity';

/**
 * FRD §3.6 permissions.
 * Junction table: role → module/sub-module with CRUD flags.
 * Answers: 'Can role X perform operation Y on module Z?'
 */
@Entity({ name: 'permissions' })
export class Permission {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId!: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @Column({ name: 'module_id', type: 'int' })
  moduleId!: number;

  @ManyToOne(() => AdminModule)
  @JoinColumn({ name: 'module_id' })
  module!: AdminModule;

  @Column({ name: 'sub_module_id', type: 'int', nullable: true })
  subModuleId!: number | null;

  @ManyToOne(() => AdminSubModule, { nullable: true })
  @JoinColumn({ name: 'sub_module_id' })
  subModule!: AdminSubModule | null;

  @Column({ name: 'can_create', type: 'boolean', default: false })
  canCreate!: boolean;

  @Column({ name: 'can_read', type: 'boolean', default: false })
  canRead!: boolean;

  @Column({ name: 'can_update', type: 'boolean', default: false })
  canUpdate!: boolean;

  @Column({ name: 'can_delete', type: 'boolean', default: false })
  canDelete!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string | null;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string | null;
}
