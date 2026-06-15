import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from '../config/configuration';
import { SharedModule } from '../shared/shared.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TravelersModule } from './travelers/travelers.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AuditModule } from './audit/audit.module';
import { SeederModule } from '../seeder/seeder.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('database.url');

        return {
          type: 'postgres',
          url: databaseUrl || undefined,
          host: databaseUrl ? undefined : config.get<string>('database.host', 'localhost'),
          port: databaseUrl ? undefined : Number(config.get<number>('database.port', 5432)),
          username: databaseUrl ? undefined : config.get<string>('database.username', 'postgres'),
          password: databaseUrl ? undefined : config.get<string>('database.password', 'postgres'),
          database: databaseUrl ? undefined : config.get<string>('database.name', 'mygozzo_user_service'),
          autoLoadEntities: true,
          synchronize: true,
          extra: {
            max: 5,
          },
          logging: ['error'],
        };
      },
    }),
    SharedModule,
    RedisModule,
    AuthModule,
    UsersModule,
    TravelersModule,
    RolesModule,
    PermissionsModule,
    AuditModule,
    SeederModule,
  ],
  exports: [AuthModule, UsersModule, TravelersModule, RolesModule, PermissionsModule, AuditModule, SeederModule],
})
export class UserModule {}
