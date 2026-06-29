import { IsArray, IsDecimal, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min, Validate, IsDate } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

export class CreateCouponDto {
    @ApiProperty({
        example: "Diwali Coupon"
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    couponName!: string;

    @ApiProperty({
        example: "DIWALI_LIGHTS_2026"
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    couponCode!: string;

    @ApiProperty({
        example: "This is a special coupon for Diwali 2026", required: false
    })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    description!: string;

    @ApiProperty({
        example: 250, required: false
    })

    @IsDecimal()
    @IsOptional()
    discountAmount!: number;

    @ApiProperty({
        example: 10, required: false
    })
    @IsDecimal()
    @IsOptional()
    discountPercentage!: number;


    @ApiProperty({
        example: ["image.jpg", "image2.jpg"], required: false
    })

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @MaxLength(255, { each: true })
    images!: string[];

    @ApiProperty({
        example: '2026-01-01T00:00:00Z', required: false
    })
    @IsString()
    @IsOptional()
    validFrom!: string;

    @ApiProperty({
        example: '2026-12-31T23:59:59Z', required: false
    })
    @IsString()
    @IsOptional()
    validTo!: string;

    @ApiProperty({
        example: 100, required: false
    })
    @IsNumber()
    @IsOptional()
    maximumUses!: number;

    @ApiProperty({
        example: 10, required: false
    })
    @IsNumber()
    @IsOptional()
    useLimitPerUser!: number;

    @ApiProperty({
        example: 1000, required: false
    })
    @IsNumber()
    @IsOptional()
    maxDiscountAmount!: number;

    @ApiProperty({
        example: 100, required: false
    })
    @IsNumber()
    @IsOptional()
    minOrderAmount!: number;


    @ApiProperty({
        example: "user", enum: ['user', 'agent', 'admin'], required: false
    })
    @IsEnum(['user', 'agent', 'admin'])
    @IsOptional()
    applicableUserType!: 'user' | 'agent' | 'admin';



    @ApiProperty({
        example: "flight", enum: ['flight', 'hotel', 'bus', 'holiday', 'cab'], required: false
    })
    @IsEnum(['flight', 'hotel', 'bus', 'holiday', 'cab'])
    @IsOptional()
    applicableModule!: 'flight' | 'hotel' | 'bus' | 'holiday' | 'cab';



}