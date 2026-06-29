import { PartialType } from "@nestjs/mapped-types";
import { CreateCouponDto } from "./create-coupon.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";


export class UpdateCouponDto extends PartialType(CreateCouponDto) {
    @ApiProperty({ example: false, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}