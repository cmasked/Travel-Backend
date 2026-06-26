import { DocumentBuilder } from '@nestjs/swagger';
import { SWAGGER_API_TITLE, SWAGGER_API_DESCRIPTION, SWAGGER_API_VERSION } from './swagger.constants';

export const buildSwaggerConfig = () => {
  return new DocumentBuilder()
    .setTitle(SWAGGER_API_TITLE)
    .setDescription(SWAGGER_API_DESCRIPTION)
    .setVersion(SWAGGER_API_VERSION)
    .addBearerAuth()
    // Global Mandatory Headers
    .addApiKey({ type: 'apiKey', name: 'x-client-ip', in: 'header', description: 'e.g., 127.0.0.1' }, 'x-client-ip')
    .addApiKey({ type: 'apiKey', name: 'x-client-language', in: 'header', description: 'e.g., en' }, 'x-client-language')
    .addApiKey({ type: 'apiKey', name: 'x-client-currency', in: 'header', description: 'e.g., USD' }, 'x-client-currency')
    .addApiKey({ type: 'apiKey', name: 'x-client-device', in: 'header', description: 'e.g., web' }, 'x-client-device')
    .build();
};
