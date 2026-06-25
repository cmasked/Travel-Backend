import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PublicAuthController } from './public-auth.controller';
import { AdminAuthController } from './admin-auth.controller';
import { PublicAuthService } from './public-auth.service';
import { AdminAuthService } from './admin-auth.service';
import { BaseAuthService } from './base-auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserAccount } from '../users/entities/user-account.entity';
import { UserAccountAdditional } from '../users/entities/user-account-additional.entity';
import { Traveler } from '../travelers/entities/traveler.entity';
import { LoginLog } from '../audit/entities/login-log.entity';
import { AuthRepository } from './auth.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const privateKey = config.get<string>('jwt.privateKey');
        const publicKey = config.get<string>('jwt.publicKey');

        // RS256 if keys provided, HS256 fallback for dev
        if (privateKey && publicKey) {
          return {
            privateKey: Buffer.from(privateKey, 'base64').toString('utf8'),
            publicKey: Buffer.from(publicKey, 'base64').toString('utf8'),
            signOptions: {
              algorithm: 'RS256',
              expiresIn: config.get<string>('jwt.accessTokenExpiry', '15m'),
            },
          };
        }

        return {
          secret: config.get<string>('jwt.secret', 'dev-secret-change-me'),
          signOptions: {
            expiresIn: config.get<string>('jwt.accessTokenExpiry', '15m'),
          },
        };
      },
    }),
    TypeOrmModule.forFeature([UserAccount, UserAccountAdditional, Traveler, LoginLog]),
  ],
  controllers: [PublicAuthController, AdminAuthController],
  providers: [BaseAuthService, PublicAuthService, AdminAuthService, JwtStrategy, AuthRepository],
  exports: [PublicAuthService, AdminAuthService, JwtModule],
})
export class AuthModule {}
