// src/decorators/required-feature.decorator.ts

import { SetMetadata } from '@nestjs/common';

export const REQUIRED_FEATURE_KEY = 'requiredFeature';

/**
 * Decorator to specify which feature/permission is required to access an endpoint.
 *
 * Usage:
 * @RequiredFeature('PRODUCT_CREATE')
 * @RequiredFeature('CLAIM_APPROVE')
 */
export const RequiredFeature = (feature: string) =>
  SetMetadata(REQUIRED_FEATURE_KEY, feature);
