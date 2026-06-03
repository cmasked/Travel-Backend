import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { Permission } from './modules/permissions/entities/permission.entity';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { Role } from './modules/roles/entities/role.entity';
import { RolesModule } from './modules/roles/roles.module';
import { User } from './modules/users/entities/user.entity';
import { UsersModule } from './modules/users/users.module';
import { CacheModule } from './cache.module';
import { SeederModule } from './seeder/seeder.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    CacheModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        return {
          type: 'postgres',
          url: databaseUrl,
          host: databaseUrl ? undefined : configService.get<string>('DATABASE_HOST') ?? 'localhost',
          port: databaseUrl ? undefined : Number(configService.get<string>('DATABASE_PORT') ?? 5432),
          username: databaseUrl ? undefined : configService.get<string>('DATABASE_USER') ?? 'postgres',
          password: databaseUrl ? undefined : configService.get<string>('DATABASE_PASSWORD') ?? 'postgres',
          database: databaseUrl ? undefined : configService.get<string>('DATABASE_NAME') ?? 'travel_backend',
          entities: [User, Role, Permission],
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    SeederModule,
  ],
})
export class AppModule {}
