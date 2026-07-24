import type { CollectionConfig } from 'payload';

import {
  adminOnly,
  authenticatedResearchWrite,
  publishedOrAuthenticatedRead,
} from '../access/scientificContentAccess';

export const Experiments: CollectionConfig = {
  slug: 'experiments',
  access: {
    create: authenticatedResearchWrite,
    read: publishedOrAuthenticatedRead,
    update: authenticatedResearchWrite,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Research Operations',
    defaultColumns: ['title', 'experimentCode', 'lifecycleStatus', 'version', '_status'],
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
      name: 'experimentCode',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable experiment identifier, for example GSL-EXP-GEO-001.',
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'experimentType',
      type: 'select',
      required: true,
      defaultValue: 'controlled',
      options: [
        { label: 'Exploratory', value: 'exploratory' },
        { label: 'Controlled', value: 'controlled' },
        { label: 'Comparative', value: 'comparative' },
        { label: 'Observational', value: 'observational' },
        { label: 'Longitudinal', value: 'longitudinal' },
        { label: 'Replication', value: 'replication' },
        { label: 'Validation', value: 'validation' },
        { label: 'Pilot', value: 'pilot' },
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
        { label: 'Ready', value: 'ready' },
        { label: 'Running', value: 'running' },
        { label: 'Paused', value: 'paused' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
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
      name: 'researchQuestion',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'hypothesis',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'objective',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'protocol',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: 'Versioned operational procedure used to execute the experiment.',
      },
    },
    {
      name: 'samplingStrategy',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'inclusionCriteria',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'exclusionCriteria',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'independentVariables',
      type: 'array',
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
          name: 'operationalDefinition',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'dataType',
          type: 'select',
          defaultValue: 'categorical',
          options: [
            { label: 'Categorical', value: 'categorical' },
            { label: 'Ordinal', value: 'ordinal' },
            { label: 'Integer', value: 'integer' },
            { label: 'Decimal', value: 'decimal' },
            { label: 'Boolean', value: 'boolean' },
            { label: 'Text', value: 'text' },
            { label: 'Date or time', value: 'datetime' },
          ],
        },
        {
          name: 'plannedValues',
          type: 'textarea',
          localized: true,
        },
      ],
    },
    {
      name: 'dependentVariables',
      type: 'array',
      minRows: 1,
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
          name: 'operationalDefinition',
          type: 'textarea',
          required: true,
          localized: true,
        },
        {
          name: 'dataType',
          type: 'select',
          required: true,
          defaultValue: 'decimal',
          options: [
            { label: 'Categorical', value: 'categorical' },
            { label: 'Ordinal', value: 'ordinal' },
            { label: 'Integer', value: 'integer' },
            { label: 'Decimal', value: 'decimal' },
            { label: 'Boolean', value: 'boolean' },
            { label: 'Text', value: 'text' },
            { label: 'Date or time', value: 'datetime' },
          ],
        },
        {
          name: 'unit',
          type: 'text',
        },
      ],
    },
    {
      name: 'controlVariables',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'controlledValue',
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
      name: 'plannedRepetitions',
      type: 'number',
      required: true,
      defaultValue: 1,
      min: 1,
    },
    {
      name: 'startDate',
      type: 'date',
      index: true,
    },
    {
      name: 'endDate',
      type: 'date',
    },
    {
      name: 'preregistrationUrl',
      type: 'text',
      admin: {
        description: 'Optional public preregistration or protocol registration URL.',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      localized: true,
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
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
};
