import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { buildSwaggerConfig } from './swagger.config';
import { SWAGGER_API_ROOT } from './swagger.constants';

export const setupSwagger = (app: INestApplication): void => {
  const config = buildSwaggerConfig();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(SWAGGER_API_ROOT, app, document);
};
