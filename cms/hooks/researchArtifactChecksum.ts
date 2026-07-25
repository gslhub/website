import { createHash } from 'node:crypto';

import type {
  CollectionBeforeChangeHook,
  CollectionBeforeOperationHook,
} from 'payload';

const CHECKSUM_CONTEXT_KEY = 'gslhubResearchArtifactSHA256';

type IntegrityValue = Record<string, unknown>;

type ResearchArtifactData = Record<string, unknown> & {
  integrity?: IntegrityValue | null;
};

const asIntegrityValue = (value: unknown): IntegrityValue => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  return value as IntegrityValue;
};

export const captureResearchArtifactChecksum: CollectionBeforeOperationHook = ({
  args,
  operation,
  req,
}) => {
  if ((operation !== 'create' && operation !== 'update') || !req.file?.data) {
    return args;
  }

  const fileBytes = Buffer.isBuffer(req.file.data)
    ? req.file.data
    : Buffer.from(req.file.data);

  req.context[CHECKSUM_CONTEXT_KEY] = createHash('sha256')
    .update(fileBytes)
    .digest('hex');

  return args;
};

export const persistResearchArtifactChecksum: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  req,
}) => {
  const checksum = req.context[CHECKSUM_CONTEXT_KEY];

  if (typeof checksum !== 'string') return data;

  const incomingData = (data || {}) as ResearchArtifactData;
  const previousIntegrity = asIntegrityValue(
    (originalDoc as ResearchArtifactData | undefined)?.integrity,
  );
  const incomingIntegrity = asIntegrityValue(incomingData.integrity);

  return {
    ...incomingData,
    integrity: {
      ...previousIntegrity,
      ...incomingIntegrity,
      checksumAlgorithm: 'sha256',
      checksum,
      contentUnmodified: true,
      verified: false,
      verifiedAt: null,
      verifiedBy: [],
    },
  };
};
