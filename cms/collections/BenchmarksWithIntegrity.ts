import type { CollectionConfig } from 'payload';

import { hydrateBenchmarkMetricDefinitions } from '../hooks/hydrateBenchmarkMetricDefinitions';
import { protectBenchmarkDefinition } from '../hooks/protectBenchmarkDefinition';
import { Benchmarks as BaseBenchmarks } from './Benchmarks';

export const Benchmarks: CollectionConfig = {
  ...BaseBenchmarks,
  hooks: {
    ...BaseBenchmarks.hooks,
    beforeValidate: [
      ...(BaseBenchmarks.hooks?.beforeValidate || []),
      protectBenchmarkDefinition,
    ],
    afterRead: [
      ...(BaseBenchmarks.hooks?.afterRead || []),
      hydrateBenchmarkMetricDefinitions,
    ],
  },
};
