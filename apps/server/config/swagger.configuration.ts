import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


export const setupSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('ChitChat')
    .setDescription('Chitchat Description')
    .setVersion('1.0')
    .addCookieAuth(
      'refreshToken', // Cookie name
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'Refresh token for authentication',
      },
      'refresh-token', // Security scheme name
    )
    .addCookieAuth(
      'accessToken', // Cookie name
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: 'Access token for authentication',
      },
      'access-token', // Security scheme name
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      withCredentials: true, // Important for cookies to work in Swagger UI
    },
  });
};
