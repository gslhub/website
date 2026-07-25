import type { CollectionConfig } from 'payload';

import {
  adminOnly,
  authenticatedResearchWrite,
  publishedOrAuthenticatedRead,
} from '../access/scientificContentAccess';

export const Evidence: CollectionConfig = {
  slug: 'evidence',
  access: {
    create: authenticatedResearchWrite,
    read: publishedOrAuthenticatedRead,
    update: authenticatedResearchWrite,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'evidenceCode',
    group: 'Research Operations',
    defaultColumns: ['evidenceCode', 'evidenceType', 'lifecycleStatus', 'capturedAt', '_status'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'evidenceCode',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable evidence identifier, for example GSL-EVD-GEO-0001.',
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
      name: 'evidenceType',
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
        { label: 'Metadata record', value: 'metadata-record' },
        { label: 'System or execution log', value: 'log' },
        { label: 'Structured data export', value: 'structured-export' },
        { label: 'Manual research note', value: 'manual-note' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'lifecycleStatus',
      type: 'select',
      required: true,
      defaultValue: 'captured',
      index: true,
      options: [
        { label: 'Captured', value: 'captured' },
        { label: 'Processing', value: 'processing' },
        { label: 'Under review', value: 'under-review' },
        { label: 'Validated', value: 'validated' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'capturedAt',
      type: 'date',
      required: true,
      index: true,
      admin: {
        description: 'Exact date and time when the evidence was captured or exported.',
      },
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
      admin: {
        description: 'Optional coded observation supported by this evidence item.',
      },
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
      name: 'artifact',
      type: 'group',
      fields: [
        {
          name: 'artifactUrl',
          type: 'text',
          admin: {
            description: 'Versioned storage location for the captured evidence artifact.',
          },
        },
        {
          name: 'originalUrl',
          type: 'text',
          admin: {
            description: 'Original source or interface URL visible at capture time.',
          },
        },
        {
          name: 'fileName',
          type: 'text',
        },
        {
          name: 'mimeType',
          type: 'text',
        },
        {
          name: 'fileSizeBytes',
          type: 'number',
          min: 0,
        },
        {
          name: 'storageProvider',
          type: 'select',
          defaultValue: 'private-archive',
          options: [
            { label: 'Private research archive', value: 'private-archive' },
            { label: 'Git repository', value: 'git-repository' },
            { label: 'Object storage', value: 'object-storage' },
            { label: 'Public data repository', value: 'public-repository' },
            { label: 'External web archive', value: 'web-archive' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'accessLevel',
          type: 'select',
          required: true,
          defaultValue: 'restricted',
          options: [
            { label: 'Restricted research access', value: 'restricted' },
            { label: 'Internal', value: 'internal' },
            { label: 'Embargoed', value: 'embargoed' },
            { label: 'Public', value: 'public' },
          ],
        },
        {
          name: 'embargoUntil',
          type: 'date',
        },
      ],
    },
    {
      name: 'captureContext',
      type: 'group',
      fields: [
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
            { label: 'Web archive capture', value: 'web-archive' },
            { label: 'Manual research note', value: 'manual-note' },
            { label: 'Other', value: 'other' },
          ],
        },
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
          admin: {
            description: 'Visible interface state, open panels and relevant controls at capture time.',
          },
        },
      ],
    },
    {
      name: 'preservedContent',
      type: 'group',
      fields: [
        {
          name: 'textSnapshot',
          type: 'textarea',
          admin: {
            description: 'Exact text represented by the evidence item when applicable.',
          },
        },
        {
          name: 'metadataSnapshot',
          type: 'textarea',
          admin: {
            description: 'Raw or structured metadata preserved alongside the artifact.',
          },
        },
        {
          name: 'visibleElements',
          type: 'array',
          fields: [
            {
              name: 'elementType',
              type: 'select',
              required: true,
              options: [
                { label: 'Prompt', value: 'prompt' },
                { label: 'Response', value: 'response' },
                { label: 'Citation', value: 'citation' },
                { label: 'Source link', value: 'source-link' },
                { label: 'Sources panel', value: 'sources-panel' },
                { label: 'Model or system label', value: 'system-label' },
                { label: 'Date or time', value: 'date-time' },
                { label: 'Interface control', value: 'interface-control' },
                { label: 'Other', value: 'other' },
              ],
            },
            {
              name: 'label',
              type: 'text',
              localized: true,
            },
            {
              name: 'position',
              type: 'number',
              min: 1,
            },
            {
              name: 'notes',
              type: 'textarea',
              localized: true,
            },
          ],
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
            { label: 'MD5 (legacy identification only)', value: 'md5' },
            { label: 'Other', value: 'other' },
            { label: 'Not calculated', value: 'none' },
          ],
        },
        {
          name: 'checksum',
          type: 'text',
          admin: {
            description: 'Checksum calculated from the preserved artifact bytes.',
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
          admin: {
            description: 'Cropping, redaction, format conversion or other transformations.',
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
      name: 'chainOfCustody',
      type: 'array',
      fields: [
        {
          name: 'eventType',
          type: 'select',
          required: true,
          options: [
            { label: 'Captured', value: 'captured' },
            { label: 'Imported', value: 'imported' },
            { label: 'Hashed', value: 'hashed' },
            { label: 'Verified', value: 'verified' },
            { label: 'Transformed', value: 'transformed' },
            { label: 'Redacted', value: 'redacted' },
            { label: 'Exported', value: 'exported' },
            { label: 'Published', value: 'published' },
            { label: 'Archived', value: 'archived' },
          ],
        },
        {
          name: 'eventAt',
          type: 'date',
          required: true,
        },
        {
          name: 'actor',
          type: 'relationship',
          relationTo: 'researchers',
        },
        {
          name: 'notes',
          type: 'textarea',
          localized: true,
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
      name: 'ethicalAndLegalNotes',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Redaction, privacy, copyright, consent or terms-of-service considerations.',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      localized: true,
    },
  ],
};
