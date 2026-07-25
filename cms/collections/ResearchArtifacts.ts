import type { CollectionConfig } from 'payload';

import {
  adminOnly,
  authenticatedResearchRead,
  authenticatedResearchWrite,
} from '../access/scientificContentAccess';
import {
  captureResearchArtifactChecksum,
  persistResearchArtifactChecksum,
} from '../hooks/researchArtifactChecksum';

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
      defaultValue: 'screenshot',
      index: true,
      options: [
        { label: 'Screenshot', value: 'screenshot' },
        { label: 'Response export', value: 'response-export' },
        { label: 'HTML snapshot', value: 'html-snapshot' },
        { label: 'Citation capture', value: 'citation-capture' },
        { label: 'Source page capture', value: 'source-page-capture' },
        { label: 'Metadata export', value: 'metadata-export' },
        { label: 'Execution log', value: 'execution-log' },
        { label: 'Structured data export', value: 'structured-export' },
        { label: 'Protocol attachment', value: 'protocol-attachment' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'capturedAt',
      type: 'date',
      required: true,
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: 'Exact date and time when the source evidence was captured or exported.',
      },
    },
    {
      name: 'accessLevel',
      type: 'select',
      required: true,
      defaultValue: 'restricted',
      index: true,
      options: [
        { label: 'Restricted research access', value: 'restricted' },
        { label: 'Internal', value: 'internal' },
        { label: 'Embargoed', value: 'embargoed' },
        { label: 'Release candidate', value: 'release-candidate' },
      ],
      admin: {
        description:
          'Artifacts remain authenticated-only. Public release should occur through a reviewed dataset or publication package.',
      },
    },
    {
      name: 'embargoUntil',
      type: 'date',
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
      name: 'experiment',
      type: 'relationship',
      relationTo: 'experiments',
      required: true,
    },
    {
      name: 'promptExecution',
      type: 'relationship',
      relationTo: 'prompt-executions',
      required: true,
      index: true,
    },
    {
      name: 'observation',
      type: 'relationship',
      relationTo: 'observations',
    },
    {
      name: 'evidenceRecords',
      type: 'relationship',
      relationTo: 'evidence',
      hasMany: true,
      admin: {
        description: 'Evidence records supported by this uploaded artifact.',
      },
    },
    {
      name: 'prompt',
      type: 'relationship',
      relationTo: 'prompts',
      required: true,
    },
    {
      name: 'aiSystem',
      type: 'relationship',
      relationTo: 'ai-systems',
      required: true,
    },
    {
      name: 'collectedBy',
      type: 'relationship',
      relationTo: 'researchers',
      required: true,
    },
    {
      name: 'sourceUrl',
      type: 'text',
      admin: {
        description: 'Original interface or source URL represented by the artifact, when applicable.',
      },
    },
    {
      name: 'captureMethod',
      type: 'select',
      required: true,
      defaultValue: 'manual-screenshot',
      options: [
        { label: 'Manual screenshot', value: 'manual-screenshot' },
        { label: 'Browser export', value: 'browser-export' },
        { label: 'API export', value: 'api-export' },
        { label: 'Copy and preserve', value: 'copy-preserve' },
        { label: 'Automated capture', value: 'automated' },
        { label: 'Manual upload', value: 'manual-upload' },
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
          defaultValue: 'desktop',
          options: [
            { label: 'Desktop', value: 'desktop' },
            { label: 'Laptop', value: 'laptop' },
            { label: 'Tablet', value: 'tablet' },
            { label: 'Mobile', value: 'mobile' },
            { label: 'Server or automated environment', value: 'server' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'viewportWidth',
          type: 'number',
          min: 0,
        },
        {
          name: 'viewportHeight',
          type: 'number',
          min: 0,
        },
        {
          name: 'locale',
          type: 'text',
          defaultValue: 'en-US',
        },
        {
          name: 'timezone',
          type: 'text',
          defaultValue: 'Europe/Madrid',
        },
        {
          name: 'location',
          type: 'text',
          defaultValue: 'Barcelona, Spain',
        },
        {
          name: 'interfaceState',
          type: 'textarea',
          localized: true,
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
          options: [
            { label: 'SHA-256', value: 'sha256' },
            { label: 'SHA-512', value: 'sha512' },
            { label: 'Other', value: 'other' },
            { label: 'Not calculated', value: 'none' },
          ],
          admin: {
            readOnly: true,
            description: 'Calculated automatically from the uploaded file bytes.',
          },
        },
        {
          name: 'checksum',
          type: 'text',
          admin: {
            readOnly: true,
            description:
              'Automatic SHA-256 digest of the exact uploaded file. Replacing the file generates a new checksum and resets verification.',
          },
        },
        {
          name: 'contentUnmodified',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'transformationNotes',
          type: 'textarea',
          localized: true,
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
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      localized: true,
    },
  ],
};
