import type { CollectionConfig } from 'payload';

import {
  adminOnly,
  authenticatedResearchRead,
  authenticatedResearchWrite,
} from '../access/scientificContentAccess';
import { inheritResearchArtifactExecutionContext } from '../hooks/inheritResearchArtifactExecutionContext';
import {
  captureResearchArtifactChecksum,
  persistResearchArtifactChecksum,
} from '../hooks/researchArtifactChecksum';
import { createScientificRecordCodeValidator } from '../hooks/validateScientificRecordCode';

const validateArtifactCode = createScientificRecordCodeValidator({
  field: 'artifactCode',
  token: 'ART',
  label: 'Research artifact',
});

export const ResearchArtifacts: CollectionConfig = {
  slug: 'research-artifacts',
  access: {
    create: authenticatedResearchWrite,
    read: authenticatedResearchRead,
    update: authenticatedResearchWrite,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'artifactCode',
    group: 'Research Operations',
    defaultColumns: [
      'artifactCode',
      'artifactType',
      'capturedAt',
      'accessLevel',
      'filename',
    ],
    description:
      'Private uploaded files that preserve experimental evidence and research provenance.',
  },
  hooks: {
    beforeOperation: [captureResearchArtifactChecksum],
    beforeValidate: [
      validateArtifactCode,
      inheritResearchArtifactExecutionContext,
    ],
    beforeChange: [persistResearchArtifactChecksum],
  },
  upload: {
    staticDir: 'research-artifacts',
    mimeTypes: [
      'image/png',
      'image/jpeg',
      'image/webp',
      'application/pdf',
      'application/json',
      'application/ld+json',
      'application/zip',
      'text/plain',
      'text/html',
      'text/csv',
    ],
  },
  fields: [
    {
      name: 'artifactCode',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable artifact identifier, for example GSL-ART-GEO-0001.',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'artifactType',
      type: 'select',
      required: true,
      defaultValue: 'response-export',
      options: [
        { label: 'Screenshot', value: 'screenshot' },
        { label: 'Response export', value: 'response-export' },
        { label: 'HTML snapshot', value: 'html-snapshot' },
        { label: 'JSON export', value: 'json-export' },
        { label: 'CSV export', value: 'csv-export' },
        { label: 'PDF document', value: 'pdf' },
        { label: 'System or execution log', value: 'log' },
        { label: 'Source page capture', value: 'source-page-capture' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'capturedAt',
      type: 'date',
      required: true,
      index: true,
    },
    {
      name: 'accessLevel',
      type: 'select',
      required: true,
      defaultValue: 'restricted',
      options: [
        { label: 'Restricted research access', value: 'restricted' },
        { label: 'Internal research access', value: 'internal' },
        { label: 'Embargoed', value: 'embargoed' },
        { label: 'Public', value: 'public' },
      ],
    },
    {
      name: 'promptExecution',
      type: 'relationship',
      relationTo: 'prompt-executions',
      required: true,
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'benchmark',
      type: 'relationship',
      relationTo: 'benchmarks',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'experiment',
      type: 'relationship',
      relationTo: 'experiments',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'prompt',
      type: 'relationship',
      relationTo: 'prompts',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'aiSystem',
      type: 'relationship',
      relationTo: 'ai-systems',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'collectedBy',
      type: 'relationship',
      relationTo: 'researchers',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'captureMethod',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [
        { label: 'Manual upload', value: 'manual' },
        { label: 'Browser export', value: 'browser-export' },
        { label: 'API response', value: 'api' },
        { label: 'Automated capture', value: 'automated' },
        { label: 'Imported from archive', value: 'imported' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'captureEnvironment',
      type: 'group',
      fields: [
        {
          name: 'browserName',
          type: 'text',
        },
        {
          name: 'browserVersion',
          type: 'text',
        },
        {
          name: 'deviceType',
          type: 'select',
          options: [
            { label: 'Desktop', value: 'desktop' },
            { label: 'Mobile', value: 'mobile' },
            { label: 'Tablet', value: 'tablet' },
            { label: 'Server', value: 'server' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'viewport',
          type: 'text',
        },
        {
          name: 'locale',
          type: 'text',
        },
        {
          name: 'timezone',
          type: 'text',
        },
        {
          name: 'location',
          type: 'text',
        },
        {
          name: 'interfaceState',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'integrity',
      type: 'group',
      fields: [
        {
          name: 'checksumAlgorithm',
          type: 'select',
          defaultValue: 'sha256',
          admin: {
            readOnly: true,
          },
          options: [
            { label: 'SHA-256', value: 'sha256' },
          ],
        },
        {
          name: 'checksum',
          type: 'text',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'contentUnmodified',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'verified',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'verifiedAt',
          type: 'date',
        },
        {
          name: 'verifiedBy',
          type: 'relationship',
          relationTo: 'researchers',
          hasMany: true,
        },
        {
          name: 'verificationNotes',
          type: 'textarea',
          localized: true,
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
