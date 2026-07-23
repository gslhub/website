import type { CollectionConfig } from 'payload';

import {
  adminOnly,
  authenticatedResearchWrite,
  publishedOrAuthenticatedRead,
} from '../access/scientificContentAccess';
import { datasetStatusField } from '../fields/datasetStatus';

export const Datasets: CollectionConfig = {
  slug: 'datasets',
  access: {
    create: authenticatedResearchWrite,
    read: publishedOrAuthenticatedRead,
    update: authenticatedResearchWrite,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Outputs',
    defaultColumns: ['title', 'datasetType', 'lifecycleStatus', 'version', '_status'],
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
      name: 'methodology',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'datasetType',
      type: 'select',
      required: true,
      defaultValue: 'benchmark-results',
      options: [
        { label: 'Benchmark results', value: 'benchmark-results' },
        { label: 'Prompt set', value: 'prompt-set' },
        { label: 'Evaluation data', value: 'evaluation-data' },
        { label: 'Source observations', value: 'source-observations' },
        { label: 'Metadata', value: 'metadata' },
        { label: 'Mixed dataset', value: 'mixed' },
      ],
    },
    datasetStatusField,
    {
      name: 'version',
      type: 'text',
      required: true,
      defaultValue: '0.1.0',
    },
    {
      name: 'releaseDate',
      type: 'date',
      index: true,
    },
    {
      name: 'dataAvailability',
      type: 'select',
      required: true,
      defaultValue: 'planned-public',
      options: [
        { label: 'Private collection', value: 'private' },
        { label: 'Public release planned', value: 'planned-public' },
        { label: 'Public dataset available', value: 'public' },
        { label: 'Restricted access', value: 'restricted' },
      ],
    },
    {
      name: 'doi',
      type: 'text',
      index: true,
      admin: {
        description: 'DOI without the https://doi.org/ prefix.',
      },
    },
    {
      name: 'repositoryUrl',
      type: 'text',
      admin: {
        description: 'Public repository or archival record when available.',
      },
    },
    {
      name: 'documentationUrl',
      type: 'text',
    },
    {
      name: 'license',
      type: 'text',
      admin: {
        description: 'Data license after it has been formally selected.',
      },
    },
    {
      name: 'formats',
      type: 'array',
      fields: [
        {
          name: 'format',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'recordCount',
      type: 'number',
      min: 0,
      admin: {
        description: 'Approximate or final number of records.',
      },
    },
    {
      name: 'researchers',
      type: 'relationship',
      relationTo: 'researchers',
      hasMany: true,
      required: true,
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
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
      name: 'publications',
      type: 'relationship',
      relationTo: 'publications',
      hasMany: true,
    },
    {
      name: 'openData',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
};
