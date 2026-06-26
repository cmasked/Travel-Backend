import { DocumentBuilder } from '@nestjs/swagger';
import { SWAGGER_API_TITLE, SWAGGER_API_DESCRIPTION, SWAGGER_API_VERSION } from './swagger.constants';

export const buildSwaggerConfig = () => {
  return new DocumentBuilder()
    .setTitle(SWAGGER_API_TITLE)
    .setDescription(SWAGGER_API_DESCRIPTION)
    .setVersion(SWAGGER_API_VERSION)
    .addBearerAuth()
    .addTag('Admin Auth', 'Admin authentication endpoints')
    .addTag('Admin Users', 'Admin user management endpoints')
    .addTag('Public Auth', 'Public authentication endpoints')
    .addTag('Public Users', 'Public user profile endpoints')
    .addTag('Banners', 'Banner management')
    .addTag('Markups', 'Markup management')
    .addTag('Travelers', 'Traveler endpoints')
    .addTag('Roles', 'Role management endpoints')
    .addTag('Permissions', 'Permission management endpoints')
    .addTag('Audit', 'Audit log endpoints')
    .build();
};
