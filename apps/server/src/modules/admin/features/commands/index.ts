import { CreateFeatureHandler } from './handlers/create-feature.handler';
import { UpdateFeatureHandler } from './handlers/update-feature.handler';
import { UpdateFeatureStatusHandler } from './handlers/update-feature-status.handler';

export const FeatureCommandHandlers = [
  CreateFeatureHandler,
  UpdateFeatureHandler,
  UpdateFeatureStatusHandler,
];
