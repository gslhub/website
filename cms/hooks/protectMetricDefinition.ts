import { APIError, type CollectionBeforeValidateHook } from 'payload';

type MetricDefinitionDocument = Record<string, unknown> & {
  id?: unknown;
  definitionCode?: unknown;
  metricCode?: unknown;
  version?: unknown;
  lifecycleStatus?: unknown;
  aggregationMethod?: unknown;
  numeratorDefinition?: unknown;
  denominatorDefinition?: unknown;
  validatedAt?: unknown;
  validatedBy?: unknown;
  technicalReview?: unknown;
};

const hasOwn = (value: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getDocumentId = (value: unknown): string | number | null =>
  typeof value === 'string' || typeof value === 'number' ? value : null;

const getRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const getRelationshipIDs = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (typeof item === 'string' || typeof item === 'number') {
      return [String(item)];
    }

    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const id = (item as Record<string, unknown>).id;
      return typeof id === 'string' || typeof id === 'number' ? [String(id)] : [];
    }

    return [];
  });
};

const hasRelationships = (value: unknown): boolean =>
  getRelationshipIDs(value).length > 0;

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

const throwConflict = (message: string, status = 409): never => {
  throw new APIError(message, status);
};

const frozenDefinitionFields = [
  'definitionCode',
  'slug',
  'metricCode',
  'version',
  'category',
  'direction',
  'unitOfAnalysis',
  'valueType',
  'unit',
  'description',
  'interpretation',
  'formula',
  'pseudocode',
  'numeratorDefinition',
  'denominatorDefinition',
  'aggregationMethod',
  'missingDataPolicy',
  'roundingPrecision',
  'validRange',
  'requiredInputs',
  'assumptions',
  'limitations',
  'validationProcedure',
  'technicalReview',
  'validatedAt',
  'validatedBy',
  'project',
  'benchmarks',
  'researchAreas',
  'researchers',
  'resources',
  'publications',
  'software',
  'openMethodology',
] as const;

const frozenStatuses = new Set(['validated', 'active', 'deprecated', 'archived']);

const allowedTransitions: Record<string, Set<string>> = {
  planned: new Set(['under-review', 'archived']),
  'under-review': new Set(['planned', 'validated', 'archived']),
  validated: new Set(['active', 'deprecated', 'archived']),
  active: new Set(['deprecated', 'archived']),
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
      `Metric definition lifecycle status cannot change from "${previousStatus}" to "${incomingStatus}". Create a new metric definition version instead of reopening a validated formula or coding rule.`,
    );
  }
};

const validateTechnicalReview = ({
  incoming,
  previous,
}: {
  incoming: MetricDefinitionDocument;
  previous: MetricDefinitionDocument;
}) => {
  const review = getRecord(incoming.technicalReview ?? previous.technicalReview);
  const status = getString(review.status) || 'pending';
  const deterministicStatus =
    getString(review.deterministicValidationStatus) || 'not-run';
  const independentStatus =
    getString(review.independentReviewStatus) || 'pending';

  if (status === 'completed') {
    if (!review.reviewedAt) {
      throwConflict('A completed Technical Review requires Reviewed At.');
    }

    if (!hasRelationships(review.reviewedBy)) {
      throwConflict('A completed Technical Review requires at least one Reviewed By researcher.');
    }

    if (deterministicStatus !== 'passed') {
      throwConflict(
        'A completed Technical Review requires Deterministic Validation Status = Passed.',
      );
    }
  }

  if (independentStatus === 'completed') {
    if (!review.independentReviewedAt) {
      throwConflict('A completed independent review requires Independent Reviewed At.');
    }

    if (!hasRelationships(review.independentReviewedBy)) {
      throwConflict(
        'A completed independent review requires at least one Independent Reviewed By researcher.',
      );
    }

    const authorReviewerIDs = new Set(getRelationshipIDs(review.reviewedBy));
    const independentReviewerIDs = getRelationshipIDs(review.independentReviewedBy);
    const overlap = independentReviewerIDs.filter((id) => authorReviewerIDs.has(id));

    if (overlap.length > 0) {
      throwConflict(
        'Independent reviewers must be different researchers from the author self-reviewer.',
      );
    }
  }

  return { review, status, deterministicStatus, independentStatus };
};

