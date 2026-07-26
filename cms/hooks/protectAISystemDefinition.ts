import { APIError, type CollectionBeforeValidateHook } from 'payload';

type AISystemDocument = Record<string, unknown> & {
  lifecycleStatus?: unknown;
  firstObservedAt?: unknown;
  lastVerifiedAt?: unknown;
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

const alwaysImmutableFields = ['systemCode'] as const;

const frozenProfileFields = [
  'slug',
  'provider',
  'systemType',
  'versioningMode',
  'modelVersion',
  'interfaceVersion',
  'releaseChannel',
  'accessModes',
  'accountTier',
  'capabilities',
  'languages',
  'geographicAvailability',
  'identificationMethod',
  'knowledgeCutoff',
  'firstObservedAt',
  'benchmarks',
  'experiments',
  'researchAreas',
] as const;

const frozenStatuses = new Set([
  'active',
  'limited',
  'deprecated',
  'unavailable',
  'archived',
]);

const allowedTransitions: Record<string, Set<string>> = {
  preview: new Set(['active', 'limited', 'unavailable', 'archived']),
  active: new Set(['limited', 'deprecated', 'unavailable', 'archived']),
  limited: new Set(['active', 'deprecated', 'unavailable', 'archived']),
  deprecated: new Set(['archived']),
  unavailable: new Set(['active', 'limited', 'deprecated', 'archived']),
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
      `AI system lifecycle status cannot change from "${previousStatus}" to "${incomingStatus}". Preserve historical evaluation profiles and archive obsolete configurations instead of reopening them.`,
    );
  }
};

const validateProfileRequirements = ({
  incoming,
  previous,
  lifecycleStatus,
}: {
  incoming: AISystemDocument;
  previous: AISystemDocument;
  lifecycleStatus: string;
}) => {
  if (!frozenStatuses.has(lifecycleStatus)) return;

  const firstObservedAt = incoming.firstObservedAt ?? previous.firstObservedAt;
  const lastVerifiedAt = incoming.lastVerifiedAt ?? previous.lastVerifiedAt;

  if (!firstObservedAt) {
    throwConflict(
      `An AI system with lifecycle status "${lifecycleStatus}" requires First Observed At before its evaluation profile can be frozen.`,
    );
  }

  if (!lastVerifiedAt) {
    throwConflict(
      `An AI system with lifecycle status "${lifecycleStatus}" requires Last Verified At before its evaluation profile can be frozen.`,
    );
  }
};

export const protectAISystemDefinition: CollectionBeforeValidateHook = ({
  data,
  operation,
  originalDoc,
}) => {
  const incoming = (data || {}) as AISystemDocument;
  const previous = (originalDoc || {}) as AISystemDocument;
  const previousStatus = getString(previous.lifecycleStatus) || 'preview';
  const incomingStatus = getString(incoming.lifecycleStatus) || previousStatus;

  validateProfileRequirements({
    incoming,
    previous,
    lifecycleStatus: incomingStatus,
  });

  if (operation !== 'update' || !originalDoc) return data;

  validateLifecycleTransition({ incomingStatus, previousStatus });

  const protectedFields: string[] = [...alwaysImmutableFields];

  if (frozenStatuses.has(previousStatus)) {
    protectedFields.push(...frozenProfileFields);
  }

  const changedFields = protectedFields.filter(
    (field) =>
      hasOwn(incoming, field) &&
      !valuesMatch(incoming[field], previous[field]),
  );

  if (changedFields.length > 0) {
    throwConflict(
      `The AI system evaluation profile is frozen. Protected fields changed: ${changedFields.join(', ')}. Create a new AI system profile or snapshot instead of overwriting access conditions, capabilities or visible version metadata already used by scientific executions.`,
    );
  }

  return data;
};
