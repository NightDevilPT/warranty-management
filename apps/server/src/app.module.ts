import { CommonModules } from 'services';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import configuration from '../config/config';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { MailModule } from 'services/mail/mail.module';
import { PrismaModule } from 'services/prisma/prisma.module';
import { AllModules } from './modules';
import { UsersModule } from './users/users.module';

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
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
