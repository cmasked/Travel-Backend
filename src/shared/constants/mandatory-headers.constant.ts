export interface HeaderValidationConfig {
  name: string;
  description: string;
  default: string;
  regex: RegExp;
  swaggerPattern?: string;
  errorMessage: string;
  enum?: string[];
}

export const IP_HEADER_CONFIG: HeaderValidationConfig = {
  name: 'ip',
  description: 'IP must be a valid IPv4 address.',
  default: '127.0.0.1',
  regex: /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/,
  swaggerPattern: '^(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}$',
  errorMessage: 'IP must be a valid IPv4 address.',
};

export const LANGUAGE_HEADER_CONFIG: HeaderValidationConfig = {
  name: 'language',
  description: 'Language must be a valid 2 letter language code (e.g. en, fr).',
  default: 'en',
  regex: /^[a-zA-Z]{2}$/,
  swaggerPattern: '^[a-zA-Z]{2}$',
  errorMessage: 'Language must be a valid 2 letter language code (e.g. en, fr).',
};

export const CURRENCY_HEADER_CONFIG: HeaderValidationConfig = {
  name: 'currency',
  description: 'Currency must be a valid 3-letter ISO currency code (e.g. USD, EUR, INR).',
  default: 'USD',
  regex: /^[A-Z]{3}$/i,
  swaggerPattern: '^[a-zA-Z]{3}$',
  errorMessage: 'Currency must be a valid 3-letter ISO currency code (e.g. USD, EUR, INR).',
};

export const DEVICE_HEADER_CONFIG: HeaderValidationConfig = {
  name: 'device',
  description: 'Device must be one of: ios, web, android.',
  default: 'web',
  regex: /^(ios|web|android)$/i,
  enum: ['ios', 'web', 'android'],
  errorMessage: 'Device must be one of: ios, web, android.',
};

export const API_VERSION_HEADER_CONFIG: HeaderValidationConfig = {
  name: 'api-version',
  description: 'API-Version must be in the format v1, v2, etc.',
  default: 'v1',
  regex: /^v\d+$/i,
  swaggerPattern: '^v\\d+$',
  errorMessage: 'API-Version must be in the format v1, v2, etc.',
};

export const MANDATORY_HEADERS: HeaderValidationConfig[] = [
  IP_HEADER_CONFIG,
  LANGUAGE_HEADER_CONFIG,
  CURRENCY_HEADER_CONFIG,
  DEVICE_HEADER_CONFIG,
  API_VERSION_HEADER_CONFIG,
];
