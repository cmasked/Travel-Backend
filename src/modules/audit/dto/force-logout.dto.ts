import { IsBoolean, IsOptional } from 'class-validator';

/** Force logout DTO — FRD §FR-US-042 */
export class ForceLogoutDto {
  @IsOptional()
  @IsBoolean()
  all?: boolean;
}
