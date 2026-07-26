import type { CollectionConfig } from 'payload';

import { protectMetricSnapshot } from '../hooks/protectMetricSnapshot';
import { createScientificRecordCodeValidator } from '../hooks/validateScientificRecordCode';
import { validateMetricScientificContext } from '../hooks/validateMetricScientificContext';
import { Metrics as BaseMetrics } from './Metrics';

const validateMetricRecordCode = createScientificRecordCodeValidator({
  field: 'metricRecordCode',
  token: 'MET',
  label: 'Metric result',
});

export const Metrics: CollectionConfig = {
  ...BaseMetrics,
  hooks: {
    ...BaseMetrics.hooks,
    beforeValidate: [
      ...(BaseMetrics.hooks?.beforeValidate || []),
      validateMetricRecordCode,
      validateMetricScientificContext,
      protectMetricSnapshot,
    ],
  },
};
