import { APIError, type CollectionBeforeValidateHook } from 'payload';

type DatasetDocument = Record<string, unknown> & {
  lifecycleStatus?: unknown;
  releaseDate?: unknown;
  dataAvailability?: unknown;
  repositoryUrl?: unknown;
  doi?: unknown;
  license?: unknown;
  formats?: unknown;
  recordCount?: unknown;
  openData?: unknown;
};

const hasOwn = (value: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const getBoolean = (value: unknown): boolean => value === true;

const hasFormats = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.some(
    (item) =>
      item &&
      typeof item === 'object' &&
      Boolean(getString((item as Record<string, unknown>).format)),
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
  'methodology',
  'datasetType',
  'version',
  'releaseDate',
  'dataAvailability',
  'doi',
  'repositoryUrl',
  'documentationUrl',
  'license',
  'formats',
  'recordCount',
  'researchers',
  'project',
  'researchAreas',
  'software',
  'publications',
  'openData',
] as const;

const frozenStatuses = new Set(['released', 'archived']);

const allowedTransitions: Record<string, Set<string>> = {
  planned: new Set(['collecting', 'archived']),
  collecting: new Set(['planned', 'cleaning', 'archived']),
  cleaning: new Set(['collecting', 'validating', 'archived']),
  validating: new Set(['cleaning', 'released', 'archived']),
  released: new Set(['archived']),
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
      `Dataset lifecycle status cannot change from "${previousStatus}" to "${incomingStatus}". Complete collection, cleaning and validation before release, and create a new dataset version instead of reopening released data.`,
    );
  }
};

const validateReleaseRequirements = ({
  incoming,
  previous,
  lifecycleStatus,
}: {
  incoming: DatasetDocument;
  previous: DatasetDocument;
  lifecycleStatus: string;
}) => {
  if (!frozenStatuses.has(lifecycleStatus)) return;

  const releaseDate = incoming.releaseDate ?? previous.releaseDate;
  const availability =
    getString(incoming.dataAvailability ?? previous.dataAvailability) ||
    'planned-public';
  const repositoryUrl = getString(
    incoming.repositoryUrl ?? previous.repositoryUrl,
  );
  const doi = getString(incoming.doi ?? previous.doi);
  const license = getString(incoming.license ?? previous.license);
  const formats = incoming.formats ?? previous.formats;
  const recordCount = getNumber(incoming.recordCount ?? previous.recordCount);
  const openData = getBoolean(incoming.openData ?? previous.openData);

  if (!releaseDate) {
    throwConflict(
      `A dataset with lifecycle status "${lifecycleStatus}" requires Release Date before its version can be frozen.`,
    );
  }

  if (availability === 'planned-public') {
    throwConflict(
      `A released dataset cannot retain Data Availability as "Public release planned". Select Private collection, Public dataset available or Restricted access.`,
    );
  }

  if (!hasFormats(formats)) {
    throwConflict(
      `A released dataset requires at least one declared data format.`,
    );
  }

  if (recordCount === null || recordCount < 1) {
    throwConflict(
      `A released dataset requires a final Record Count greater than zero.`,
    );
  }

  if (availability === 'public') {
    if (!repositoryUrl && !doi) {
      throwConflict(
        `A public dataset requires a Repository URL or DOI before release.`,
      );
    }

    if (!license) {
      throwConflict(`A public dataset requires a data License before release.`);
    }

    if (!openData) {
      throwConflict(
        `A dataset marked as publicly available must enable Open Data before release.`,
      );
    }
  }

  if (openData && availability !== 'public') {
    throwConflict(
      `Open Data can only be enabled when Data Availability is "Public dataset available".`,
    );
  }
};

export const protectDatasetRelease: CollectionBeforeValidateHook = ({
  data,
  operation,
  originalDoc,
}) => {
  const incoming = (data || {}) as DatasetDocument;
  const previous = (originalDoc || {}) as DatasetDocument;
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
      `The released dataset version is frozen. Protected fields changed: ${changedFields.join(', ')}. Create a new dataset version instead of overwriting methodology, files, identifiers or release metadata already used by scientific outputs.`,
    );
  }

  return data;
};
