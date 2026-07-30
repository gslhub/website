import type { CollectionConfig } from 'payload';

import { getPilotReadinessEndpoint } from '../endpoints/getPilotReadiness';
import { getStorageReadinessEndpoint } from '../endpoints/getStorageReadiness';
import { TestDataBatches as BaseTestDataBatches } from './TestDataBatches';

export const TestDataBatches: CollectionConfig = {
  ...BaseTestDataBatches,
  endpoints: [
    getStorageReadinessEndpoint,
    getPilotReadinessEndpoint,
    ...(BaseTestDataBatches.endpoints || []),
  ],
};
