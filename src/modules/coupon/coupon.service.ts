import { 
    ConflictException, 
    Injectable, 
    BadRequestException, 
    NotFoundException 
} from "@nestjs/common";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";
import { CouponRepository } from "./coupon.repository";
import { Coupons } from "./entities/coupon.entity";
import { ErrorCodes } from "src/shared/constants/error-codes";

@Injectable()
export class CouponService {

    constructor(private readonly couponRepository: CouponRepository) { }

    // ==========================================
    // CREATE COUPON
    // ==========================================
    async create(dto: CreateCouponDto, adminId: string): Promise<Coupons> {
        try {
            const existing = await this.couponRepository.findByCode(dto.couponCode);
            if (existing) {
                throw new ConflictException({
                    message: "A Coupon with this code already exists",
                    code: ErrorCodes.COUPON_ALREADY_EXISTS
                });
            }

            // Ensure either discountAmount or discountPercentage is provided
            if (!dto.discountAmount && !dto.discountPercentage) {
                throw new BadRequestException({
                    message: "Either discount amount or discount percentage must be provided",
                    code: ErrorCodes.VALIDATION_ERROR
                });
            }

            const coupon = this.couponRepository.create({
                couponName: dto.couponName,
                couponCode: dto.couponCode,
                description: dto.description ?? null,
                discountAmount: dto.discountAmount ?? null,
                discountPercentage: dto.discountPercentage ?? null,
                images: dto.images ?? [],
                validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
                validTo: dto.validTo ? new Date(dto.validTo) : null,
                maximumUses: dto.maximumUses ?? null,
                useLimitPerUser: dto.useLimitPerUser ?? null,
                maxDiscountAmount: dto.maxDiscountAmount ?? null,
                minOrderAmount: dto.minOrderAmount ?? null,
                applicableUserType: dto.applicableUserType,
                applicableModule: dto.applicableModule,
                createdBy: adminId,
                updatedBy: adminId
            });

            return await this.couponRepository.save(coupon);
        } catch (error) {
            throw error;
        }
    }

