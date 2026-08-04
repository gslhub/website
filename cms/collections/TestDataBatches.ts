import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload';

import { adminOnly } from '../access/scientificContentAccess';
import { generateTestDataBatchEndpoint } from '../endpoints/generateTestDataBatch';
import { cleanupAdministrativeBatch } from '../pilot/cleanupAdministrativeBatch';
import { cleanupPilotMetricDefinitionBatch } from '../test-data/pilotMetricDefinitionBatch';
import { cleanupPilotMetricResultDefinitions } from '../test-data/pilotMetricResultBatchCleanup';
import { prepareTestDataBatch } from '../test-data/testDataBatchLifecycle';

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
    singular: 'Administrative Batch',
    plural: 'Administrative Batches',
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
      'Administrator-only controlled test generation and permanent pilot preparation. Disposable TEST records are cleaned with their batch; permanent scientific definitions, technical review records and real execution reservations are preserved.',
  },
  endpoints: [generateTestDataBatchEndpoint],
  hooks: {
    beforeValidate: [prepareTestDataBatch, markTestDataBatchPending],
    beforeDelete: [
      cleanupPilotMetricDefinitionBatch,
      cleanupAdministrativeBatch,
      cleanupPilotMetricResultDefinitions,
    ],
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      defaultValue: 'GSLHub administrative research action',
      admin: {
        description:
          'Human-readable name for this administrator-controlled generation or preparation action.',
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
          label: 'Pilot prompt executions — 5 planned TEST draft records',
          value: 'pilot-executions',
        },
        {
          label: 'Full research pipeline — 27 connected TEST records',
          value: 'full-research-pipeline',
        },
        {
          label:
            'Permanent pilot metric definitions — create or synchronize AIR, CR, MCP and RCR v0.1.0',
          value: 'pilot-permanent-metric-definitions',
        },
        {
          label:
            'Record pilot metric author technical review — AIR, CR, MCP and RCR v0.1.0',
          value: 'pilot-metric-technical-review',
        },
        {
          label:
            'Permanent real pilot executions — create or reuse GSL-EXEC-GEO-0001 to 0005 after readiness passes',
          value: 'pilot-real-executions',
        },
        {
          label: 'Disposable pilot metric definitions — AIR, CR, MCP and RCR review drafts',
          value: 'pilot-metric-definitions',
        },
        {
          label:
            'Metric definition linkage — 4 calculated TEST results with automatic prerequisites',
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
        {
          label:
            'CR deterministic validation — 13 core records, expected 2 / 4 = 0.5',
          value: 'cr-deterministic-validation',
        },
        {
          label:
            'MCP deterministic validation — 14 core records, expected mean position 2.0',
          value: 'mcp-deterministic-validation',
        },
        {
          label:
            'RCR deterministic validation — 11 core records, expected 3 / 4 = 0.75',
          value: 'rcr-deterministic-validation',
        },
      ],
      admin: {
        description:
          'Permanent actions create, synchronize or document scientific records and are never removed by batch cleanup. Metric synchronization updates only Planned or Under review definitions. Technical self-review records deterministic tests while leaving formal validation and independent review pending. The real-execution action refuses to run until every scientific and storage readiness condition passes.',
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
        { label: 'Pending action', value: 'pending' },
        { label: 'Running', value: 'generating' },
        { label: 'Completed', value: 'generated' },
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
          'Exact records generated, reused, synchronized or reviewed by this action. Permanent definitions, technical review records and real executions remain intact if this administrative audit record is removed.',
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
        description: 'Action error retained for administrator diagnosis.',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description:
          'Optional administrator notes. Permanent scientific records require their own governed lifecycle and are not deleted through administrative-batch cleanup.',
      },
    },
  ],
};
