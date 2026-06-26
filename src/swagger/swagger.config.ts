import { DocumentBuilder } from '@nestjs/swagger';
import { SWAGGER_API_TITLE, SWAGGER_API_DESCRIPTION, SWAGGER_API_VERSION } from './swagger.constants';

export const buildSwaggerConfig = () => {
  return new DocumentBuilder()
    .setTitle(SWAGGER_API_TITLE)
    .setDescription(SWAGGER_API_DESCRIPTION)
    .setVersion(SWAGGER_API_VERSION)
    .addBearerAuth()
    .build();
};
