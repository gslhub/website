import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload';

import { adminOnly } from '../access/scientificContentAccess';
import { generateTestDataBatchEndpoint } from '../endpoints/generateTestDataBatch';
import { cleanupPilotMetricDefinitionBatch } from '../test-data/pilotMetricDefinitionBatch';
import { cleanupPilotMetricResultDefinitions } from '../test-data/pilotMetricResultBatchCleanup';
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
      'Administrator-only controlled generation and maintenance. Disposable test scenarios are removed with their batch; promoted scientific definitions and registry synchronizations are preserved.',
  },
  endpoints: [generateTestDataBatchEndpoint],
  hooks: {
    beforeValidate: [prepareTestDataBatch, markTestDataBatchPending],
    beforeDelete: [
      cleanupPilotMetricDefinitionBatch,
      cleanupTestDataBatch,
      cleanupPilotMetricResultDefinitions,
    ],
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      defaultValue: 'GSLHub research workflow test data',
      admin: {
        description:
          'Human-readable name for this administrator-controlled generation batch.',
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
        description: 'Automatically generated ownership and audit code.',
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
        {
          label: 'Pilot metric definitions — AIR, CR, MCP and RCR drafts',
          value: 'pilot-metric-definitions',
        },
        {
          label:
            'Metric definition linkage — 4 calculated results with automatic prerequisites',
          value: 'pilot-metric-results',
        },
        {
          label:
            'Synchronize benchmark metric registry — AIR, CR, MCP and RCR',
          value: 'benchmark-metric-registry-sync',
        },
        {
          label:
            'AIR deterministic validation — 11 core records plus automatic metric prerequisites',
          value: 'air-deterministic-validation',
        },
      ],
      admin: {
        description:
          'AIR Deterministic Validation creates five completed executions, five observations and one calculated result. When the AIR, CR, MCP and RCR definitions are absent, it first creates those four review drafts. The calculator must return numerator 3, denominator 4 and AIR 0.75 with one documented exclusion and reproducibility checksums.',
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
          'Exact records generated, reused or synchronized by this batch. Cleanup only removes records owned by disposable scenarios.',
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
            { label: 'Metric Definitions', value: 'metric-definitions' },
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
          'Optional administrator notes. Deleting a batch runs its scenario-specific cleanup rules before the batch itself is removed.',
      },
    },
  ],
};
