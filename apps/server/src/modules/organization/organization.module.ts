// src/modules/organization/organization.module.ts
import {
  Organization,
  OrganizationSchema,
} from './entities/organization.entity';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationService } from './organization.service';
import { OrganizationCommandHandlers } from './commands';
import { OrganizationController } from './organization.controller';
import { User, UserSchema } from '../users/entities/user.entity';
import { UserRepository } from '../users/repository/user.repository';
import { LoggerService } from 'services/logger-service/index.service';
import { JwtTokenService } from 'services/jwt-token-service/index.service';
import { OrganizationRepository } from './repository/organization.repository';
import { HttpErrorService } from 'services/http-error-service/index.service';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule,
  ],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    OrganizationRepository,
    UserRepository,
    LoggerService,
    JwtTokenService,
    HttpErrorService,
    ...OrganizationCommandHandlers,
  ],
  exports: [OrganizationRepository],
})
export class OrganizationModule {}
