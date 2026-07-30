import type { CollectionConfig } from 'payload';

import { getStorageReadinessEndpoint } from '../endpoints/getStorageReadiness';
import { getVerifiedPilotReadinessEndpoint } from '../endpoints/getVerifiedPilotReadiness';
import { TestDataBatches as BaseTestDataBatches } from './TestDataBatches';

export const TestDataBatches: CollectionConfig = {
  ...BaseTestDataBatches,
  endpoints: [
    getStorageReadinessEndpoint,
    getVerifiedPilotReadinessEndpoint,
    ...(BaseTestDataBatches.endpoints || []),
  ],
};
