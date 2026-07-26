import { APIError, type CollectionBeforeValidateHook } from 'payload';

type PublicationDocument = Record<string, unknown> & {
  status?: unknown;
  publicationDate?: unknown;
  doi?: unknown;
  externalUrl?: unknown;
  venue?: unknown;
  authors?: unknown;
  openAccess?: unknown;
};

const hasOwn = (value: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const hasRelationships = (value: unknown): boolean =>
  Array.isArray(value) && value.length > 0;

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

const frozenPublicationFields = [
  'title',
  'slug',
  'abstract',
  'keywords',
  'publicationType',
  'publicationDate',
  'doi',
  'externalUrl',
  'venue',
  'volume',
  'issue',
  'pages',
  'bibtex',
  'authors',
  'project',
  'researchAreas',
  'software',
  'datasets',
  'openAccess',
] as const;

const frozenStatuses = new Set(['preprint', 'published', 'archived']);

const allowedTransitions: Record<string, Set<string>> = {
  planned: new Set(['in-preparation', 'archived']),
  'in-preparation': new Set(['planned', 'preprint', 'published', 'archived']),
  preprint: new Set(['published', 'archived']),
  published: new Set(['archived']),
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
      `Publication status cannot change from "${previousStatus}" to "${incomingStatus}". Release a new scholarly version instead of reopening or overwriting an existing preprint or publication record.`,
    );
  }
};

const validateReleaseRequirements = ({
  incoming,
  previous,
  status,
}: {
  incoming: PublicationDocument;
  previous: PublicationDocument;
  status: string;
}) => {
  if (!frozenStatuses.has(status)) return;

  const publicationDate = incoming.publicationDate ?? previous.publicationDate;
  const doi = getString(incoming.doi ?? previous.doi);
  const externalUrl = getString(incoming.externalUrl ?? previous.externalUrl);
  const venue = getString(incoming.venue ?? previous.venue);
  const authors = incoming.authors ?? previous.authors;
  const openAccess = (incoming.openAccess ?? previous.openAccess) === true;

  if (!publicationDate) {
    throwConflict(
      `A publication with status "${status}" requires Publication Date before its scholarly record can be frozen.`,
    );
  }

  if (!hasRelationships(authors)) {
    throwConflict(
      `A publication with status "${status}" requires at least one author before release.`,
    );
  }

  if (!doi && !externalUrl) {
    throwConflict(
      `A publication with status "${status}" requires a DOI or canonical External URL before release.`,
    );
  }

  if (!venue) {
    throwConflict(
      `A publication with status "${status}" requires a Venue such as a journal, conference, repository or publishing platform.`,
    );
  }

  if (openAccess && !externalUrl && !doi) {
    throwConflict(
      `An open-access publication requires a DOI or canonical External URL.`,
    );
  }
};

export const protectPublicationRelease: CollectionBeforeValidateHook = ({
  data,
  operation,
  originalDoc,
}) => {
  const incoming = (data || {}) as PublicationDocument;
  const previous = (originalDoc || {}) as PublicationDocument;
  const previousStatus = getString(previous.status) || 'planned';
  const incomingStatus = getString(incoming.status) || previousStatus;

  validateReleaseRequirements({
    incoming,
    previous,
    status: incomingStatus,
  });

  if (operation !== 'update' || !originalDoc) return data;

  validateLifecycleTransition({ incomingStatus, previousStatus });

  const protectedFields: string[] = [];

  if (frozenStatuses.has(previousStatus)) {
    protectedFields.push(...frozenPublicationFields);
  }

  const changedFields = protectedFields.filter(
    (field) =>
      hasOwn(incoming, field) &&
      !valuesMatch(incoming[field], previous[field]),
  );

  if (changedFields.length > 0) {
    throwConflict(
      `The released publication record is frozen. Protected fields changed: ${changedFields.join(', ')}. Create a new publication version or formal correction record instead of overwriting scholarly metadata already cited by scientific outputs.`,
    );
  }

  return data;
};
