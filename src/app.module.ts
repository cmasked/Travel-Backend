import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { UserModule } from './modules/user.module';

// Shared
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';

// Entities (for TypeORM)
import { UserAccount } from './modules/users/entities/user-account.entity';
import { UserAccountAdditional } from './modules/users/entities/user-account-additional.entity';
import { Traveler } from './modules/travelers/entities/traveler.entity';
import { Role } from './modules/roles/entities/role.entity';
import { AdminModule as AdminModuleEntity } from './modules/roles/entities/admin-module.entity';
import { AdminSubModule } from './modules/roles/entities/admin-sub-module.entity';
import { Permission } from './modules/permissions/entities/permission.entity';
import { LoginLog } from './modules/audit/entities/login-log.entity';
import { ForceLogoutLog } from './modules/audit/entities/force-logout-log.entity';

/**
 * Root application module — MyGozzo User Service.
 * FRD §2.1: user-service, port 3001, NestJS + TypeORM + Postgres 16.
 */
@Module({
  imports: [UserModule],
  providers: [
    // Global JWT guard — all routes protected unless @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Standard response envelope { success, data, message, code }
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    // Global exception filter
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
