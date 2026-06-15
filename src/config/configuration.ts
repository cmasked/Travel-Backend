export default () => ({
  app: {
    port: Number(process.env.PORT ?? 3001),
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    username: process.env.DATABASE_USER ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? 'postgres',
    name: process.env.DATABASE_NAME ?? 'mygozzo_user_service',
  },
  jwt: {
    privateKey: process.env.JWT_PRIVATE_KEY ?? '',
    publicKey: process.env.JWT_PUBLIC_KEY ?? '',
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY ?? '15m',
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY ?? '',
  },
});
