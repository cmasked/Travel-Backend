import { CanActivate, ExecutionContext, Injectable, BadRequestException } from '@nestjs/common';
import { ErrorCodes } from '../constants/error-codes';

@Injectable()
export class MandatoryHeadersGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;

    const requiredHeaders = [
      'x-client-ip',
      'x-client-language',
      'x-client-currency',
      'x-client-device',
    ];

    const missingHeaders = requiredHeaders.filter(header => !headers[header]);

    if (missingHeaders.length > 0) {
      throw new BadRequestException({
        success: false,
        data: null,
        message: `Missing mandatory headers: ${missingHeaders.join(', ')}`,
        code: ErrorCodes.VALIDATION_ERROR,
      });
    }

    return true;
  }
}
