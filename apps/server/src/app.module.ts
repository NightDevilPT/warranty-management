import { CommonModules } from 'services';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import configuration from '../config/config';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { MailModule } from 'services/mail/mail.module';
import { PrismaModule } from 'services/prisma/prisma.module';
import { AllModules } from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available globally
      load: [configuration], // Load your custom configuration
    }),
    PrismaModule,
    MailModule,
    ...AllModules,
    ...CommonModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
