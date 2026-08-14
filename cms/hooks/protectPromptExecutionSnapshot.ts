import { APIError, type CollectionBeforeValidateHook } from 'payload';

type ExecutionDocument = Record<string, unknown> & {
  lifecycleStatus?: unknown;
};

const hasOwn = (value: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

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

const alwaysImmutableFields = ['executionCode'] as const;

const startedSnapshotFields = [
  'repetitionNumber',
  'runLabel',
  'prompt',
  'promptVersion',
  'promptLanguage',
  'promptSnapshot',
  'project',
  'benchmark',
  'experiment',
  'aiSystem',
  'executedBy',
  'executionDate',
  'executionEnvironment',
] as const;

const terminalSnapshotFields = ['response', 'timing', 'usage'] as const;

const terminalStatuses = new Set(['completed', 'failed', 'excluded']);
const startedStatuses = new Set(['running', 'completed', 'failed', 'excluded']);
const blankEquivalentEnvironmentFields = new Set([
  'modelVersion',
  'interfaceVersion',
  'releaseChannel',
]);

const throwConflict = (message: string): never => {
  throw new APIError(message, 409);
};

const normalizeEnvironmentField = (key: string, value: unknown): unknown => {
  if (
    blankEquivalentEnvironmentFields.has(key) &&
    (value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim().length === 0))
  ) {
    return null;
  }

  return normalizeComparableValue(value);
};

const executionEnvironmentMatches = ({
  incoming,
  previous,
}: {
  incoming: unknown;
  previous: unknown;
}) => {
  const previousEnvironment = getRecord(previous);
  const incomingEnvironment = getRecord(incoming);
  const mergedEnvironment = {
    ...previousEnvironment,
    ...incomingEnvironment,
  };
  const keys = new Set([
    ...Object.keys(previousEnvironment),
    ...Object.keys(mergedEnvironment),
  ]);

  for (const key of keys) {
    if (key === 'newSessionConfirmed') {
      const previousConfirmed = previousEnvironment.newSessionConfirmed === true;
      const incomingConfirmed = mergedEnvironment.newSessionConfirmed === true;

      if (previousConfirmed === incomingConfirmed) continue;

      // This confirmation is intentionally recorded only after the execution has
      // actually taken place in a fresh isolated session. It may advance once,
      // but can never be reverted after being asserted.
      if (!previousConfirmed && incomingConfirmed) continue;

      return false;
    }

    const previousValue = normalizeEnvironmentField(
      key,
      previousEnvironment[key],
    );
    const incomingValue = normalizeEnvironmentField(key, mergedEnvironment[key]);

    if (JSON.stringify(previousValue) !== JSON.stringify(incomingValue)) {
      return false;
    }
  }

  return true;
};

const changedProtectedFields = ({
  incoming,
  previous,
  fields,
}: {
  incoming: ExecutionDocument;
  previous: ExecutionDocument;
  fields: readonly string[];
}) =>
  fields.filter((field) => {
    if (!hasOwn(incoming, field)) return false;

    if (field === 'executionEnvironment') {
      return !executionEnvironmentMatches({
        incoming: incoming.executionEnvironment,
        previous: previous.executionEnvironment,
      });
    }

    return !valuesMatch(incoming[field], previous[field]);
  });

const validateLifecycleTransition = ({
  incomingStatus,
  previousStatus,
}: {
  incomingStatus: string;
  previousStatus: string;
}) => {
  if (incomingStatus === previousStatus) return;

  if (previousStatus === 'running') {
    const allowed = new Set(['completed', 'failed', 'excluded']);

    if (!allowed.has(incomingStatus)) {
      throwConflict(
        `A running prompt execution cannot return to lifecycle status "${incomingStatus}". Complete, fail or exclude the execution instead.`,
      );
    }

    return;
  }

  if (terminalStatuses.has(previousStatus)) {
    const mayExclude =
      (previousStatus === 'completed' || previousStatus === 'failed') &&
      incomingStatus === 'excluded';

    if (!mayExclude) {
      throwConflict(
        `A prompt execution sealed as "${previousStatus}" cannot change to lifecycle status "${incomingStatus}".`,
      );
    }
  }
};

export const protectPromptExecutionSnapshot: CollectionBeforeValidateHook = ({
  data,
  operation,
  originalDoc,
}) => {
  if (operation !== 'update' || !originalDoc) return data;

  const incoming = (data || {}) as ExecutionDocument;
  const previous = originalDoc as ExecutionDocument;
  const previousStatus = getString(previous.lifecycleStatus) || 'planned';
  const incomingStatus = getString(incoming.lifecycleStatus) || previousStatus;

  validateLifecycleTransition({ incomingStatus, previousStatus });

  const protectedFields: string[] = [...alwaysImmutableFields];

  if (startedStatuses.has(previousStatus)) {
    protectedFields.push(...startedSnapshotFields);
  }

  if (terminalStatuses.has(previousStatus)) {
    protectedFields.push(...terminalSnapshotFields);
  }

  const changedFields = changedProtectedFields({
    incoming,
    previous,
    fields: protectedFields,
  });

  if (changedFields.length > 0) {
    throwConflict(
      `The scientific execution snapshot is sealed. Protected fields changed: ${changedFields.join(', ')}. Record corrections through review notes, exclusion metadata or a new execution instead of overwriting the captured run.`,
    );
  }

  return data;
};
