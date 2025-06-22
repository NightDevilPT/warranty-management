import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { setupSwagger } from 'config/swagger.configuration';
import { LoggerService } from 'services/logger-service/index.service';
import { ResponseInterceptor } from 'common/middleware/common-middleware.interceptor';
import { HttpExceptionFilter } from 'common/middleware/http-error-middleware.interceptor';

async function bootstrap() {
  const loggerService = new LoggerService('bootstrap');
  const app = await NestFactory.create(AppModule);
  // somewhere in your initialization file

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.enableCors({
    origin: true, // or specify your frontend URL
    credentials: true, // important for cookies
  });
  app.setGlobalPrefix('api');

  // Rest of your setup...
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
  loggerService.log(
    `Server is running : http://localhost:${process.env.PORT ?? 3000}/api`,
  );
  loggerService.log(
    `Swagger is running : http://localhost:${process.env.PORT ?? 3000}/swagger`,
  );
}
bootstrap();
