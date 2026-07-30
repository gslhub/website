import type { CollectionConfig } from 'payload';

import { getStorageReadinessEndpoint } from '../endpoints/getStorageReadiness';
import { TestDataBatches as BaseTestDataBatches } from './TestDataBatches';

export const TestDataBatches: CollectionConfig = {
  ...BaseTestDataBatches,
  endpoints: [
    getStorageReadinessEndpoint,
    ...(BaseTestDataBatches.endpoints || []),
  ],
};
