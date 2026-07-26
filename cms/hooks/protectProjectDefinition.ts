import { APIError, type CollectionBeforeValidateHook } from 'payload';

type ProjectDocument = Record<string, unknown> & {
  status?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  methodology?: unknown;
};

const hasOwn = (value: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const hasLocalizedText = (value: unknown): boolean => {
  if (getString(value)) return true;

  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  return Object.values(value as Record<string, unknown>).some((item) =>
    Boolean(getString(item)),
  );
};

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

const alwaysImmutableFields = ['projectCode'] as const;

const frozenProjectFields = [
  'slug',
  'projectType',
  'objectives',
  'methodology',
  'startDate',
  'researchAreas',
] as const;

const closedProjectFields = ['endDate'] as const;

const frozenStatuses = new Set(['active', 'paused', 'completed', 'archived']);
const closedStatuses = new Set(['completed', 'archived']);

const allowedTransitions: Record<string, Set<string>> = {
  planned: new Set(['active', 'archived']),
  active: new Set(['paused', 'completed', 'archived']),
  paused: new Set(['active', 'completed', 'archived']),
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
      `Project status cannot change from "${previousStatus}" to "${incomingStatus}". Preserve the approved project definition and create a new project version instead of reopening completed or archived work.`,
    );
  }
};

const validateProjectRequirements = ({
  incoming,
  previous,
  status,
}: {
  incoming: ProjectDocument;
  previous: ProjectDocument;
  status: string;
}) => {
  if (!frozenStatuses.has(status)) return;

  const startDate = incoming.startDate ?? previous.startDate;
  const methodology = incoming.methodology ?? previous.methodology;
  const endDate = incoming.endDate ?? previous.endDate;

  if (!startDate) {
    throwConflict(
      `A project with status "${status}" requires Start Date before its approved definition can be frozen.`,
    );
  }

  if (!hasLocalizedText(methodology)) {
    throwConflict(
      `A project with status "${status}" requires Methodology before its approved definition can be frozen.`,
    );
  }

  if (status === 'completed' && !endDate) {
    throwConflict(
      `A completed project requires End Date before its lifecycle can be closed.`,
    );
  }
};

export const protectProjectDefinition: CollectionBeforeValidateHook = ({
  data,
  operation,
  originalDoc,
}) => {
  const incoming = (data || {}) as ProjectDocument;
  const previous = (originalDoc || {}) as ProjectDocument;
  const previousStatus = getString(previous.status) || 'planned';
  const incomingStatus = getString(incoming.status) || previousStatus;

  validateProjectRequirements({
    incoming,
    previous,
    status: incomingStatus,
  });

  if (operation !== 'update' || !originalDoc) return data;

  validateLifecycleTransition({ incomingStatus, previousStatus });

  const protectedFields: string[] = [...alwaysImmutableFields];

  if (frozenStatuses.has(previousStatus)) {
    protectedFields.push(...frozenProjectFields);
  }

  if (closedStatuses.has(previousStatus)) {
    protectedFields.push(...closedProjectFields);
  }

  const changedFields = protectedFields.filter(
    (field) =>
      hasOwn(incoming, field) &&
      !valuesMatch(incoming[field], previous[field]),
  );

  if (changedFields.length > 0) {
    throwConflict(
      `The active project definition is frozen. Protected fields changed: ${changedFields.join(', ')}. Create a new project version instead of overwriting objectives, methodology, scope or lifecycle dates already used by scientific work.`,
    );
  }

  return data;
};
