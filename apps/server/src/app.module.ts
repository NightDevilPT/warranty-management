import { AllModules } from './modules';
import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { AppService } from './app.service';
import configuration from '../config/config';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available globally
      load: [configuration], // Load your custom configuration
    }),
    ...AllModules,
    ...CommonModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
