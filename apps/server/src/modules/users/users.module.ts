import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserCommandHandlers } from './commands';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from 'services/mail/mail.module';
import { User, UserSchema } from './entities/user.entity';
import { UserRepository } from './repository/user.repository';
import { HashService } from 'services/hash-service/index.service';
import { LoggerService } from 'services/logger-service/index.service';
import { HttpErrorService } from 'services/http-error-service/index.service';

@Module({
  imports: [
    CqrsModule,
    MailModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    HashService,
    HttpErrorService,
    LoggerService,
    ...UserCommandHandlers,
  ],
})
export class UsersModule {}
