// src/config/configuration.ts
export default () => ({
  databaseUrl: process.env.DATABASE_URL,

  // JWT Configuration
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    accessExpireIn:
      process.env.JWT_ACCESS_EXPIREIN ||
      process.env.JWT_ACCESS_EXPIRES_IN ||
      '15m',
    refreshExpireIn:
      process.env.JWT_REFRESH_EXPIREIN ||
      process.env.JWT_REFRESH_EXPIRES_IN ||
      '7d',
  },

  admin: process.env.ADMIN_ORIGIN,
  company: process.env.COMPANY_ORIGIN,
  consumer: process.env.CONSUMER_ORIGIN,
  emailId: process.env.EMAIL_ID,
  emailPassword: process.env.EMAIL_PASSWORD,

  // AWS / Floci (LocalStack) S3 Configuration
  aws: {
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
    endpoint: process.env.AWS_ENDPOINT_URL || 'http://localhost:4566',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
    s3: {
      bucket: process.env.AWS_S3_BUCKET || 'warranty-system-uploads',
      forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === 'true' || true,
      presignedUrlExpiration: parseInt(
        process.env.AWS_S3_PRESIGNED_URL_EXPIRATION || '3600',
        10,
      ),
    },
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    username: process.env.REDIS_USER || '',
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
    url: process.env.REDIS_URL || 'redis://localhost:6379/0',
  },
});
