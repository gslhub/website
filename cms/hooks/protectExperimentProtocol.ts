import { APIError, type CollectionBeforeValidateHook } from 'payload';

type ExperimentDocument = Record<string, unknown> & {
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

const throwConflict = (message: string): never => {
  throw new APIError(message, 409);
};

const alwaysImmutableFields = ['experimentCode'] as const;

const sealedProtocolFields = [
  'slug',
  'experimentType',
  'version',
  'researchQuestion',
  'hypothesis',
  'objective',
  'protocol',
  'samplingStrategy',
  'inclusionCriteria',
  'exclusionCriteria',
  'independentVariables',
  'dependentVariables',
  'controlVariables',
  'plannedRepetitions',
  'project',
  'benchmark',
  'researchAreas',
] as const;

const sealedStatuses = new Set([
  'ready',
  'running',
  'paused',
  'completed',
  'cancelled',
  'archived',
]);

const allowedTransitions: Record<string, Set<string>> = {
  planned: new Set(['ready', 'cancelled']),
  ready: new Set(['running', 'cancelled', 'archived']),
  running: new Set(['paused', 'completed', 'cancelled']),
  paused: new Set(['running', 'completed', 'cancelled']),
  completed: new Set(['archived']),
  cancelled: new Set(['archived']),
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
      `Experiment lifecycle status cannot change from "${previousStatus}" to "${incomingStatus}". Once an experiment is ready, revise the protocol through a new experiment version instead of reopening the frozen design.`,
    );
  }
};

const validateCompletionRequirements = ({
  incoming,
  previous,
  lifecycleStatus,
}: {
  incoming: ExperimentDocument;
  previous: ExperimentDocument;
  lifecycleStatus: string;
}) => {
  if (lifecycleStatus !== 'completed') return;

  const endDate = incoming.endDate ?? previous.endDate;

  if (!endDate) {
    throwConflict('A completed experiment requires an End Date.');
  }
};

export const protectExperimentProtocol: CollectionBeforeValidateHook = ({
  data,
  operation,
  originalDoc,
}) => {
  const incoming = (data || {}) as ExperimentDocument;
  const previous = (originalDoc || {}) as ExperimentDocument;
  const previousStatus = getString(previous.lifecycleStatus) || 'planned';
  const incomingStatus = getString(incoming.lifecycleStatus) || previousStatus;

  validateCompletionRequirements({ incoming, previous, lifecycleStatus: incomingStatus });

  if (operation !== 'update' || !originalDoc) return data;

  validateLifecycleTransition({ incomingStatus, previousStatus });

  const protectedFields: string[] = [...alwaysImmutableFields];

  if (sealedStatuses.has(previousStatus)) {
    protectedFields.push(...sealedProtocolFields);
  }

  const changedFields = protectedFields.filter(
    (field) =>
      hasOwn(incoming, field) &&
      !valuesMatch(incoming[field], previous[field]),
  );

  if (changedFields.length > 0) {
    throwConflict(
      `The experiment protocol is frozen. Protected fields changed: ${changedFields.join(', ')}. Create a new experiment version instead of overwriting a design already marked ready or used by scientific executions.`,
    );
  }

  return data;
};
