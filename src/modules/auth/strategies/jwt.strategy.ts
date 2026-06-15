import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../../shared/interfaces/jwt-payload.interface';

/**
 * JWT strategy for Passport — RS256.
 * Per FRD §6.4: access tokens signed with RS256.
 * Public key injected via environment variable.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const publicKey = configService.get<string>('JWT_PUBLIC_KEY');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey
        ? Buffer.from(publicKey, 'base64').toString('utf8')
        : configService.get<string>('JWT_SECRET', 'dev-secret-change-me'),
      algorithms: publicKey ? ['RS256'] : ['HS256'],
    });
  }

  /** Validates the decoded token and attaches it to request.user */
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
