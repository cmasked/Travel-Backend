import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { MANDATORY_HEADERS } from '../../shared/constants/mandatory-headers.constant';

export const MANDATORY_HEADERS_KEY = 'mandatory_headers';

export function ApiMandatoryHeaders() {
  const headerDecorators = MANDATORY_HEADERS.map((header) => {
    const schema: any = { type: 'string', default: header.default };
    if (header.enum) {
      schema.enum = header.enum;
    }
    if (header.swaggerPattern) {
      schema.pattern = header.swaggerPattern;
    }
    return ApiHeader({
      name: header.name,
      description: header.description,
      required: true,
      schema,
    });
  });

  return applyDecorators(
    SetMetadata(MANDATORY_HEADERS_KEY, MANDATORY_HEADERS),
    ...headerDecorators
  );
}