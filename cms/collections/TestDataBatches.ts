import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload';

import { adminOnly } from '../access/scientificContentAccess';
import { generateTestDataBatchEndpoint } from '../endpoints/generateTestDataBatch';
import {
  cleanupTestDataBatch,
  prepareTestDataBatch,
} from '../test-data/testDataBatchLifecycle';

const showGeneratedFields = (data: Record<string, unknown>) =>
  typeof data?.batchCode === 'string' && data.batchCode.length > 0;

const markTestDataBatchPending: CollectionBeforeValidateHook = ({ data, operation }) => {
  if (operation !== 'create') return data;

  return {
    ...(data || {}),
    status: 'pending',
  };
};

export const TestDataBatches: CollectionConfig = {
  slug: 'test-data-batches',
  labels: {
    singular: 'Test Data Batch',
    plural: 'Test Data Batches',
  },
  access: {
    create: adminOnly,
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'label',
    group: 'Administration',
    defaultColumns: [
      'label',
      'batchCode',
      'scenario',
      'status',
      'recordCount',
      'createdAt',
    ],
    description:
      'Administrator-only sample data. Save a batch first, then generate or remove only the records owned by that batch.',
  },
  endpoints: [generateTestDataBatchEndpoint],
  hooks: {
    beforeValidate: [prepareTestDataBatch, markTestDataBatchPending],
    beforeDelete: [cleanupTestDataBatch],
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      defaultValue: 'GSLHub research workflow test data',
      admin: {
        description: 'Human-readable name for this disposable sample-data batch.',
      },
    },
    {
      name: 'batchCode',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        condition: showGeneratedFields,
        description: 'Automatically generated ownership code used for safe cleanup.',
      },
    },
    {
      name: 'scenario',
      type: 'select',
      required: true,
      defaultValue: 'pilot-executions',
      options: [
        {
          label: 'Pilot prompt executions — 5 planned draft records',
          value: 'pilot-executions',
        },
        {
          label: 'Full research pipeline — 27 connected test records',
          value: 'full-research-pipeline',
        },
      ],
      admin: {
        description:
          'The full pipeline scenario creates completed executions, observations, uploaded artifacts, evidence, citations and validated metric results. All scientific records remain drafts or private.',
      },
    },
    {
      name: 'generationActions',
      type: 'ui',
      admin: {
        condition: showGeneratedFields,
        components: {
          Field: '/components/admin/TestDataBatchActions',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Pending generation', value: 'pending' },
        { label: 'Generating', value: 'generating' },
        { label: 'Generated', value: 'generated' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        readOnly: true,
        condition: showGeneratedFields,
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        condition: showGeneratedFields,
      },
    },
    {
      name: 'generatedAt',
      type: 'date',
      admin: {
        readOnly: true,
        condition: showGeneratedFields,
      },
    },
    {
      name: 'recordCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        readOnly: true,
        condition: showGeneratedFields,
      },
    },
    {
      name: 'records',
      type: 'array',
      admin: {
        readOnly: true,
        condition: showGeneratedFields,
        description:
          'Exact records owned by this batch. Cleanup refuses to delete records whose codes no longer match the batch ownership prefix.',
      },
      fields: [
        {
          name: 'collectionSlug',
          type: 'select',
          required: true,
          options: [
            { label: 'Prompt Executions', value: 'prompt-executions' },
            { label: 'Observations', value: 'observations' },
            { label: 'Research Artifacts', value: 'research-artifacts' },
            { label: 'Evidence', value: 'evidence' },
            { label: 'Citations', value: 'citations' },
            { label: 'Metrics', value: 'metrics' },
          ],
        },
        {
          name: 'recordId',
          type: 'text',
          required: true,
        },
        {
          name: 'recordCode',
          type: 'text',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'errorMessage',
      type: 'textarea',
      admin: {
        readOnly: true,
        condition: showGeneratedFields,
        description: 'Generation error retained for administrator diagnosis.',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description:
          'Optional administrator notes. Deleting this batch triggers safe cleanup before the batch itself is removed.',
      },
    },
  ],
};
