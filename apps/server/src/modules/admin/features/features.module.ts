import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { FeaturesController } from './features.controller';
import { FeaturesService } from './features.service';
import { FeatureCommandHandlers } from './commands';
import { FeatureQueryHandlers } from './queries';

@Module({
  imports: [...CommonModules],
  controllers: [FeaturesController],
  providers: [
    FeaturesService,
    ...FeatureCommandHandlers,
    ...FeatureQueryHandlers,
  ],
})
export class FeaturesModule {}
