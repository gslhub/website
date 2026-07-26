import type { CollectionConfig } from 'payload';

import {
  detachMetricDefinitionBeforeDelete,
  syncBenchmarkMetricDefinitionsAfterChange,
} from '../hooks/syncBenchmarkMetricDefinitions';
import { MetricDefinitions as BaseMetricDefinitions } from './MetricDefinitions';

export const MetricDefinitions: CollectionConfig = {
  ...BaseMetricDefinitions,
  hooks: {
    ...BaseMetricDefinitions.hooks,
    beforeDelete: [
      detachMetricDefinitionBeforeDelete,
      ...(BaseMetricDefinitions.hooks?.beforeDelete || []),
    ],
    afterChange: [
      ...(BaseMetricDefinitions.hooks?.afterChange || []),
      syncBenchmarkMetricDefinitionsAfterChange,
    ],
  },
};
