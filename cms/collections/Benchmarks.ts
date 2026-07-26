import type { CollectionConfig } from 'payload';

import {
  adminOnly,
  authenticatedResearchWrite,
  publishedOrAuthenticatedRead,
} from '../access/scientificContentAccess';

export const Benchmarks: CollectionConfig = {
  slug: 'benchmarks',
  access: {
    create: authenticatedResearchWrite,
    read: publishedOrAuthenticatedRead,
    update: authenticatedResearchWrite,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Research',
    defaultColumns: ['title', 'benchmarkCode', 'lifecycleStatus', 'version', '_status'],
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
      name: 'summary',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'benchmarkCode',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable benchmark identifier, for example GSL-BENCH-GEO-01.',
      },
    },
    {
      name: 'benchmarkType',
      type: 'select',
      required: true,
      defaultValue: 'visibility',
      options: [
        { label: 'Visibility', value: 'visibility' },
        { label: 'Citation', value: 'citation' },
        { label: 'Retrieval', value: 'retrieval' },
        { label: 'Consistency', value: 'consistency' },
        { label: 'Multilingual', value: 'multilingual' },
        { label: 'Mixed', value: 'mixed' },
      ],
    },
    {
      name: 'lifecycleStatus',
      type: 'select',
      required: true,
      defaultValue: 'planned',
      index: true,
      options: [
        { label: 'Planned', value: 'planned' },
        { label: 'Pilot', value: 'pilot' },
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'version',
      type: 'text',
      required: true,
      defaultValue: '0.1.0',
    },
    {
      name: 'scope',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'protocol',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'systems',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'provider',
          type: 'text',
        },
        {
          name: 'accessMode',
          type: 'select',
          defaultValue: 'web',
          options: [
            { label: 'Web interface', value: 'web' },
            { label: 'API', value: 'api' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'modelVersion',
          type: 'text',
        },
        {
          name: 'notes',
          type: 'textarea',
          localized: true,
        },
      ],
    },
    {
      name: 'metrics',
      type: 'array',
      minRows: 1,
      admin: {
        description:
          'Legacy human-readable metric summary retained for compatibility. Versioned scientific methodology lives in Metric Definitions.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'code',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'direction',
          type: 'select',
          defaultValue: 'neutral',
          options: [
            { label: 'Higher is better', value: 'higher' },
            { label: 'Lower is better', value: 'lower' },
            { label: 'Neutral or descriptive', value: 'neutral' },
          ],
        },
      ],
    },
    {
      name: 'metricDefinitions',
      type: 'relationship',
      relationTo: 'metric-definitions',
      hasMany: true,
      admin: {
        description:
          'Versioned AIR, CR, MCP, RCR or future metric definitions formally approved for this benchmark version.',
      },
    },
    {
      name: 'startDate',
      type: 'date',
    },
    {
      name: 'lastRunDate',
      type: 'date',
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
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
      name: 'researchAreas',
      type: 'relationship',
      relationTo: 'research-areas',
      hasMany: true,
      required: true,
    },
    {
      name: 'software',
      type: 'relationship',
      relationTo: 'software',
      hasMany: true,
    },
    {
      name: 'datasets',
      type: 'relationship',
      relationTo: 'datasets',
      hasMany: true,
    },
    {
      name: 'publications',
      type: 'relationship',
      relationTo: 'publications',
      hasMany: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
};
