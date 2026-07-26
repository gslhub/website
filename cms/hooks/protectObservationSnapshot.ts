import { APIError, type CollectionBeforeValidateHook } from 'payload';

type ObservationDocument = Record<string, unknown> & {
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

const alwaysImmutableFields = ['observationCode'] as const;

const validatedSnapshotFields = [
  'observationType',
  'codedAt',
  'promptExecution',
  'project',
  'benchmark',
  'experiment',
  'prompt',
  'aiSystem',
  'codedBy',
  'responseAssessment',
  'citationAssessment',
  'sourceObservations',
  'visibilityCoding',
  'semanticCoding',
  'comparison',
] as const;

const sealedStatuses = new Set(['validated', 'excluded', 'archived']);

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
    if (!new Set(['excluded', 'archived']).has(incomingStatus)) {
      throwConflict(
        `A scientific observation sealed as "validated" cannot change to lifecycle status "${incomingStatus}". Exclude or archive the observation instead of reopening its coding snapshot.`,
      );
    }

    return;
  }

  if (previousStatus === 'excluded' && incomingStatus !== 'archived') {
    throwConflict(
      `A scientific observation sealed as "excluded" cannot change to lifecycle status "${incomingStatus}". It may only be archived.`,
    );
  }

  if (previousStatus === 'archived') {
    throwConflict('An archived scientific observation cannot change lifecycle status.');
  }
};

export const protectObservationSnapshot: CollectionBeforeValidateHook = ({
  data,
  operation,
  originalDoc,
}) => {
  if (operation !== 'update' || !originalDoc) return data;

  const incoming = (data || {}) as ObservationDocument;
  const previous = originalDoc as ObservationDocument;
  const previousStatus = getString(previous.lifecycleStatus) || 'planned';
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
      `The scientific observation snapshot is sealed. Protected fields changed: ${changedFields.join(', ')}. Record review notes, exclusion metadata or a new observation instead of overwriting validated coding.`,
    );
  }

  return data;
};
