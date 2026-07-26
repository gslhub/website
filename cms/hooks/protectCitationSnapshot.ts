import { APIError, type CollectionBeforeValidateHook } from 'payload';

type CitationDocument = Record<string, unknown> & {
  lifecycleStatus?: unknown;
};

const hasOwn = (value: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const normalizeComparableValue = (value: unknown): unknown => {
  if (value === undefined || value === null) return null;
  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) {
    return value.map(normalizeComparableValue);
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;

    if (hasOwn(record, 'id')) {
      return normalizeComparableValue(record.id);
    }

    return Object.keys(record)
      .sort()
      .reduce<Record<string, unknown>>((normalized, key) => {
        normalized[key] = normalizeComparableValue(record[key]);
        return normalized;
      }, {});
  }

  return value;
};

const valuesMatch = (left: unknown, right: unknown) =>
  JSON.stringify(normalizeComparableValue(left)) ===
  JSON.stringify(normalizeComparableValue(right));

const alwaysImmutableFields = ['citationCode'] as const;

const validatedSnapshotFields = [
  'citationType',
  'citationFunction',
  'citationPosition',
  'capturedAt',
  'promptExecution',
  'observation',
  'evidence',
  'project',
  'benchmark',
  'experiment',
  'prompt',
  'aiSystem',
  'extractedBy',
  'sourceTitle',
  'sourceUrl',
  'normalizedUrl',
  'sourceDomain',
  'sourcePublisher',
  'sourceAuthor',
  'sourceType',
  'sourceLanguage',
  'sourcePublishedAt',
  'sourceAccessedAt',
  'doi',
  'citationContext',
  'targetCoding',
  'verification',
  'integrity',
] as const;

const sealedStatuses = new Set(['validated', 'rejected', 'archived']);

const throwConflict = (message: string): never => {
  throw new APIError(message, 409);
};

const validateLifecycleTransition = ({
  incomingStatus,
  previousStatus,
}: {
  incomingStatus: string;
  previousStatus: string;
}) => {
  if (incomingStatus === previousStatus) return;

  if (previousStatus === 'validated') {
    if (!new Set(['rejected', 'archived']).has(incomingStatus)) {
      throwConflict(
        `A citation sealed as "validated" cannot change to lifecycle status "${incomingStatus}". Reject or archive the citation instead of reopening its source snapshot.`,
      );
    }

    return;
  }

  if (previousStatus === 'rejected' && incomingStatus !== 'archived') {
    throwConflict(
      `A citation sealed as "rejected" cannot change to lifecycle status "${incomingStatus}". It may only be archived.`,
    );
  }

  if (previousStatus === 'archived') {
    throwConflict('An archived citation cannot change lifecycle status.');
  }
};

export const protectCitationSnapshot: CollectionBeforeValidateHook = ({
  data,
  operation,
  originalDoc,
}) => {
  if (operation !== 'update' || !originalDoc) return data;

  const incoming = (data || {}) as CitationDocument;
  const previous = originalDoc as CitationDocument;
  const previousStatus = getString(previous.lifecycleStatus) || 'captured';
  const incomingStatus = getString(incoming.lifecycleStatus) || previousStatus;

  validateLifecycleTransition({ incomingStatus, previousStatus });

  const protectedFields: string[] = [...alwaysImmutableFields];

  if (sealedStatuses.has(previousStatus)) {
    protectedFields.push(...validatedSnapshotFields);
  }

  const changedFields = protectedFields.filter(
    (field) =>
      hasOwn(incoming, field) &&
      !valuesMatch(incoming[field], previous[field]),
  );

  if (changedFields.length > 0) {
    throwConflict(
      `The scientific citation snapshot is sealed. Protected fields changed: ${changedFields.join(', ')}. Record review notes, rejection metadata or a new citation instead of overwriting a validated source record.`,
    );
  }

  return data;
};
