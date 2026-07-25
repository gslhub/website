import type { CollectionConfig } from 'payload';

import {
  adminOnly,
  authenticatedResearchWrite,
  publishedOrAuthenticatedRead,
} from '../access/scientificContentAccess';

export const Observations: CollectionConfig = {
  slug: 'observations',
  access: {
    create: authenticatedResearchWrite,
    read: publishedOrAuthenticatedRead,
    update: authenticatedResearchWrite,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'observationCode',
    group: 'Research Operations',
    defaultColumns: [
      'observationCode',
      'lifecycleStatus',
      'observationType',
      'codedAt',
      '_status',
    ],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'observationCode',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable observation identifier, for example GSL-OBS-GEO-0001.',
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
        { label: 'Coding', value: 'coding' },
        { label: 'Coded', value: 'coded' },
        { label: 'Under review', value: 'under-review' },
        { label: 'Validated', value: 'validated' },
        { label: 'Excluded', value: 'excluded' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'observationType',
      type: 'select',
      required: true,
      defaultValue: 'response-level',
      options: [
        { label: 'Response-level observation', value: 'response-level' },
        { label: 'Execution quality observation', value: 'execution-quality' },
        { label: 'Comparative observation', value: 'comparative' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'codedAt',
      type: 'date',
      index: true,
      admin: {
        description: 'Date and time at which scientific coding was completed.',
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
      name: 'codedBy',
      type: 'relationship',
      relationTo: 'researchers',
      required: true,
    },
    {
      name: 'responseAssessment',
      type: 'group',
      fields: [
        {
          name: 'relevanceLevel',
          type: 'select',
          required: true,
          defaultValue: 'high',
          options: [
            { label: 'High', value: 'high' },
            { label: 'Medium', value: 'medium' },
            { label: 'Low', value: 'low' },
            { label: 'Not relevant', value: 'none' },
          ],
        },
        {
          name: 'completeness',
          type: 'select',
          required: true,
          defaultValue: 'complete',
          options: [
            { label: 'Complete', value: 'complete' },
            { label: 'Partial', value: 'partial' },
            { label: 'Minimal', value: 'minimal' },
            { label: 'Empty', value: 'empty' },
          ],
        },
        {
          name: 'refusalObserved',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'errorObserved',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'languageDetected',
          type: 'text',
          defaultValue: 'en',
        },
        {
          name: 'wordCount',
          type: 'number',
          min: 0,
        },
        {
          name: 'notes',
          type: 'textarea',
          localized: true,
        },
      ],
    },
    {
      name: 'citationAssessment',
      type: 'group',
      fields: [
        {
          name: 'explicitCitationsPresent',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'sourceLinksPresent',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'sourcesPanelPresent',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'visibleCitationCount',
          type: 'number',
          min: 0,
          defaultValue: 0,
        },
        {
          name: 'uniqueDomainCount',
          type: 'number',
          min: 0,
          defaultValue: 0,
        },
        {
          name: 'citationStyle',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Inline citations', value: 'inline' },
            { label: 'End references', value: 'end-references' },
            { label: 'Source cards or panel', value: 'source-cards' },
            { label: 'Mixed', value: 'mixed' },
            { label: 'Other', value: 'other' },
          ],
        },
      ],
    },
    {
      name: 'sourceObservations',
      type: 'array',
      fields: [
        {
          name: 'position',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'url',
          type: 'text',
        },
        {
          name: 'domain',
          type: 'text',
          required: true,
          index: true,
        },
        {
          name: 'sourceType',
          type: 'select',
          defaultValue: 'other',
          options: [
            { label: 'Academic or scholarly', value: 'academic' },
            { label: 'Government or official institution', value: 'official' },
            { label: 'Technical documentation', value: 'documentation' },
            { label: 'News or media', value: 'media' },
            { label: 'Corporate website', value: 'corporate' },
            { label: 'Independent blog or publication', value: 'blog' },
            { label: 'Forum or community', value: 'forum' },
            { label: 'Social platform', value: 'social' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'citedExplicitly',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'linked',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'usedInAnswer',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'notes',
          type: 'textarea',
          localized: true,
        },
      ],
    },
    {
      name: 'visibilityCoding',
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
          name: 'mentioned',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'cited',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'recommended',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'mentionPosition',
          type: 'number',
          min: 1,
        },
        {
          name: 'citationPosition',
          type: 'number',
          min: 1,
        },
        {
          name: 'recommendationStrength',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Weak', value: 'weak' },
            { label: 'Moderate', value: 'moderate' },
            { label: 'Strong', value: 'strong' },
          ],
        },
      ],
    },
    {
      name: 'semanticCoding',
      type: 'group',
      fields: [
        {
          name: 'themes',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
            },
          ],
        },
        {
          name: 'claimsCount',
          type: 'number',
          min: 0,
        },
        {
          name: 'evidenceGrounding',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
          ],
        },
        {
          name: 'semanticCoverageScore',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Optional protocol-defined semantic coverage score from 0 to 100.',
          },
        },
      ],
    },
    {
      name: 'comparison',
      type: 'group',
      fields: [
        {
          name: 'baselineObservation',
          type: 'relationship',
          relationTo: 'observations',
        },
        {
          name: 'variationLevel',
          type: 'select',
          defaultValue: 'not-assessed',
          options: [
            { label: 'Not assessed', value: 'not-assessed' },
            { label: 'No meaningful variation', value: 'none' },
            { label: 'Low variation', value: 'low' },
            { label: 'Medium variation', value: 'medium' },
            { label: 'High variation', value: 'high' },
          ],
        },
        {
          name: 'comparisonNotes',
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
            { label: 'Excluded from analysis', value: 'excluded' },
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
          name: 'exclusionReason',
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
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
};