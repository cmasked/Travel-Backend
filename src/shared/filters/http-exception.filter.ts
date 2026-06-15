import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorCodes } from '../constants/error-codes';

/**
 * Global exception filter. Returns all errors in the FRD §5 envelope:
 * { success: false, data: null, message: string, code: string }
 *
 * Per FRD §FR-US-044 / §7.3 DPDP: PII must never appear in logs.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code: string = ErrorCodes.INTERNAL_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'object' && exResponse !== null) {
        const res = exResponse as Record<string, unknown>;
        message = (res['message'] as string) ?? exception.message;
        code = (res['code'] as string) ?? this.statusToCode(status);

        // class-validator returns message as array
        if (Array.isArray(res['message'])) {
          message = (res['message'] as string[]).join('; ');
          code = ErrorCodes.VALIDATION_ERROR;
        }
      } else {
        message = exResponse as string;
        code = this.statusToCode(status);
      }
    }

    // Log error without PII (DPDP §7.3)
    this.logger.error(`[${code}] ${message}`, exception instanceof Error ? exception.stack : undefined);

    response.status(status).json({
      success: false,
      data: null,
      message,
      code,
    });
  }

  private statusToCode(status: number): string {
    switch (status) {
      case 400: return ErrorCodes.VALIDATION_ERROR;
      case 401: return ErrorCodes.SESSION_EXPIRED;
      case 403: return ErrorCodes.PERMISSION_DENIED;
      case 409: return ErrorCodes.EMAIL_ALREADY_EXISTS;
      default:  return ErrorCodes.INTERNAL_ERROR;
    }
  }
}
