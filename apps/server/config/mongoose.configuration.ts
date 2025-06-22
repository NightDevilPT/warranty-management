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
});
