import type { CollectionConfig } from 'payload';

import { protectMetricSnapshot } from '../hooks/protectMetricSnapshot';
import { validateMetricScientificContext } from '../hooks/validateMetricScientificContext';
import { Metrics as BaseMetrics } from './Metrics';

export const Metrics: CollectionConfig = {
  ...BaseMetrics,
  hooks: {
    ...BaseMetrics.hooks,
    beforeValidate: [
      ...(BaseMetrics.hooks?.beforeValidate || []),
      validateMetricScientificContext,
      protectMetricSnapshot,
    ],
  },
};
