import { CqrsModule } from '@nestjs/cqrs';
import { ErrorModule } from './errors/error.module';
import { LoggerModule } from './logger/logger.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';

export const CommonModules = [
  CqrsModule,
  LoggerModule,
  ErrorModule,
  MailModule,
  PrismaModule
];
