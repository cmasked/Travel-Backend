import { UserStatus } from 'src/shared/enums';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';



@Entity({ name: 'coupons' })
export class Coupons {
  @PrimaryGeneratedColumn('uuid', { name: 'coupon_id' })
  couponId!: string;

  @Column({ name: 'coupon_code', type: 'varchar', length: 100, unique: true })
  couponCode!: string;

  @Column({ name: 'coupon_name', type: 'varchar', length: 100 })
  couponName!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2 })
  discountAmount!: number;

  @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercentage!: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'images', type: 'text', array: true, default: [] })
  images!: string[];

  @Column({ name: 'valid_from', type: 'timestamptz', nullable: true })
  validFrom!: Date | null;

  @Column({ name: 'valid_to', type: 'timestamptz', nullable: true })
  validTo!: Date | null;

  @Column({ name: 'maximum_uses', type: 'int', nullable: true })
  maximumUses!: number | null;

  @Column({ name: 'used_count', type: 'int', default: 0 })
  usedCount!: number;

  @Column({ name: 'use_limit_per_user', type: 'int', nullable: true, default: 1 })
  useLimitPerUser!: number | null;

  @Column({ name: 'max_discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscountAmount!: number | null;

  @Column({ name: 'min_order_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  minOrderAmount!: number | null;

  @Column({ name: 'applicable_user_type', type: 'enum', enum: ['user', 'agent', 'admin'] })
  applicableUserType!: 'user' | 'agent' | 'admin';

  @Column({ name: 'applicable_module', type: 'enum', enum: ['flight', 'hotel', 'bus', 'holiday', 'cab'] })
  applicableModule!: 'flight' | 'hotel' | 'bus' | 'holiday' | 'cab';


  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string | null;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string | null;

}
