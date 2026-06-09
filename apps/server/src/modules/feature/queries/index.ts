import { GetFeatureHandler } from './handlers/get-feature.handler';
import { ListFeaturesHandler } from './handlers/list-features.handler';
import { GetFeatureTreeHandler } from './handlers/get-feature-tree.handler';

export const FeatureQueryHandlers = [
  GetFeatureHandler,
  ListFeaturesHandler,
  GetFeatureTreeHandler,
];
