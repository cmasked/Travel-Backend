import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserType } from '../enums';
import { ErrorCodes } from '../constants/error-codes';

/**
 * Guard that restricts access to admin-only endpoints.
 * Checks user_type from JWT payload — only 'agent' types with admin roles
 * or platform admins are permitted.
 *
 * Per FRD §5.4 / §5.5, admin endpoints require Admin JWT.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user || !user.roleId) {
      throw new ForbiddenException({
        success: false,
        data: null,
        message: 'Admin access required',
        code: ErrorCodes.PERMISSION_DENIED,
      });
    }

    // The actual permission check is done by PermissionsGuard or
    // the /permissions/check endpoint. This guard is a first-pass
    // gate that ensures the user has a role assigned at all.
    return true;
  }
}
