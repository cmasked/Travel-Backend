import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Coupons } from "./entities/coupon.entity";
import { ILike, Repository } from "typeorm";




@Injectable()
export class CouponRepository {
    constructor(
        @InjectRepository(Coupons)
        private readonly couponRepo: Repository<Coupons>,
    ) { }

    create(partial: Partial<Coupons>): Coupons {
        return this.couponRepo.create(partial);
    }
    save(coupon: Coupons): Promise<Coupons> {
        return this.couponRepo.save(coupon);
    }

    findAll(where: Record<string, unknown>, page: number, limit: number, name?: string): Promise<[Coupons[], number]> {
        let finalWhere: any = where;
        if (name) {
            finalWhere = { ...where, couponName: ILike(`%${name}%`) }
        }
        return this.couponRepo.findAndCount({
            where: finalWhere,
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        })
    }
    findActivePublic(couponModule?: string): Promise<Coupons[]> {
        const where: Record<string, unknown> = { isActive: true, isDeleted: false }
        if (couponModule) {
            where['applicableModule'] = couponModule;
        }
        return this.couponRepo.find({
            where: where,
            order: { createdAt: 'DESC' },

        })

    }
    async findById(couponId?: string): Promise<Coupons | null> {
        if (!couponId) {
            return null;
        }
        return this.couponRepo.findOne({ where: { couponId, isDeleted: false } })
    }
    async findByCode(couponCode?: string): Promise<Coupons | null> {
        if (!couponCode) {
            return null;
        }
        return this.couponRepo.findOne({ where: { couponCode, isDeleted: false } })
    }
    remove(coupon: Coupons): Promise<Coupons> {
        coupon.isDeleted = true;
        return this.couponRepo.save(coupon);
    }
}


