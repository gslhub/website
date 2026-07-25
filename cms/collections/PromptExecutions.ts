import type { CollectionConfig } from 'payload';

import {
  adminOnly,
  authenticatedResearchWrite,
  publishedOrAuthenticatedRead,
} from '../access/scientificContentAccess';
import { protectPromptExecutionSnapshot } from '../hooks/protectPromptExecutionSnapshot';
import { validatePromptExecutionLifecycle } from '../hooks/promptExecutionLifecycle';

export const PromptExecutions: CollectionConfig = {
  slug: 'prompt-executions',
  access: {
    create: authenticatedResearchWrite,
    read: publishedOrAuthenticatedRead,
    update: authenticatedResearchWrite,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'executionCode',
    group: 'Research Operations',
    defaultColumns: [
      'executionCode',
      'lifecycleStatus',
      'scheduledFor',
      'executionDate',
      'repetitionNumber',
      '_status',
    ],
  },
  hooks: {
    beforeValidate: [
      validatePromptExecutionLifecycle,
      protectPromptExecutionSnapshot,
    ],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'executionCode',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable execution identifier, for example GSL-EXEC-GEO-0001.',
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
        { label: 'Queued', value: 'queued' },
        { label: 'Running', value: 'running' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Excluded', value: 'excluded' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'scheduledFor',
      type: 'date',
      index: true,
      admin: {
        description:
          'Optional planned date and time. This is scheduling metadata and must not be treated as the actual execution timestamp.',
      },
    },
    {
      name: 'executionDate',
      type: 'date',
      index: true,
      admin: {
        description:
          'Actual date and time at which execution began. Required when the lifecycle reaches Running, Completed, Failed or Excluded.',
      },
    },
    {
      name: 'repetitionNumber',
      type: 'number',
      required: true,
      min: 1,
      defaultValue: 1,
    },
    {
      name: 'runLabel',
      type: 'text',
      admin: {
        description: 'Optional human-readable label for the round, batch or session.',
      },
    },
    {
      name: 'prompt',
      type: 'relationship',
      relationTo: 'prompts',
      required: true,
    },
    {
      name: 'promptVersion',
      type: 'text',
      required: true,
      admin: {
        description: 'Version of the prompt used for this execution.',
      },
    },
    {
      name: 'promptLanguage',
      type: 'select',
      required: true,
      defaultValue: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Español', value: 'es' },
        { label: 'Multilingual', value: 'multilingual' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'promptSnapshot',
      type: 'textarea',
      required: true,
      admin: {
        description:
          'Immutable copy of the exact prompt wording submitted during this execution.',
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
      name: 'aiSystem',
      type: 'relationship',
      relationTo: 'ai-systems',
      required: true,
    },
    {
      name: 'executedBy',
      type: 'relationship',
      relationTo: 'researchers',
      required: true,
    },
    {
      name: 'executionEnvironment',
      type: 'group',
      fields: [
        {
          name: 'accessMode',
          type: 'select',
          required: true,
          defaultValue: 'authenticated-web',
          options: [
            { label: 'Public web interface', value: 'public-web' },
            { label: 'Authenticated web interface', value: 'authenticated-web' },
            { label: 'API', value: 'api' },
            { label: 'Mobile application', value: 'mobile-app' },
            { label: 'Desktop application', value: 'desktop-app' },
            { label: 'Enterprise workspace', value: 'enterprise' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'accountTier',
          type: 'text',
          admin: {
            description: 'Account or subscription tier used during the execution.',
          },
        },
        {
          name: 'modelVersion',
          type: 'text',
          admin: {
            description: 'Visible model or model family at execution time, when available.',
          },
        },
        {
          name: 'interfaceVersion',
          type: 'text',
          admin: {
            description: 'Visible product or interface version at execution time.',
          },
        },
        {
          name: 'releaseChannel',
          type: 'text',
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
          name: 'webAccessEnabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'searchModeSelection',
          type: 'select',
          defaultValue: 'manual',
          options: [
            { label: 'Manually selected', value: 'manual' },
            { label: 'Automatically activated', value: 'automatic' },
            { label: 'Not applicable', value: 'not-applicable' },
            { label: 'Unknown', value: 'unknown' },
          ],
        },
        {
          name: 'newSessionConfirmed',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description:
              'Confirm only after the execution has been performed in a new isolated conversation or session.',
          },
        },
        {
          name: 'memoryEnabled',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'customInstructionsEnabled',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'response',
      type: 'group',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'not-executed',
          options: [
            { label: 'Not executed', value: 'not-executed' },
            { label: 'Success', value: 'success' },
            { label: 'Partial response', value: 'partial' },
            { label: 'Error', value: 'error' },
            { label: 'Refused', value: 'refused' },
            { label: 'Blocked', value: 'blocked' },
            { label: 'Empty response', value: 'empty' },
          ],
        },
        {
          name: 'text',
          type: 'textarea',
          admin: {
            description: 'Complete response text preserved exactly as observed.',
          },
        },
        {
          name: 'format',
          type: 'select',
          defaultValue: 'markdown',
          options: [
            { label: 'Plain text', value: 'plain-text' },
            { label: 'Markdown', value: 'markdown' },
            { label: 'HTML', value: 'html' },
            { label: 'JSON', value: 'json' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'sourcesPanelShown',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'explicitCitationsShown',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'sourceLinksShown',
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
          name: 'refusalReason',
          type: 'textarea',
        },
        {
          name: 'errorMessage',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'timing',
      type: 'group',
      fields: [
        {
          name: 'startedAt',
          type: 'date',
        },
        {
          name: 'completedAt',
          type: 'date',
        },
        {
          name: 'durationMilliseconds',
          type: 'number',
          min: 0,
        },
        {
          name: 'firstTokenMilliseconds',
          type: 'number',
          min: 0,
        },
      ],
    },
    {
      name: 'usage',
      type: 'group',
      fields: [
        {
          name: 'inputTokens',
          type: 'number',
          min: 0,
        },
        {
          name: 'outputTokens',
          type: 'number',
          min: 0,
        },
        {
          name: 'totalTokens',
          type: 'number',
          min: 0,
        },
        {
          name: 'providerRequestId',
          type: 'text',
        },
      ],
    },
    {
      name: 'integrity',
      type: 'group',
      fields: [
        {
          name: 'promptHash',
          type: 'text',
          admin: {
            description: 'Optional checksum of the exact prompt snapshot.',
          },
        },
        {
          name: 'responseHash',
          type: 'text',
          admin: {
            description: 'Optional checksum of the preserved response.',
          },
        },
        {
          name: 'rawResponseUrl',
          type: 'text',
          admin: {
            description: 'Optional location of a versioned raw response export.',
          },
        },
        {
          name: 'evidenceNotes',
          type: 'textarea',
          admin: {
            description:
              'Execution-level notes about preserved evidence and linked research artifacts.',
          },
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
          name: 'reviewers',
          type: 'relationship',
          relationTo: 'researchers',
          hasMany: true,
        },
        {
          name: 'validationNotes',
          type: 'textarea',
        },
        {
          name: 'exclusionReason',
          type: 'textarea',
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
    },
  ],
};