const validateDefinitionRequirements = ({
  incoming,
  previous,
  lifecycleStatus,
}: {
  incoming: MetricDefinitionDocument;
  previous: MetricDefinitionDocument;
  lifecycleStatus: string;
}) => {
  const validatedAt = incoming.validatedAt ?? previous.validatedAt;
  const validatedBy = incoming.validatedBy ?? previous.validatedBy;
  const technicalReview = validateTechnicalReview({ incoming, previous });

  if (!frozenStatuses.has(lifecycleStatus)) {
    if (validatedAt || hasRelationships(validatedBy)) {
      throwConflict(
        'Validated At and Validated By must remain empty until the metric definition enters the formal Validated lifecycle.',
      );
    }
    return;
  }

  const aggregationMethod =
    getString(incoming.aggregationMethod ?? previous.aggregationMethod) || 'custom';
  const numeratorDefinition =
    incoming.numeratorDefinition ?? previous.numeratorDefinition;
  const denominatorDefinition =
    incoming.denominatorDefinition ?? previous.denominatorDefinition;

  if (!validatedAt) {
    throwConflict(
      `A metric definition with lifecycle status "${lifecycleStatus}" requires Validated At before its scientific formula can be frozen.`,
    );
  }

  if (!hasRelationships(validatedBy)) {
    throwConflict(
      `A metric definition with lifecycle status "${lifecycleStatus}" requires at least one Validated By researcher.`,
    );
  }

  if (
    technicalReview.status !== 'completed' ||
    technicalReview.deterministicStatus !== 'passed'
  ) {
    throwConflict(
      'Formal validation requires a completed Technical Review with all deterministic metric tests passed.',
    );
  }

  if (technicalReview.independentStatus !== 'completed') {
    throwConflict(
      'Formal validation requires a completed independent review by a researcher different from the author self-reviewer.',
    );
  }

  if (aggregationMethod === 'ratio') {
    if (!hasLocalizedText(numeratorDefinition)) {
      throwConflict('A ratio metric definition requires Numerator Definition.');
    }

    if (!hasLocalizedText(denominatorDefinition)) {
      throwConflict('A ratio metric definition requires Denominator Definition.');
    }
  }
};

export const protectMetricDefinition: CollectionBeforeValidateHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const incoming = (data || {}) as MetricDefinitionDocument;
  const previous = (originalDoc || {}) as MetricDefinitionDocument;

  const rawDefinitionCode = getString(
    incoming.definitionCode ?? previous.definitionCode,
  );
  const rawMetricCode = getString(incoming.metricCode ?? previous.metricCode);
  const rawVersion = getString(incoming.version ?? previous.version);

  const definitionCode = rawDefinitionCode?.toUpperCase() || null;
  const metricCode = rawMetricCode?.toUpperCase() || null;
  const version = rawVersion || null;

  if (definitionCode && !/^GSL-MDEF-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d{4,}$/.test(definitionCode)) {
    throwConflict(
      'Metric Definition Code must follow GSL-MDEF-<METRIC>-0001 using uppercase letters, numbers and hyphens.',
      400,
    );
  }

  if (metricCode && !/^[A-Z][A-Z0-9-]{1,19}$/.test(metricCode)) {
    throwConflict(
      'Metric Code must contain 2 to 20 uppercase letters, numbers or hyphens, for example AIR, CR, MCP or RCR.',
      400,
    );
  }

  if (version && !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    throwConflict(
      'Metric definition Version must use semantic versioning, for example 0.1.0 or 1.0.0-beta.1.',
      400,
    );
  }

  const previousDefinitionCode = getString(previous.definitionCode)?.toUpperCase() || null;

  if (
    operation === 'update' &&
    previousDefinitionCode &&
    definitionCode !== previousDefinitionCode
  ) {
    throwConflict(
      `Metric definition code ${previousDefinitionCode} is permanently reserved and cannot be changed. Create a new version when a different identifier is required.`,
    );
  }

  if (metricCode && version) {
    const currentId =
      operation === 'update' ? getDocumentId(previous.id) : null;

    const matches = await req.payload.find({
      collection: 'metric-definitions',
      where: {
        and: [
          { metricCode: { equals: metricCode } },
          { version: { equals: version } },
          ...(currentId !== null ? [{ id: { not_equals: currentId } }] : []),
        ],
      },
      limit: 1,
      depth: 0,
      pagination: false,
      draft: true,
      overrideAccess: true,
      req,
    });

    if (matches.docs.length > 0) {
      throwConflict(
        `Metric definition ${metricCode} version ${version} already exists. Increment the semantic version instead of duplicating a scientific definition.`,
      );
    }
  }

  const previousStatus = getString(previous.lifecycleStatus) || 'planned';
  const incomingStatus =
    getString(incoming.lifecycleStatus) || previousStatus;

  validateDefinitionRequirements({
    incoming,
    previous,
    lifecycleStatus: incomingStatus,
  });

  if (operation === 'update' && originalDoc) {
    validateLifecycleTransition({ incomingStatus, previousStatus });

    const changedFields = frozenStatuses.has(previousStatus)
      ? frozenDefinitionFields.filter(
          (field) =>
            hasOwn(incoming, field) &&
            !valuesMatch(incoming[field], previous[field]),
        )
      : [];

    if (changedFields.length > 0) {
      throwConflict(
        `The validated metric definition is frozen. Protected fields changed: ${changedFields.join(', ')}. Create a new metric definition version instead of overwriting a formula, range, input rule or interpretation already used by scientific results.`,
      );
    }
  }

  return {
    ...incoming,
    ...(definitionCode ? { definitionCode } : {}),
    ...(metricCode ? { metricCode } : {}),
    ...(version ? { version } : {}),
  };
};
