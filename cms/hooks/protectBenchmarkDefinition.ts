import { APIError, type CollectionBeforeValidateHook } from 'payload';

type BenchmarkDocument = Record<string, unknown> & {
  lifecycleStatus?: unknown;
  startDate?: unknown;
  lastRunDate?: unknown;
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

const throwConflict = (message: string): never => {
  throw new APIError(message, 409);
};

const alwaysImmutableFields = ['benchmarkCode'] as const;

const frozenDefinitionFields = [
  'slug',
  'benchmarkType',
  'version',
  'scope',
  'protocol',
  'systems',
  'metrics',
  'metricDefinitions',
  'startDate',
  'project',
  'researchAreas',
] as const;

const frozenStatuses = new Set(['pilot', 'active', 'completed', 'archived']);

const allowedTransitions: Record<string, Set<string>> = {
  planned: new Set(['pilot']),
  pilot: new Set(['active', 'completed', 'archived']),
  active: new Set(['completed', 'archived']),
  completed: new Set(['archived']),
  archived: new Set(),
};

const validateLifecycleTransition = ({
  incomingStatus,
  previousStatus,
}: {
  incomingStatus: string;
  previousStatus: string;
}) => {
  if (incomingStatus === previousStatus) return;

  const allowed = allowedTransitions[previousStatus];

  if (!allowed || !allowed.has(incomingStatus)) {
    throwConflict(
      `Benchmark lifecycle status cannot change from "${previousStatus}" to "${incomingStatus}". Move a planned benchmark into Pilot before activation, and archive completed definitions instead of reopening them.`,
    );
  }
};

const validateLifecycleRequirements = ({
  incoming,
  previous,
  lifecycleStatus,
}: {
  incoming: BenchmarkDocument;
  previous: BenchmarkDocument;
  lifecycleStatus: string;
}) => {
  if (frozenStatuses.has(lifecycleStatus)) {
    const startDate = incoming.startDate ?? previous.startDate;

    if (!startDate) {
      throwConflict(
        `A benchmark with lifecycle status "${lifecycleStatus}" requires Start Date before its protocol and metric definitions can be frozen.`,
      );
    }
  }

  if (lifecycleStatus === 'completed') {
    const lastRunDate = incoming.lastRunDate ?? previous.lastRunDate;

    if (!lastRunDate) {
      throwConflict(
        'A completed benchmark requires Last Run Date before its lifecycle can be closed.',
      );
    }
  }
};

export const protectBenchmarkDefinition: CollectionBeforeValidateHook = ({
  data,
  operation,
  originalDoc,
}) => {
  const incoming = (data || {}) as BenchmarkDocument;
  const previous = (originalDoc || {}) as BenchmarkDocument;
  const previousStatus = getString(previous.lifecycleStatus) || 'planned';
  const incomingStatus = getString(incoming.lifecycleStatus) || previousStatus;

  validateLifecycleRequirements({
    incoming,
    previous,
    lifecycleStatus: incomingStatus,
  });

  if (operation !== 'update' || !originalDoc) return data;

  validateLifecycleTransition({ incomingStatus, previousStatus });

  const protectedFields: string[] = [...alwaysImmutableFields];

  if (frozenStatuses.has(previousStatus)) {
    protectedFields.push(...frozenDefinitionFields);
  }

  const changedFields = protectedFields.filter(
    (field) =>
      hasOwn(incoming, field) &&
      !valuesMatch(incoming[field], previous[field]),
  );

  if (changedFields.length > 0) {
    throwConflict(
      `The benchmark definition is frozen. Protected fields changed: ${changedFields.join(', ')}. Create a new benchmark version instead of overwriting a protocol, system set or versioned metric registry already used by a pilot or active study.`,
    );
  }

  return data;
};
