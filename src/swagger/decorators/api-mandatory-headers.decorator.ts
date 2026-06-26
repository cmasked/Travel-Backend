import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

/**
 * Custom decorator to inject mandatory global headers into Swagger UI.
 * This avoids registering them as API keys, placing them directly into the headers section.
 */
export function ApiMandatoryHeaders() {
  return applyDecorators(
    ApiHeader({ name: 'x-client-ip', description: 'e.g., 127.0.0.1', required: true }),
    ApiHeader({ name: 'x-client-language', description: 'e.g., en', required: true }),
    ApiHeader({ name: 'x-client-currency', description: 'e.g., USD', required: true }),
    ApiHeader({ name: 'x-client-device', description: 'e.g., web', required: true }),
  );
}
