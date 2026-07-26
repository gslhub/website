import type { CollectionConfig } from 'payload';

import {
  adminOnly,
  authenticatedResearchWrite,
  publishedOrAuthenticatedRead,
} from '../access/scientificContentAccess';
import { protectMetricDefinition } from '../hooks/protectMetricDefinition';

export const MetricDefinitions: CollectionConfig = {
  slug: 'metric-definitions',
  access: {
    create: authenticatedResearchWrite,
    read: publishedOrAuthenticatedRead,
    update: authenticatedResearchWrite,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Research Operations',
    defaultColumns: [
      'title',
      'metricCode',
      'version',
      'lifecycleStatus',
      '_status',
    ],
    description:
      'Versioned scientific definitions for metrics. Calculated values remain separate Metric Result records.',
  },
  hooks: {
    beforeValidate: [protectMetricDefinition],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'definitionCode',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Stable definition identifier, for example GSL-MDEF-AIR-0001.',
      },
    },
    {
      name: 'metricCode',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Short scientific code such as AIR, CR, MCP or RCR.',
      },
    },
    {
      name: 'version',
      type: 'text',
      required: true,
      defaultValue: '0.1.0',
      index: true,
      admin: {
        description: 'Semantic version of this exact metric definition.',
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
        { label: 'Under review', value: 'under-review' },
        { label: 'Validated', value: 'validated' },
        { label: 'Active', value: 'active' },
        { label: 'Deprecated', value: 'deprecated' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'visibility',
      options: [
        { label: 'Visibility', value: 'visibility' },
        { label: 'Citation', value: 'citation' },
        { label: 'Retrieval', value: 'retrieval' },
        { label: 'Position', value: 'position' },
        { label: 'Consistency', value: 'consistency' },
        { label: 'Semantic coverage', value: 'semantic-coverage' },
        { label: 'Freshness', value: 'freshness' },
        { label: 'Authority', value: 'authority' },
        { label: 'Quality', value: 'quality' },
        { label: 'Operational', value: 'operational' },
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
      name: 'unitOfAnalysis',
      type: 'select',
      required: true,
      defaultValue: 'experiment',
      options: [
        { label: 'Benchmark', value: 'benchmark' },
        { label: 'Experiment', value: 'experiment' },
        { label: 'AI system', value: 'ai-system' },
        { label: 'Prompt', value: 'prompt' },
        { label: 'Prompt execution', value: 'prompt-execution' },
        { label: 'Observation', value: 'observation' },
        { label: 'Citation', value: 'citation' },
        { label: 'Domain', value: 'domain' },
        { label: 'Source', value: 'source' },
        { label: 'Other', value: 'other' },
      ],
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
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: 'What the metric measures and why it is scientifically useful.',
      },
    },
    {
      name: 'interpretation',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: 'How values should and should not be interpreted.',
      },
    },
    {
      name: 'formula',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Canonical mathematical formula for this version.',
      },
    },
    {
      name: 'pseudocode',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: 'Implementation-neutral calculation procedure.',
      },
    },
    {
      name: 'numeratorDefinition',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'denominatorDefinition',
      type: 'textarea',
      localized: true,
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
      name: 'roundingPrecision',
      type: 'number',
      required: true,
      min: 0,
      max: 10,
      defaultValue: 4,
      admin: {
        description: 'Decimal places retained in reported results.',
      },
    },
    {
      name: 'validRange',
      type: 'group',
      fields: [
        {
          name: 'minimum',
          type: 'number',
        },
        {
          name: 'maximum',
          type: 'number',
        },
        {
          name: 'minimumInclusive',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'maximumInclusive',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'requiredInputs',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'sourceCollection',
          type: 'select',
          required: true,
          options: [
            { label: 'Prompt Executions', value: 'prompt-executions' },
            { label: 'Observations', value: 'observations' },
            { label: 'Citations', value: 'citations' },
            { label: 'Evidence', value: 'evidence' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'fieldName',
          type: 'text',
          required: true,
        },
        {
          name: 'required',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
        },
      ],
    },
    {
      name: 'assumptions',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'limitations',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'validationProcedure',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'validatedAt',
      type: 'date',
      index: true,
    },
    {
      name: 'validatedBy',
      type: 'relationship',
      relationTo: 'researchers',
      hasMany: true,
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
    },
    {
      name: 'benchmarks',
      type: 'relationship',
      relationTo: 'benchmarks',
      hasMany: true,
      required: true,
    },
    {
      name: 'researchAreas',
      type: 'relationship',
      relationTo: 'research-areas',
      hasMany: true,
      required: true,
    },
    {
      name: 'researchers',
      type: 'relationship',
      relationTo: 'researchers',
      hasMany: true,
      required: true,
    },
    {
      name: 'resources',
      type: 'relationship',
      relationTo: 'resources',
      hasMany: true,
    },
    {
      name: 'publications',
      type: 'relationship',
      relationTo: 'publications',
      hasMany: true,
    },
    {
      name: 'software',
      type: 'relationship',
      relationTo: 'software',
      hasMany: true,
    },
    {
      name: 'openMethodology',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
};
