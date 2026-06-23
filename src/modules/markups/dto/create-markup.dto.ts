import { IsEnum, IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator';
import { MarkupModule, MarkupType } from '../../../shared/enums';

/**
 * Data Transfer Object for creating a new Markup.
 * This class validates the incoming JSON body from the client before it hits our controller.
 */
export class CreateMarkupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  markupName!: string;

  @IsEnum(MarkupModule, { message: 'markupModule must be a valid module like flight, hotel, etc.' })
  @IsNotEmpty()
  markupModule!: MarkupModule;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  markupFrom!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  markupTo!: number;

  @IsEnum(MarkupType, { message: 'markupType must be either user or agent' })
  @IsNotEmpty()
  markupType!: MarkupType;
}
