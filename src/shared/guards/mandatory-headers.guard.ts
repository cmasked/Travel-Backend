import { CanActivate, ExecutionContext, Injectable, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ErrorCodes } from '../constants/error-codes';
import { MANDATORY_HEADERS_KEY } from '../../swagger/decorators/api-mandatory-headers.decorator';
import { HeaderValidationConfig } from '../constants/mandatory-headers.constant';

@Injectable()
export class MandatoryHeadersGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredHeaders = this.reflector.getAllAndOverride<HeaderValidationConfig[]>(
      MANDATORY_HEADERS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredHeaders) {
      return true; // Route does not require headers
    }

    const request = context.switchToHttp().getRequest();
    const headers = request.headers;

    const validationErrors: string[] = [];

    for (const config of requiredHeaders) {
      const val = headers[config.name];
      if (!val) {
        validationErrors.push(`Missing mandatory header: ${config.name}`);
        continue;
      }

      if (!config.regex.test(String(val))) {
        validationErrors.push(config.errorMessage);
      }
    }

    if (validationErrors.length > 0) {
      throw new BadRequestException({
        success: false,
        data: null,
        message: validationErrors.join('; '),
        code: ErrorCodes.VALIDATION_ERROR,
      });
    }

    return true;
  }
}