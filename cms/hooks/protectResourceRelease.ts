import { APIError, type CollectionBeforeValidateHook } from 'payload';

type ResourceDocument = Record<string, unknown> & {
  lifecycleStatus?: unknown;
  publicationDate?: unknown;
  content?: unknown;
  externalUrl?: unknown;
  repositoryUrl?: unknown;
};

const hasOwn = (value: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const hasLocalizedText = (value: unknown): boolean => {
  if (getString(value)) return true;

  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  return Object.values(value as Record<string, unknown>).some((item) => Boolean(getString(item)));
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

const frozenReleaseFields = [
  'slug',
  'resourceType',
  'version',
  'content',
  'externalUrl',
  'repositoryUrl',
  'publicationDate',
  'license',
  'authors',
  'project',
  'researchAreas',
  'benchmarks',
  'software',
  'datasets',
  'publications',
  'openAccess',
] as const;

const frozenStatuses = new Set(['available', 'archived']);

const allowedTransitions: Record<string, Set<string>> = {
  planned: new Set(['in-development', 'archived']),
  'in-development': new Set(['planned', 'available', 'archived']),
  available: new Set(['archived']),
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
      `Research resource lifecycle status cannot change from "${previousStatus}" to "${incomingStatus}". Release a completed version as Available and create a new version instead of reopening a published resource.`,
    );
  }
};

const validateReleaseRequirements = ({
  incoming,
  previous,
  lifecycleStatus,
}: {
  incoming: ResourceDocument;
  previous: ResourceDocument;
  lifecycleStatus: string;
}) => {
  if (!frozenStatuses.has(lifecycleStatus)) return;

  const publicationDate = incoming.publicationDate ?? previous.publicationDate;
  const content = incoming.content ?? previous.content;
  const externalUrl = getString(incoming.externalUrl ?? previous.externalUrl);
  const repositoryUrl = getString(incoming.repositoryUrl ?? previous.repositoryUrl);

  if (!publicationDate) {
    throwConflict(
      `A research resource with lifecycle status "${lifecycleStatus}" requires Publication Date before its released version can be frozen.`,
    );
  }

  if (!hasLocalizedText(content) && !externalUrl && !repositoryUrl) {
    throwConflict(
      `A research resource with lifecycle status "${lifecycleStatus}" requires resource Content, an External URL or a Repository URL before release.`,
    );
  }
};

export const protectResourceRelease: CollectionBeforeValidateHook = ({
  data,
  operation,
  originalDoc,
}) => {
  const incoming = (data || {}) as ResourceDocument;
  const previous = (originalDoc || {}) as ResourceDocument;
  const previousStatus = getString(previous.lifecycleStatus) || 'planned';
  const incomingStatus = getString(incoming.lifecycleStatus) || previousStatus;

  validateReleaseRequirements({
    incoming,
    previous,
    lifecycleStatus: incomingStatus,
  });

  if (operation !== 'update' || !originalDoc) return data;

  validateLifecycleTransition({ incomingStatus, previousStatus });

  const protectedFields: string[] = [];

  if (frozenStatuses.has(previousStatus)) {
    protectedFields.push(...frozenReleaseFields);
  }

  const changedFields = protectedFields.filter(
    (field) =>
      hasOwn(incoming, field) &&
      !valuesMatch(incoming[field], previous[field]),
  );

  if (changedFields.length > 0) {
    throwConflict(
      `The released research resource is frozen. Protected fields changed: ${changedFields.join(', ')}. Create a new resource version instead of overwriting protocol content, canonical locations or release metadata already used by scientific work.`,
    );
  }

  return data;
};