    // ==========================================
    // FIND ALL COUPONS (PAGINATED)
    // ==========================================
    async findAll(query: {
        page?: number,
        limit?: number, 
        isActive?: string, 
        isPublic?: string, 
        couponModule?: string,
        name?: string
    }): Promise<any> {
        const page = query.page ? Number(query.page) : 1;
        const limit = query.limit ? Number(query.limit) : 20;
        
        const isActive = query.isActive ? String(query.isActive) === 'true' : undefined;
        const isPublic = query.isPublic ? String(query.isPublic) === 'true' : undefined;

        // Build the initial where clause
        const where: Record<string, unknown> = { isDeleted: false };
        
        if (isActive !== undefined) {
            where['isActive'] = isActive;
        }
        
        if (isPublic !== undefined) {
            where['isPublic'] = isPublic;
        }
        
        if (query.couponModule) {
            const validModules = ["flight", "hotel", "bus", "holiday", "cab"];
            if (!validModules.includes(query.couponModule.toLowerCase())) {
                throw new BadRequestException({
                    message: `Invalid couponModule. Must be one of: ${validModules.join(', ')}`,
                    code: ErrorCodes.VALIDATION_ERROR
                });
            }
            where['applicableModule'] = query.couponModule.toUpperCase(); 
        }
        
        const [data, total] = await this.couponRepository.findAll(where, page, limit, query.name);
      
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // ==========================================
    // UPDATE COUPON
    // ==========================================
    async update(dto: UpdateCouponDto, adminId: string, couponId: string): Promise<Coupons> {
        try {
            const coupon = await this.couponRepository.findById(couponId);
            
            if (!coupon) {
                throw new NotFoundException({
                    message: "Coupon not found",
                    code: ErrorCodes.COUPON_NOT_FOUND, 
                });
            }

            coupon.couponName = dto.couponName ?? coupon.couponName;
            coupon.couponCode = dto.couponCode ?? coupon.couponCode;
            coupon.description = dto.description ?? coupon.description;
            coupon.discountAmount = dto.discountAmount ?? coupon.discountAmount;
            coupon.discountPercentage = dto.discountPercentage ?? coupon.discountPercentage;
            coupon.images = dto.images ?? coupon.images;
            coupon.validFrom = dto.validFrom ? new Date(dto.validFrom) : coupon.validFrom;
            coupon.validTo = dto.validTo ? new Date(dto.validTo) : coupon.validTo;
            coupon.maximumUses = dto.maximumUses ?? coupon.maximumUses;
            coupon.useLimitPerUser = dto.useLimitPerUser ?? coupon.useLimitPerUser;
            coupon.maxDiscountAmount = dto.maxDiscountAmount ?? coupon.maxDiscountAmount;
            coupon.minOrderAmount = dto.minOrderAmount ?? coupon.minOrderAmount;
            coupon.applicableUserType = dto.applicableUserType ?? coupon.applicableUserType;
            coupon.applicableModule = dto.applicableModule ?? coupon.applicableModule;
            coupon.updatedBy = adminId;

            return await this.couponRepository.save(coupon);
            
        } catch (error) {
            throw error;
        }
    }

    // ==========================================
    // FIND BY ID
    // ==========================================
    async findById(couponId: string): Promise<Coupons> {
        const coupon = await this.couponRepository.findById(couponId);
        if (!coupon) {
            throw new NotFoundException({
                message: "Coupon not found",
                code: ErrorCodes.COUPON_NOT_FOUND,
            });
        }
        return coupon;
    }

    // ==========================================
    // REMOVE COUPON (SOFT DELETE)
    // ==========================================
    async remove(couponId: string, adminId: string): Promise<void> {
        const coupon = await this.findById(couponId);
        coupon.updatedBy = adminId; // Track who deleted it
        await this.couponRepository.remove(coupon);
    }

    // ==========================================
    // FIND ACTIVE PUBLIC COUPONS
    // ==========================================
    async findActivePublic(couponModule?: string): Promise<Coupons[]> {
        if (couponModule) {
            const validModules = ["flight", "hotel", "bus", "holiday", "cab"];
            if (!validModules.includes(couponModule.toLowerCase())) {
                throw new BadRequestException({
                    message: `Invalid couponModule. Must be one of: ${validModules.join(', ')}`,
                    code: ErrorCodes.VALIDATION_ERROR
                });
            }
            couponModule = couponModule.toUpperCase();
        }
        return this.couponRepository.findActivePublic(couponModule);
    }

    // ==========================================
    // VALIDATE AND APPLY COUPON
    // ==========================================
    async validateAndApplyCoupon(couponCode: string, orderAmount: number): Promise<{ discountAmount: number, finalAmount: number, coupon: Coupons }> {
        const coupon = await this.couponRepository.findByCode(couponCode);

        if (!coupon || !coupon.isActive) {
            throw new BadRequestException({
                message: "Invalid or inactive coupon",
                code: ErrorCodes.VALIDATION_ERROR
            });
        }

        const now = new Date();
        if (coupon.validFrom && new Date(coupon.validFrom) > now) {
            throw new BadRequestException({
                message: "This coupon is not valid yet",
                code: ErrorCodes.VALIDATION_ERROR
            });
        }

        if (coupon.validTo && new Date(coupon.validTo) < now) {
            throw new BadRequestException({
                message: "This coupon has expired",
                code: ErrorCodes.VALIDATION_ERROR
            });
        }

        if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
            throw new BadRequestException({
                message: `Order amount must be at least ${coupon.minOrderAmount} to use this coupon`,
                code: ErrorCodes.VALIDATION_ERROR
            });
        }

        // Calculate discount
        let calculatedDiscount = 0;
        if (coupon.discountAmount) {
            calculatedDiscount = Number(coupon.discountAmount);
        } else if (coupon.discountPercentage) {
            calculatedDiscount = (orderAmount * Number(coupon.discountPercentage)) / 100;
        }

        // Apply max discount cap
        if (coupon.maxDiscountAmount && calculatedDiscount > Number(coupon.maxDiscountAmount)) {
            calculatedDiscount = Number(coupon.maxDiscountAmount);
        }

        // Ensure we don't discount more than the order itself
        if (calculatedDiscount > orderAmount) {
            calculatedDiscount = orderAmount;
        }

        const finalAmount = orderAmount - calculatedDiscount;

        return {
            discountAmount: calculatedDiscount,
            finalAmount,
            coupon
        };
    }
}