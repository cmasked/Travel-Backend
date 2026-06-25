import { IsEnum, IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { MarkupModule, MarkupType } from '../../../shared/enums';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for creating a new Markup.
 * This class validates the incoming JSON body from the client before it hits our controller.
 */
export class CreateMarkupDto {
  @ApiProperty({ example: 'Summer Holiday Markup' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  markupName!: string;

  @ApiProperty({ example: MarkupModule.FLIGHT, enum: MarkupModule })
  @IsEnum(MarkupModule, { message: 'markupModule must be a valid module like flight, hotel, etc.' })
  @IsNotEmpty()
  markupModule!: MarkupModule;

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  markupFrom!: number;

  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  markupTo!: number;

  @ApiProperty({ example: MarkupType.USER, enum: MarkupType })
  @IsEnum(MarkupType, { message: 'markupType must be either user or agent' })
  @IsNotEmpty()
  markupType!: MarkupType;
}
