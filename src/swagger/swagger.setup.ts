import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { buildSwaggerConfig } from './swagger.config';
import { SWAGGER_API_ROOT } from './swagger.constants';

export const setupSwagger = (app: INestApplication): void => {
  const config = buildSwaggerConfig();
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

  SwaggerModule.setup(SWAGGER_API_ROOT, app, document);
};
