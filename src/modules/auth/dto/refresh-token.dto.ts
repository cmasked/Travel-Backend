import { IsNotEmpty, IsString } from 'class-validator';

/** Refresh token — FRD §FR-US-016 */
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
