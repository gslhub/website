import type { CollectionConfig } from 'payload';

import {
  adminOnly,
  authenticatedResearchWrite,
  publishedOrAuthenticatedRead,
} from '../access/scientificContentAccess';

export const Citations: CollectionConfig = {
  slug: 'citations',
  access: {
    create: authenticatedResearchWrite,
    read: publishedOrAuthenticatedRead,
    update: authenticatedResearchWrite,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'citationCode',
    group: 'Research Operations',
    defaultColumns: [
      'citationCode',
      'sourceDomain',
      'citationPosition',
      'lifecycleStatus',
      '_status',
    ],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'citationCode',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable citation identifier, for example GSL-CIT-GEO-0001.',
      },
    },
    {
      name: 'lifecycleStatus',
      type: 'select',
      required: true,
      defaultValue: 'captured',
      index: true,
      options: [
        { label: 'Captured', value: 'captured' },
        { label: 'Under review', value: 'under-review' },
        { label: 'Validated', value: 'validated' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'citationType',
      type: 'select',
      required: true,
      defaultValue: 'inline',
      options: [
        { label: 'Inline citation', value: 'inline' },
        { label: 'End reference', value: 'end-reference' },
        { label: 'Source card', value: 'source-card' },
        { label: 'Sources panel item', value: 'sources-panel' },
        { label: 'Linked mention', value: 'linked-mention' },
        { label: 'Unlinked reference', value: 'unlinked-reference' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'citationFunction',
      type: 'select',
      required: true,
      defaultValue: 'support',
      options: [
        { label: 'Supports a claim', value: 'support' },
        { label: 'Provides background', value: 'background' },
        { label: 'Defines a concept', value: 'definition' },
        { label: 'Provides evidence or data', value: 'evidence' },
        { label: 'Supports a recommendation', value: 'recommendation' },
        { label: 'Provides comparison', value: 'comparison' },
        { label: 'Source list only', value: 'source-list' },
        { label: 'Unclear', value: 'unclear' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'citationPosition',
      type: 'number',
      required: true,
      min: 1,
      index: true,
      admin: {
        description: 'Visible citation order within the generated response or sources interface.',
      },
    },
    {
      name: 'capturedAt',
      type: 'date',
      required: true,
      index: true,
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
        description: 'Optional coded observation from which this citation was extracted.',
      },
    },
    {
      name: 'evidence',
      type: 'relationship',
      relationTo: 'evidence',
      hasMany: true,
      admin: {
        description: 'Evidence items that preserve or verify this citation.',
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
      name: 'extractedBy',
      type: 'relationship',
      relationTo: 'researchers',
      required: true,
    },
    {
      name: 'sourceTitle',
      type: 'text',
    },
    {
      name: 'sourceUrl',
      type: 'text',
    },
    {
      name: 'normalizedUrl',
      type: 'text',
      index: true,
      admin: {
        description: 'Canonical or normalized URL used for deduplication and analysis.',
      },
    },
    {
      name: 'sourceDomain',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'sourcePublisher',
      type: 'text',
    },
    {
      name: 'sourceAuthor',
      type: 'text',
    },
    {
      name: 'sourceType',
      type: 'select',
      required: true,
      defaultValue: 'other',
      index: true,
      options: [
        { label: 'Academic or scholarly', value: 'academic' },
        { label: 'Government or official institution', value: 'official' },
        { label: 'Technical documentation', value: 'documentation' },
        { label: 'News or media', value: 'media' },
        { label: 'Corporate website', value: 'corporate' },
        { label: 'Independent blog or publication', value: 'blog' },
        { label: 'Forum or community', value: 'forum' },
        { label: 'Social platform', value: 'social' },
        { label: 'Dataset or repository', value: 'dataset-repository' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'sourceLanguage',
      type: 'text',
      defaultValue: 'en',
      admin: {
        description: 'BCP 47 or ISO language code detected for the cited source.',
      },
    },
    {
      name: 'sourcePublishedAt',
      type: 'date',
    },
    {
      name: 'sourceAccessedAt',
      type: 'date',
    },
    {
      name: 'doi',
      type: 'text',
      index: true,
    },
    {
      name: 'citationContext',
      type: 'group',
      fields: [
        {
          name: 'displayText',
          type: 'textarea',
          admin: {
            description: 'Exact citation label, card text or reference text shown by the system.',
          },
        },
        {
          name: 'anchorText',
          type: 'text',
        },
        {
          name: 'surroundingText',
          type: 'textarea',
          admin: {
            description: 'Preserved response context surrounding the citation.',
          },
        },
        {
          name: 'claimSupported',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'location',
          type: 'select',
          defaultValue: 'body',
          options: [
            { label: 'Response body', value: 'body' },
            { label: 'Opening section', value: 'opening' },
            { label: 'Closing section', value: 'closing' },
            { label: 'List item', value: 'list-item' },
            { label: 'Table', value: 'table' },
            { label: 'End references', value: 'end-references' },
            { label: 'Sources panel', value: 'sources-panel' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'prominence',
          type: 'select',
          defaultValue: 'standard',
          options: [
            { label: 'High', value: 'high' },
            { label: 'Standard', value: 'standard' },
            { label: 'Low', value: 'low' },
          ],
        },
      ],
    },
    {
      name: 'targetCoding',
      type: 'group',
      fields: [
        {
          name: 'targetType',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'No specific target', value: 'none' },
            { label: 'Domain', value: 'domain' },
            { label: 'URL', value: 'url' },
            { label: 'Organization', value: 'organization' },
            { label: 'Person', value: 'person' },
            { label: 'Product or service', value: 'product-service' },
            { label: 'Topic or concept', value: 'topic' },
          ],
        },
        {
          name: 'targetValue',
          type: 'text',
        },
        {
          name: 'isEvaluatedTarget',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'targetMatchType',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'No match', value: 'none' },
            { label: 'Exact match', value: 'exact' },
            { label: 'Domain match', value: 'domain' },
            { label: 'Entity match', value: 'entity' },
            { label: 'Semantic match', value: 'semantic' },
            { label: 'Unclear', value: 'unclear' },
          ],
        },
      ],
    },
    {
      name: 'verification',
      type: 'group',
      fields: [
        {
          name: 'urlResolved',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'httpStatus',
          type: 'number',
          min: 100,
          max: 599,
        },
        {
          name: 'finalUrl',
          type: 'text',
        },
        {
          name: 'contentAvailable',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'titleMatches',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'supportsClaim',
          type: 'select',
          defaultValue: 'not-assessed',
          options: [
            { label: 'Not assessed', value: 'not-assessed' },
            { label: 'Yes', value: 'yes' },
            { label: 'Partially', value: 'partial' },
            { label: 'No', value: 'no' },
            { label: 'Unclear', value: 'unclear' },
          ],
        },
        {
          name: 'isPrimarySource',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'isOfficialSource',
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
      name: 'integrity',
      type: 'group',
      fields: [
        {
          name: 'rawCitationText',
          type: 'textarea',
          admin: {
            description: 'Exact raw citation representation preserved before normalization.',
          },
        },
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
        },
        {
          name: 'checksum',
          type: 'text',
        },
        {
          name: 'normalizationNotes',
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
          name: 'codingConfidence',
          type: 'select',
          defaultValue: 'medium',
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
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
