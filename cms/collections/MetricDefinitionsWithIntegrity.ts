import type { CollectionBeforeValidateHook, CollectionConfig, Field } from 'payload';

import {
  detachMetricDefinitionBeforeDelete,
  syncBenchmarkMetricDefinitionsAfterChange,
} from '../hooks/syncBenchmarkMetricDefinitions';
import { protectMetricDefinition } from '../hooks/protectMetricDefinition';
import { assertDevelopmentMode } from '../research/researchEnvironment';
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

const developmentResetAwareProtection: CollectionBeforeValidateHook = async (args) => {
  const context = args.req.context as Record<string, unknown> | undefined;

  if (context?.developmentReset === true) {
    const user = args.req.user as { role?: unknown } | null | undefined;
    if (!user || user.role !== 'admin') {
      throw new Error('Only an administrator can use the controlled development reset bypass.');
    }

    await assertDevelopmentMode({ payload: args.req.payload, req: args.req });
    return args.data;
  }

  return protectMetricDefinition(args);
};

export const MetricDefinitions: CollectionConfig = {
  ...BaseMetricDefinitions,
  fields: [...BaseMetricDefinitions.fields, technicalReviewField],
  hooks: {
    ...BaseMetricDefinitions.hooks,
    beforeValidate: [developmentResetAwareProtection],
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
