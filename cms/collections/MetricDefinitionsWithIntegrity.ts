import type { CollectionConfig, Field } from 'payload';

import {
  detachMetricDefinitionBeforeDelete,
  syncBenchmarkMetricDefinitionsAfterChange,
} from '../hooks/syncBenchmarkMetricDefinitions';
import { MetricDefinitions as BaseMetricDefinitions } from './MetricDefinitions';

const technicalReviewField: Field = {
  name: 'technicalReview',
  type: 'group',
  label: 'Technical Review',
  admin: {
    description:
      'Documents author self-review, deterministic calculator verification and later independent review without using the formal Validated At / Validated By fields prematurely.',
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Revision required', value: 'revision-required' },
      ],
    },
    {
      name: 'reviewMode',
      type: 'select',
      defaultValue: 'author-self-review',
      options: [
        { label: 'Author self-review', value: 'author-self-review' },
        { label: 'Independent review', value: 'independent-review' },
        { label: 'Mixed review', value: 'mixed-review' },
      ],
    },
    {
      name: 'reviewedAt',
      type: 'date',
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'researchers',
      hasMany: true,
    },
    {
      name: 'deterministicValidationStatus',
      type: 'select',
      defaultValue: 'not-run',
      options: [
        { label: 'Not run', value: 'not-run' },
        { label: 'Passed', value: 'passed' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'independentReviewStatus',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Revision required', value: 'revision-required' },
      ],
    },
    {
      name: 'independentReviewedAt',
      type: 'date',
    },
    {
      name: 'independentReviewedBy',
      type: 'relationship',
      relationTo: 'researchers',
      hasMany: true,
    },
    {
      name: 'notes',
      type: 'textarea',
      localized: true,
      admin: {
        description:
          'Describe the tests performed, expected and observed values, remaining limitations and the pending independent-review requirement.',
      },
    },
  ],
};

export const MetricDefinitions: CollectionConfig = {
  ...BaseMetricDefinitions,
  fields: [...BaseMetricDefinitions.fields, technicalReviewField],
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
