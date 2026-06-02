import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
          entities: [User],
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
