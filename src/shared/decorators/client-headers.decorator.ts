import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface ClientHeadersData {
  ip: string;
  language: string;
  currency: string;
  device: string;
}

export const ClientHeaders = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ClientHeadersData => {
    const request = ctx.switchToHttp().getRequest();
    return {
      ip: request.headers['x-client-ip'] as string,
      language: request.headers['x-client-language'] as string,
      currency: request.headers['x-client-currency'] as string,
      device: request.headers['x-client-device'] as string,
    };
  },
);
