import { APIError, type CollectionBeforeValidateHook } from 'payload';

type SoftwareDocument = Record<string, unknown> & {
  releaseStatus?: unknown;
  releaseDate?: unknown;
  sourceAvailability?: unknown;
  repositoryUrl?: unknown;
  license?: unknown;
  programmingLanguages?: unknown;
  openSource?: unknown;
};

const hasOwn = (value: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getBoolean = (value: unknown): boolean => value === true;

const hasProgrammingLanguages = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.some(
    (item) =>
      item &&
      typeof item === 'object' &&
      Boolean(getString((item as Record<string, unknown>).language)),
  );

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
  'technicalDescription',
  'softwareType',
  'version',
  'releaseDate',
  'sourceAvailability',
  'repositoryUrl',
  'documentationUrl',
  'packageUrl',
  'license',
  'programmingLanguages',
  'technologies',
  'researchers',
  'project',
  'researchAreas',
  'publications',
  'openSource',
] as const;

const frozenStatuses = new Set([
  'alpha',
  'beta',
  'stable',
  'maintenance',
  'deprecated',
  'archived',
]);

const allowedTransitions: Record<string, Set<string>> = {
  planned: new Set(['alpha', 'beta', 'archived']),
  alpha: new Set(['beta', 'deprecated', 'archived']),
  beta: new Set(['stable', 'deprecated', 'archived']),
  stable: new Set(['maintenance', 'deprecated', 'archived']),
  maintenance: new Set(['deprecated', 'archived']),
  deprecated: new Set(['archived']),
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
      `Software release status cannot change from "${previousStatus}" to "${incomingStatus}". Promote released versions through the controlled lifecycle and create a new software version instead of reopening an immutable release.`,
    );
  }
};

const validateReleaseRequirements = ({
  incoming,
  previous,
  releaseStatus,
}: {
  incoming: SoftwareDocument;
  previous: SoftwareDocument;
  releaseStatus: string;
}) => {
  if (!frozenStatuses.has(releaseStatus)) return;

  const releaseDate = incoming.releaseDate ?? previous.releaseDate;
  const sourceAvailability =
    getString(incoming.sourceAvailability ?? previous.sourceAvailability) ||
    'planned-public';
  const repositoryUrl = getString(
    incoming.repositoryUrl ?? previous.repositoryUrl,
  );
  const license = getString(incoming.license ?? previous.license);
  const programmingLanguages =
    incoming.programmingLanguages ?? previous.programmingLanguages;
  const openSource = getBoolean(incoming.openSource ?? previous.openSource);

  if (!releaseDate) {
    throwConflict(
      `Software with release status "${releaseStatus}" requires Release Date before its version can be frozen.`,
    );
  }

  if (sourceAvailability === 'planned-public') {
    throwConflict(
      `Released software cannot retain Source Availability as "Public release planned". Select Private development or Public repository available.`,
    );
  }

  if (!hasProgrammingLanguages(programmingLanguages)) {
    throwConflict(
      `Released software requires at least one declared programming language.`,
    );
  }

  if (sourceAvailability === 'public') {
    if (!repositoryUrl) {
      throwConflict(
        `Software with a public source release requires a Repository URL.`,
      );
    }

    if (!license) {
      throwConflict(`Public software requires a software License before release.`);
    }

    if (!openSource) {
      throwConflict(
        `Software with a public repository must enable Open Source before release.`,
      );
    }
  }

  if (openSource && sourceAvailability !== 'public') {
    throwConflict(
      `Open Source can only be enabled when Source Availability is "Public repository available".`,
    );
  }
};

export const protectSoftwareRelease: CollectionBeforeValidateHook = ({
  data,
  operation,
  originalDoc,
}) => {
  const incoming = (data || {}) as SoftwareDocument;
  const previous = (originalDoc || {}) as SoftwareDocument;
  const previousStatus = getString(previous.releaseStatus) || 'planned';
  const incomingStatus = getString(incoming.releaseStatus) || previousStatus;

  validateReleaseRequirements({
    incoming,
    previous,
    releaseStatus: incomingStatus,
  });

  if (operation !== 'update' || !originalDoc) return data;

  validateLifecycleTransition({
    incomingStatus,
    previousStatus,
  });

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
      `The released software version is frozen. Protected fields changed: ${changedFields.join(', ')}. Create a new software version instead of overwriting source availability, implementation details, identifiers or release metadata already used by scientific outputs.`,
    );
  }

  return data;
};
