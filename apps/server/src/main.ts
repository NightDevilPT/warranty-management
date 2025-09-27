// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { swaggerConfig, swaggerCustomOptions } from 'config/swagger.config';
import { ResponseInterceptor } from 'middleware/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Enable CORS for cookies
  app.enableCors({
    origin: true, // In production, specify your frontend domains
    credentials: true, // Required for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
    ],
  });

  // Cookie parser middleware
  app.use(cookieParser());

  // Middleware, Interceptors, and Filters can be applied here
  app.useGlobalInterceptors(new ResponseInterceptor()); // Add your interceptors here

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Swagger setup
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, document, swaggerCustomOptions);

  await app.listen(process.env.PORT || 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT || 3000}/api`,
  );
  console.log(
    `Swagger documentation available at: http://localhost:${process.env.PORT || 3000}/swagger`,
  );
}
bootstrap();
