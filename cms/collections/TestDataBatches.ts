import type { CollectionConfig } from 'payload';

import { adminOnly } from '../access/scientificContentAccess';
import {
  cleanupTestDataBatch,
  generateTestDataBatch,
  prepareTestDataBatch,
} from '../test-data/testDataBatchLifecycle';

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
      'Administrator-only sample data. Creating a batch generates tracked test records; deleting the batch removes only the records owned by that batch.',
  },
  hooks: {
    beforeValidate: [prepareTestDataBatch],
    afterChange: [generateTestDataBatch],
    beforeDelete: [cleanupTestDataBatch],
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      defaultValue: 'GSLHub pilot execution test data',
      admin: {
        description: 'Human-readable name for this disposable sample-data batch.',
      },
    },
    {
      name: 'batchCode',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
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
          label: 'Pilot prompt executions — 5 draft records',
          value: 'pilot-executions',
        },
      ],
      admin: {
        description:
          'Choose the test-data scenario. More complete pipeline scenarios can be added without changing the cleanup model.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'generating',
      index: true,
      options: [
        { label: 'Generating', value: 'generating' },
        { label: 'Generated', value: 'generated' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'generatedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'recordCount',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'records',
      type: 'array',
      admin: {
        readOnly: true,
        description:
          'Exact records owned by this batch. Cleanup refuses to delete records whose codes no longer match the batch ownership prefix.',
      },
      fields: [
        {
          name: 'collectionSlug',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Prompt Executions',
              value: 'prompt-executions',
            },
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
