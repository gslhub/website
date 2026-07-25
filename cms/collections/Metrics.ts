import type { CollectionConfig } from 'payload';

import {
  adminOnly,
  authenticatedResearchWrite,
  publishedOrAuthenticatedRead,
} from '../access/scientificContentAccess';

export const Metrics: CollectionConfig = {
  slug: 'metrics',
  access: {
    create: authenticatedResearchWrite,
    read: publishedOrAuthenticatedRead,
    update: authenticatedResearchWrite,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'metricRecordCode',
    group: 'Research Operations',
    defaultColumns: [
      'metricRecordCode',
      'metricCode',
      'numericValue',
      'lifecycleStatus',
      '_status',
    ],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'metricRecordCode',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable metric result identifier, for example GSL-MET-GEO-0001.',
      },
    },
    {
      name: 'lifecycleStatus',
      type: 'select',
      required: true,
      defaultValue: 'planned',
      index: true,
      options: [
        { label: 'Planned', value: 'planned' },
        { label: 'Calculating', value: 'calculating' },
        { label: 'Calculated', value: 'calculated' },
        { label: 'Under review', value: 'under-review' },
        { label: 'Validated', value: 'validated' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'metricCode',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Metric definition code, for example AIR, CR, MCP or RCR.',
      },
    },
    {
      name: 'metricName',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'metricVersion',
      type: 'text',
      required: true,
      defaultValue: '0.1.0',
    },
    {
      name: 'metricCategory',
      type: 'select',
      required: true,
      defaultValue: 'visibility',
      options: [
        { label: 'Visibility', value: 'visibility' },
        { label: 'Citation', value: 'citation' },
        { label: 'Retrieval', value: 'retrieval' },
        { label: 'Consistency', value: 'consistency' },
        { label: 'Semantic coverage', value: 'semantic-coverage' },
        { label: 'Source quality', value: 'source-quality' },
        { label: 'Operational performance', value: 'operational' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'direction',
      type: 'select',
      required: true,
      defaultValue: 'neutral',
      options: [
        { label: 'Higher is better', value: 'higher' },
        { label: 'Lower is better', value: 'lower' },
        { label: 'Neutral or descriptive', value: 'neutral' },
      ],
    },
    {
      name: 'scopeType',
      type: 'select',
      required: true,
      defaultValue: 'experiment',
      index: true,
      options: [
        { label: 'Benchmark', value: 'benchmark' },
        { label: 'Experiment', value: 'experiment' },
        { label: 'AI system', value: 'ai-system' },
        { label: 'Prompt', value: 'prompt' },
        { label: 'Prompt execution', value: 'prompt-execution' },
        { label: 'Observation', value: 'observation' },
        { label: 'Domain', value: 'domain' },
        { label: 'Source', value: 'source' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'scopeLabel',
      type: 'text',
      localized: true,
      admin: {
        description: 'Human-readable label for the population or analytical scope.',
      },
    },
    {
      name: 'calculatedAt',
      type: 'date',
      index: true,
    },
    {
      name: 'periodStart',
      type: 'date',
    },
    {
      name: 'periodEnd',
      type: 'date',
    },
    {
      name: 'valueType',
      type: 'select',
      required: true,
      defaultValue: 'number',
      options: [
        { label: 'Number', value: 'number' },
        { label: 'Boolean', value: 'boolean' },
        { label: 'Text or category', value: 'text' },
      ],
    },
    {
      name: 'numericValue',
      type: 'number',
      index: true,
      admin: {
        description: 'Primary numeric result when the metric produces a number.',
      },
    },
    {
      name: 'booleanValue',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'textValue',
      type: 'text',
      localized: true,
    },
    {
      name: 'unit',
      type: 'select',
      required: true,
      defaultValue: 'proportion',
      options: [
        { label: 'Proportion', value: 'proportion' },
        { label: 'Percentage', value: 'percentage' },
        { label: 'Count', value: 'count' },
        { label: 'Position', value: 'position' },
        { label: 'Score', value: 'score' },
        { label: 'Milliseconds', value: 'milliseconds' },
        { label: 'Boolean', value: 'boolean' },
        { label: 'Category or text', value: 'text' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'precision',
      type: 'number',
      min: 0,
      max: 10,
      defaultValue: 4,
      admin: {
        description: 'Number of decimal places retained for the reported result.',
      },
    },
    {
      name: 'numerator',
      type: 'number',
    },
    {
      name: 'denominator',
      type: 'number',
      min: 0,
    },
    {
      name: 'sampleSize',
      type: 'number',
      min: 0,
    },
    {
      name: 'resultSummary',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'calculationMethod',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: 'Documented procedure used to calculate the metric result.',
      },
    },
    {
      name: 'formulaSnapshot',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Immutable formula or pseudocode used for this metric version.',
      },
    },
    {
      name: 'aggregationMethod',
      type: 'select',
      required: true,
      defaultValue: 'ratio',
      options: [
        { label: 'Ratio', value: 'ratio' },
        { label: 'Mean', value: 'mean' },
        { label: 'Median', value: 'median' },
        { label: 'Sum', value: 'sum' },
        { label: 'Minimum', value: 'minimum' },
        { label: 'Maximum', value: 'maximum' },
        { label: 'Count', value: 'count' },
        { label: 'Binary rule', value: 'binary-rule' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    {
      name: 'missingDataPolicy',
      type: 'select',
      required: true,
      defaultValue: 'exclude',
      options: [
        { label: 'Exclude missing records', value: 'exclude' },
        { label: 'Treat as zero', value: 'zero' },
        { label: 'Treat as negative outcome', value: 'negative-outcome' },
        { label: 'Impute value', value: 'impute' },
        { label: 'Report separately', value: 'report-separately' },
        { label: 'Not applicable', value: 'not-applicable' },
      ],
    },
    {
      name: 'confidenceInterval',
      type: 'group',
      fields: [
        {
          name: 'level',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 95,
        },
        {
          name: 'lowerBound',
          type: 'number',
        },
        {
          name: 'upperBound',
          type: 'number',
        },
        {
          name: 'method',
          type: 'text',
          localized: true,
        },
      ],
    },
    {
      name: 'breakdowns',
      type: 'array',
      fields: [
        {
          name: 'dimension',
          type: 'text',
          required: true,
        },
        {
          name: 'dimensionValue',
          type: 'text',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          localized: true,
        },
        {
          name: 'numericValue',
          type: 'number',
          required: true,
        },
        {
          name: 'sampleSize',
          type: 'number',
          min: 0,
        },
      ],
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
    },
    {
      name: 'benchmark',
      type: 'relationship',
      relationTo: 'benchmarks',
      required: true,
    },
    {
      name: 'experiment',
      type: 'relationship',
      relationTo: 'experiments',
    },
    {
      name: 'prompt',
      type: 'relationship',
      relationTo: 'prompts',
    },
    {
      name: 'aiSystem',
      type: 'relationship',
      relationTo: 'ai-systems',
    },
    {
      name: 'promptExecutions',
      type: 'relationship',
      relationTo: 'prompt-executions',
      hasMany: true,
    },
    {
      name: 'observations',
      type: 'relationship',
      relationTo: 'observations',
      hasMany: true,
    },
    {
      name: 'citations',
      type: 'relationship',
      relationTo: 'citations',
      hasMany: true,
    },
    {
      name: 'evidence',
      type: 'relationship',
      relationTo: 'evidence',
      hasMany: true,
    },
    {
      name: 'datasets',
      type: 'relationship',
      relationTo: 'datasets',
      hasMany: true,
    },
    {
      name: 'software',
      type: 'relationship',
      relationTo: 'software',
      hasMany: true,
    },
    {
      name: 'calculatedBy',
      type: 'relationship',
      relationTo: 'researchers',
      required: true,
    },
    {
      name: 'reproducibility',
      type: 'group',
      fields: [
        {
          name: 'engineVersion',
          type: 'text',
          admin: {
            description: 'Version of the metrics engine, script or analysis workflow.',
          },
        },
        {
          name: 'scriptUrl',
          type: 'text',
        },
        {
          name: 'querySnapshot',
          type: 'textarea',
          admin: {
            description: 'Query, filter or input selection used to construct the analytical sample.',
          },
        },
        {
          name: 'environmentSnapshot',
          type: 'textarea',
          admin: {
            description: 'Runtime, package and environment details required for replication.',
          },
        },
        {
          name: 'inputChecksum',
          type: 'text',
        },
        {
          name: 'outputChecksum',
          type: 'text',
        },
      ],
    },
    {
      name: 'qualityControl',
      type: 'group',
      fields: [
        {
          name: 'reviewStatus',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          options: [
            { label: 'Pending review', value: 'pending' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'Revision required', value: 'revision-required' },
            { label: 'Rejected', value: 'rejected' },
          ],
        },
        {
          name: 'reviewers',
          type: 'relationship',
          relationTo: 'researchers',
          hasMany: true,
        },
        {
          name: 'validationNotes',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'validatedAt',
          type: 'date',
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      localized: true,
    },
  ],
};
