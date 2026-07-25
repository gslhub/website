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

type UploadFileValue = {
  data?: unknown;
  name?: unknown;
  mimetype?: unknown;
  mimeType?: unknown;
};

const asIntegrityValue = (value: unknown): IntegrityValue => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  return value as IntegrityValue;
};

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const normalizeScientificArtifactMimeType = (file: UploadFileValue) => {
  const filename = getString(file.name)?.toLowerCase();

  if (!filename) return;

  const extensionMimeTypes: Array<[string, string]> = [
    ['.jsonld', 'application/ld+json'],
    ['.json', 'application/json'],
    ['.html', 'text/html'],
    ['.htm', 'text/html'],
    ['.csv', 'text/csv'],
    ['.txt', 'text/plain'],
  ];

  const matched = extensionMimeTypes.find(([extension]) => filename.endsWith(extension));

  if (!matched) return;

  const normalizedMimeType = matched[1];

  // Payload's upload object has historically exposed `mimetype`, while some
  // upload hooks and generated document fields use `mimeType`. Set both so
  // validation receives the exact allow-listed value without charset suffixes
  // or the generic application/octet-stream fallback used by some hosts.
  file.mimetype = normalizedMimeType;
  file.mimeType = normalizedMimeType;
};

export const captureResearchArtifactChecksum: CollectionBeforeOperationHook = ({
  args,
  operation,
  req,
}) => {
  if (operation !== 'create' && operation !== 'update') {
    return args;
  }

  const file = req.file as UploadFileValue | undefined;

  if (!file) return args;

  normalizeScientificArtifactMimeType(file);

  if (!file.data) return args;

  const fileBytes = Buffer.isBuffer(file.data)
    ? file.data
    : Buffer.from(file.data as ArrayBuffer | ArrayLike<number>);

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
