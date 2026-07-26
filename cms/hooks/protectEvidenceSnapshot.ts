import { APIError, type CollectionBeforeValidateHook } from 'payload';

type EvidenceDocument = Record<string, unknown> & {
  lifecycleStatus?: unknown;
  integrity?: unknown;
  chainOfCustody?: unknown;
  qualityControl?: unknown;
};

type IntegrityValue = Record<string, unknown> & {
  checksumAlgorithm?: unknown;
  checksum?: unknown;
  verified?: unknown;
};

type QualityControlValue = Record<string, unknown> & {
  reviewStatus?: unknown;
  validatedAt?: unknown;
};

const hasOwn = (value: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const getArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

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

const throwConflict = (message: string): never => {
  throw new APIError(message, 409);
};

const alwaysImmutableFields = ['evidenceCode'] as const;

const sealedSnapshotFields = [
  'title',
  'description',
  'evidenceType',
  'capturedAt',
  'promptExecution',
  'observation',
  'project',
  'benchmark',
  'experiment',
  'prompt',
  'aiSystem',
  'collectedBy',
  'artifact',
  'captureContext',
  'preservedContent',
  'integrity',
  'ethicalAndLegalNotes',
] as const;

const sealedStatuses = new Set(['validated', 'rejected', 'archived']);

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
        `Evidence sealed as "validated" cannot change to lifecycle status "${incomingStatus}". Reject or archive the evidence instead of reopening its preserved snapshot.`,
      );
    }

    return;
  }

  if (previousStatus === 'rejected' && incomingStatus !== 'archived') {
    throwConflict(
      `Evidence sealed as "rejected" cannot change to lifecycle status "${incomingStatus}". It may only be archived.`,
    );
  }

  if (previousStatus === 'archived') {
    throwConflict('Archived evidence cannot change lifecycle status.');
  }
};

const validateEvidenceForLifecycle = ({
  incoming,
  previous,
  lifecycleStatus,
}: {
  incoming: EvidenceDocument;
  previous: EvidenceDocument;
  lifecycleStatus: string;
}) => {
  if (!sealedStatuses.has(lifecycleStatus)) return;

  const integrity = getObject(
    incoming.integrity ?? previous.integrity,
  ) as IntegrityValue;
  const checksumAlgorithm = getString(integrity.checksumAlgorithm) || 'sha256';
  const checksum = getString(integrity.checksum);

  if (integrity.verified !== true) {
    throwConflict(
      `Evidence with lifecycle status "${lifecycleStatus}" requires Integrity → Verified to be enabled.`,
    );
  }

  if (checksumAlgorithm !== 'none' && checksum === null) {
    throwConflict(
      `Evidence with lifecycle status "${lifecycleStatus}" requires an integrity checksum when a checksum algorithm is selected.`,
    );
  }

  const qualityControl = getObject(
    incoming.qualityControl ?? previous.qualityControl,
  ) as QualityControlValue;

  if (qualityControl.reviewStatus !== 'accepted') {
    throwConflict(
      `Evidence with lifecycle status "${lifecycleStatus}" requires Quality Control → Review Status to be Accepted.`,
    );
  }

  if (!qualityControl.validatedAt) {
    throwConflict(
      `Evidence with lifecycle status "${lifecycleStatus}" requires Quality Control → Validated At.`,
    );
  }
};

const validateAppendOnlyChainOfCustody = ({
  incoming,
  previous,
}: {
  incoming: EvidenceDocument;
  previous: EvidenceDocument;
}) => {
  if (!hasOwn(incoming, 'chainOfCustody')) return;

  const previousEvents = getArray(previous.chainOfCustody);
  const incomingEvents = getArray(incoming.chainOfCustody);

  if (incomingEvents.length < previousEvents.length) {
    throwConflict(
      'Evidence chain of custody is append-only. Existing custody events cannot be removed.',
    );
  }

  const alteredEventIndex = previousEvents.findIndex(
    (event, index) => !valuesMatch(event, incomingEvents[index]),
  );

  if (alteredEventIndex !== -1) {
    throwConflict(
      `Evidence chain of custody is append-only. Existing event ${alteredEventIndex + 1} cannot be modified; add a new event instead.`,
    );
  }
};

export const protectEvidenceSnapshot: CollectionBeforeValidateHook = ({
  data,
  operation,
  originalDoc,
}) => {
  const incoming = (data || {}) as EvidenceDocument;
  const previous = (originalDoc || {}) as EvidenceDocument;
  const previousStatus = getString(previous.lifecycleStatus) || 'captured';
  const incomingStatus = getString(incoming.lifecycleStatus) || previousStatus;

  validateEvidenceForLifecycle({ incoming, previous, lifecycleStatus: incomingStatus });

  if (operation !== 'update' || !originalDoc) return data;

  validateLifecycleTransition({ incomingStatus, previousStatus });
  validateAppendOnlyChainOfCustody({ incoming, previous });

  const protectedFields: string[] = [...alwaysImmutableFields];

  if (sealedStatuses.has(previousStatus)) {
    protectedFields.push(...sealedSnapshotFields);
  }

  const changedFields = protectedFields.filter(
    (field) =>
      hasOwn(incoming, field) &&
      !valuesMatch(incoming[field], previous[field]),
  );

  if (changedFields.length > 0) {
    throwConflict(
      `The scientific evidence snapshot is sealed. Protected fields changed: ${changedFields.join(', ')}. Record review notes, a new custody event, rejection metadata or a new evidence record instead of overwriting preserved evidence.`,
    );
  }

  return data;
};
