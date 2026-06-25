import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BannerModule } from '../../../shared/enums';

@Entity({ name: 'banners' })
export class Banner {
  @PrimaryGeneratedColumn('uuid', { name: 'banner_id' })
  bannerId!: string;

  @Column({ name: 'banner_name', type: 'varchar', length: 255 })
  bannerName!: string;

  @Column({ name: 'banner_code', type: 'varchar', length: 100, unique: true })
  bannerCode!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'images', type: 'text', array: true, default: [] })
  images!: string[];

  @Column({ name: 'link_url', type: 'varchar', length: 2048, nullable: true })
  linkUrl!: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'banner_module', type: 'varchar', length: 50 })
  bannerModule!: BannerModule;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

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
