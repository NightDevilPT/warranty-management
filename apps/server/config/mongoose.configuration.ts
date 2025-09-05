export default () => ({
  port: process.env.PORT || 3000,
  database: {
    uri: process.env.MONGODB_URI,
    host: process.env.MONGODB_HOST || 'localhost',
    port: process.env.MONGODB_PORT || 27017,
    name: process.env.MONGODB_DATABASE || 'test',
    user: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD,
    authSource: process.env.MONGODB_AUTHSOURCE || 'admin',
  },
  ADMIN_URL: process.env.ADMIN_ORIGIN,
  COMPANY_URL: process.env.COMPANY_ORIGIN,
  CONSUMER_URL: process.env.CONSUMER_ORIGIN,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
});

export enum CONFIG_ENUM {
  ADMIN_URL = "ADMIN_URL",
  COMPANY_URL = "COMPANY_URL",
  CONSUMER_URL = "CONSUMER_URL",
  ADMIN_EMAIL = "ADMIN_EMAIL",
  ADMIN_PASSWORD = "ADMIN_PASSWORD"
}
