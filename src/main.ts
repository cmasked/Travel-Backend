import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { MandatoryHeadersGuard } from './shared/guards/mandatory-headers.guard';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Travel Backend API')
    .setDescription('The official API for the Travel App')
    .setVersion('1.0')
    .addBearerAuth()
    // Global Mandatory Headers
    .addApiKey({ type: 'apiKey', name: 'x-client-ip', in: 'header', description: 'e.g., 127.0.0.1' }, 'x-client-ip')
    .addApiKey({ type: 'apiKey', name: 'x-client-language', in: 'header', description: 'e.g., en' }, 'x-client-language')
    .addApiKey({ type: 'apiKey', name: 'x-client-currency', in: 'header', description: 'e.g., USD' }, 'x-client-currency')
    .addApiKey({ type: 'apiKey', name: 'x-client-device', in: 'header', description: 'e.g., web' }, 'x-client-device')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Ensure Swagger UI sends the global headers even if an endpoint overrides security (e.g., via @ApiBearerAuth)
  for (const path in document.paths) {
    for (const method in document.paths[path]) {
      const operation = (document.paths[path] as any)[method];
      if (operation.security && operation.security.length > 0) {
        // If it has existing security (like Bearer), add the headers to it (AND logic)
        operation.security.forEach((sec: any) => {
          sec['x-client-ip'] = [];
          sec['x-client-language'] = [];
          sec['x-client-currency'] = [];
          sec['x-client-device'] = [];
        });
      } else {
        // If it's a public endpoint, it still needs the global headers
        operation.security = [{
          'x-client-ip': [],
          'x-client-language': [],
          'x-client-currency': [],
          'x-client-device': []
        }];
      }
    }
  }

  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  logger.log(`MyGozzo User Service running on port ${port}`);
}

void bootstrap();
