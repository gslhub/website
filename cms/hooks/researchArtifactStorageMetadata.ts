import type { CollectionBeforeChangeHook } from 'payload';

import { researchArtifactStorageSettings } from '../storage/researchArtifactStorage';

type ResearchArtifactData = Record<string, unknown> & {
  filename?: unknown;
  storageMetadata?: Record<string, unknown> | null;
};

type UploadFileValue = {
  name?: unknown;
};

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const joinObjectKey = (prefix: string, filename: string): string =>
  `${prefix.replace(/^\/+|\/+$/g, '')}/${filename.replace(/^\/+/, '')}`;

export const recordResearchArtifactStorageMetadata: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const incoming = (data || {}) as ResearchArtifactData;
  const previous = (originalDoc || {}) as ResearchArtifactData;
  const uploadFile = req.file as UploadFileValue | undefined;
  const uploadedFilename = getString(uploadFile?.name);
  const filename =
    uploadedFilename || getString(incoming.filename) || getString(previous.filename);

  if (!filename) return data;

  const hasNewFile = Boolean(uploadedFilename) || operation === 'create';

  if (!hasNewFile && previous.storageMetadata) return data;

  const objectKey = researchArtifactStorageSettings.enabled
    ? joinObjectKey(researchArtifactStorageSettings.prefix, filename)
    : joinObjectKey('research-artifacts', filename);

  return {
    ...incoming,
    storageMetadata: {
      provider: researchArtifactStorageSettings.provider,
      durabilityStatus: researchArtifactStorageSettings.enabled
        ? 'durable-object-storage'
        : 'local-host-storage',
      bucket: researchArtifactStorageSettings.bucket,
      region: researchArtifactStorageSettings.region,
      endpoint: researchArtifactStorageSettings.endpoint,
      objectKey,
      recordedAt: new Date().toISOString(),
    },
  };
};
