import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesGuard } from 'common/guards/roles.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mongooseConfiguration from 'config/mongoose.configuration';
import { LoggerService } from 'services/logger-service/index.service';

// --- Importing All Modules
import { AllModules } from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [mongooseConfiguration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('database.uri'),
        dbName: configService.get('database.dbName'),
        onConnectionCreate: (connection) => {
          const logger = new LoggerService('MONGOOSE');
          connection.on('connected', () => logger.log('MongoDB Connected!'));
          connection.on('disconnected', () =>
            logger.error('MongoDB Disconnected!'),
          );
          connection.on('reconnected', () =>
            logger.log('MongoDB Reconnected!'),
          );
          connection.on('disconnecting', () =>
            logger.log('MongoDB Disconnecting...'),
          );
          connection.on('error', (err) => logger.error('MongoDB ERROR:', err));
          return connection;
        },
      }),
    }),
    ...AllModules,
  ],
  controllers: [AppController],
  providers: [AppService, RolesGuard],
})
export class AppModule {}
