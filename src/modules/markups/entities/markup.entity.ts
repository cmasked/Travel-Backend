import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MarkupModule, MarkupType } from '../../../shared/enums';

/**
 * Markup Entity
 * Represents pricing markups applied to different modules (Flight, Hotel, etc.)
 */
@Entity({ name: 'markups' })
export class Markup {
  @PrimaryGeneratedColumn('uuid', { name: 'markup_id' })
  markupId!: string;

  @Column({ name: 'markup_name', type: 'varchar', length: 255 })
  markupName!: string;

  @Column({ name: 'markup_module', type: 'varchar', length: 50 })
  markupModule!: MarkupModule;

  @Column({ name: 'markup_from', type: 'decimal', precision: 10, scale: 2 })
  markupFrom!: number;

  @Column({ name: 'markup_to', type: 'decimal', precision: 10, scale: 2 })
  markupTo!: number;

  @Column({ name: 'markup_type', type: 'varchar', length: 50 })
  markupType!: MarkupType;

  // --- Audit Fields ---

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string | null;
}
