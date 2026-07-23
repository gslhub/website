import type { CollectionConfig } from 'payload';

import {
  adminOnly,
  authenticatedResearchWrite,
  publishedOrAuthenticatedRead,
} from '../access/scientificContentAccess';

export const Resources: CollectionConfig = {
  slug: 'resources',
  access: {
    create: authenticatedResearchWrite,
    read: publishedOrAuthenticatedRead,
    update: authenticatedResearchWrite,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Outputs',
    defaultColumns: ['title', 'resourceType', 'lifecycleStatus', 'version', '_status'],
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
      name: 'resourceType',
      type: 'select',
      required: true,
      defaultValue: 'protocol',
      options: [
        { label: 'Research protocol', value: 'protocol' },
        { label: 'Methodology guide', value: 'methodology-guide' },
        { label: 'Template', value: 'template' },
        { label: 'Checklist', value: 'checklist' },
        { label: 'Prompt library', value: 'prompt-library' },
        { label: 'Bibliography', value: 'bibliography' },
        { label: 'Technical documentation', value: 'technical-documentation' },
        { label: 'Learning resource', value: 'learning-resource' },
        { label: 'External resource', value: 'external-resource' },
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
        { label: 'In development', value: 'in-development' },
        { label: 'Available', value: 'available' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'version',
      type: 'text',
      defaultValue: '0.1.0',
    },
    {
      name: 'content',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Main resource content, instructions or structured description.',
      },
    },
    {
      name: 'externalUrl',
      type: 'text',
      admin: {
        description: 'Canonical public URL when the resource is hosted externally.',
      },
    },
    {
      name: 'repositoryUrl',
      type: 'text',
      admin: {
        description: 'Repository or version-controlled source for the resource.',
      },
    },
    {
      name: 'publicationDate',
      type: 'date',
      index: true,
    },
    {
      name: 'license',
      type: 'text',
      admin: {
        description: 'Resource license after it has been formally selected.',
      },
    },
    {
      name: 'authors',
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
      name: 'benchmarks',
      type: 'relationship',
      relationTo: 'benchmarks',
      hasMany: true,
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
      name: 'openAccess',
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
