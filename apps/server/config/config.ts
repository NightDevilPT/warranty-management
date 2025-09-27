// src/config/configuration.ts
export default () => ({
	databaseUrl: process.env.DATABASE_URL,
	jwtSecret: process.env.JWT_SECRET,
	jwtAccessExpireIn: process.env.JWT_ACCESS_EXPIREIN,
	jwtRefreshExpireIn: process.env.JWT_REFRESH_EXPIREIN,
	admin: process.env.ADMIN_ORIGIN,
	company: process.env.COMPANY_ORIGIN,
	consumer: process.env.CONSUMER_ORIGIN,
	emailId: process.env.EMAIL_ID,
	emailPassword: process.env.EMAIL_PASSWORD,
  });