import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { MandatoryHeadersGuard } from './shared/guards/mandatory-headers.guard';

/**
 * MyGozzo User Service — FRD §2.1.
 * Port: 3001 (configurable via PORT env var).
 * Memory cap: 200 MB RSS (FRD §2.1).
 */
async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // FRD §7.2: whitelist + forbidNonWhitelisted for XSS protection
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalGuards(new MandatoryHeadersGuard());

  app.enableCors();

  // FRD §7.4: health check endpoint
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/health', (_req: unknown, res: { json: (data: unknown) => void }) => {
    const memUsage = process.memoryUsage();
    res.json({
      success: true,
      data: {
        status: 'ok',
        uptime: process.uptime(),
        memory: {
          rss_mb: Math.round(memUsage.rss / 1024 / 1024),
          heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
          heap_total_mb: Math.round(memUsage.heapTotal / 1024 / 1024),
          warning: memUsage.rss > 170 * 1024 * 1024,
          critical: memUsage.rss > 190 * 1024 * 1024,
        },
        timestamp: new Date().toISOString(),
      },
      message: 'Healthy',
      code: 'OK',
    });
  });

  const port = Number(configService.get<number>('app.port', 3001));
  await app.listen(port);
  logger.log(`🚀 MyGozzo User Service running on port ${port}`);
}

void bootstrap();
