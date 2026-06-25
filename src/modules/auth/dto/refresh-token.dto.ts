import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** Refresh token — FRD §FR-US-016 */
export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJh...refreshToken...' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
