import type { CollectionConfig } from 'payload';

import { recordResearchArtifactStorageMetadata } from '../hooks/researchArtifactStorageMetadata';
import { ResearchArtifacts as BaseResearchArtifacts } from './ResearchArtifacts';

export const ResearchArtifacts: CollectionConfig = {
  ...BaseResearchArtifacts,
  hooks: {
    ...BaseResearchArtifacts.hooks,
    beforeChange: [
      ...(BaseResearchArtifacts.hooks?.beforeChange || []),
      recordResearchArtifactStorageMetadata,
    ],
  },
  fields: [
    ...(BaseResearchArtifacts.fields || []),
    {
      name: 'storageMetadata',
      type: 'group',
      admin: {
        readOnly: true,
        description:
          'Automatically recorded physical-storage provenance. Local host storage is not considered durable for irreplaceable pilot evidence.',
      },
      fields: [
        {
          name: 'provider',
          type: 'select',
          options: [
            { label: 'Local host storage', value: 'local' },
            { label: 'S3-compatible object storage', value: 's3-compatible' },
          ],
        },
        {
          name: 'durabilityStatus',
          type: 'select',
          options: [
            { label: 'Local host storage', value: 'local-host-storage' },
            {
              label: 'Durable object storage',
              value: 'durable-object-storage',
            },
          ],
        },
        {
          name: 'bucket',
          type: 'text',
        },
        {
          name: 'region',
          type: 'text',
        },
        {
          name: 'endpoint',
          type: 'text',
        },
        {
          name: 'objectKey',
          type: 'text',
          index: true,
        },
        {
          name: 'recordedAt',
          type: 'date',
        },
      ],
    },
  ],
};
