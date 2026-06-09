import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';
import { FeatureCommandHandlers } from './commands';
import { FeatureQueryHandlers } from './queries';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { RolesGuard } from 'middleware/guards/roles.guard';

@Module({
  imports: [...CommonModules],
  controllers: [FeatureController],
  providers: [
    FeatureService,
    JwtAuthGuard,
    RolesGuard,
    ...FeatureCommandHandlers,
    ...FeatureQueryHandlers,
  ],
})
export class FeatureModule {}
