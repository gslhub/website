import type { CollectionConfig } from 'payload';

import {
  adminOnly,
  authenticatedResearchWrite,
  publishedOrAuthenticatedRead,
} from '../access/scientificContentAccess';

export const Software: CollectionConfig = {
  slug: 'software',
  access: {
    create: authenticatedResearchWrite,
    read: publishedOrAuthenticatedRead,
    update: authenticatedResearchWrite,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Outputs',
    defaultColumns: ['title', 'softwareType', 'releaseStatus', 'version', '_status'],
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
      name: 'technicalDescription',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'softwareType',
      type: 'select',
      required: true,
      defaultValue: 'research-tool',
      options: [
        { label: 'Research tool', value: 'research-tool' },
        { label: 'Benchmark suite', value: 'benchmark-suite' },
        { label: 'Web application', value: 'web-application' },
        { label: 'API', value: 'api' },
        { label: 'Command-line tool', value: 'cli' },
        { label: 'Library', value: 'library' },
        { label: 'Plugin', value: 'plugin' },
        { label: 'Data collection tool', value: 'data-collection-tool' },
      ],
    },
    {
      name: 'releaseStatus',
      type: 'select',
      required: true,
      defaultValue: 'planned',
      index: true,
      options: [
        { label: 'Planned', value: 'planned' },
        { label: 'Alpha', value: 'alpha' },
        { label: 'Beta', value: 'beta' },
        { label: 'Stable', value: 'stable' },
        { label: 'Maintenance', value: 'maintenance' },
        { label: 'Deprecated', value: 'deprecated' },
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
      name: 'releaseDate',
      type: 'date',
      index: true,
    },
    {
      name: 'repositoryUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'Public source-code repository URL.',
      },
    },
    {
      name: 'documentationUrl',
      type: 'text',
    },
    {
      name: 'packageUrl',
      type: 'text',
      admin: {
        description: 'Optional package registry or release URL.',
      },
    },
    {
      name: 'license',
      type: 'text',
      required: true,
      defaultValue: 'MIT',
    },
    {
      name: 'programmingLanguages',
      type: 'array',
      fields: [
        {
          name: 'language',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'technologies',
      type: 'array',
      fields: [
        {
          name: 'technology',
          type: 'text',
          required: true,
        },
      ],
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
    },
    {
      name: 'publications',
      type: 'relationship',
      relationTo: 'publications',
      hasMany: true,
    },
    {
      name: 'openSource',
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
