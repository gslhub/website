import { APIError, type CollectionBeforeValidateHook } from 'payload';

type MetricDocument = Record<string, unknown> & {
  lifecycleStatus?: unknown;
  valueType?: unknown;
  numericValue?: unknown;
  textValue?: unknown;
  unit?: unknown;
  aggregationMethod?: unknown;
  denominator?: unknown;
  sampleSize?: unknown;
  calculatedAt?: unknown;
  qualityControl?: unknown;
};

type QualityControlValue = Record<string, unknown> & {
  reviewStatus?: unknown;
  validatedAt?: unknown;
};

const hasOwn = (value: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const getObject = (value: unknown): Record<string, unknown> =>
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

const throwConflict = (message: string): never => {
  throw new APIError(message, 409);
};

const alwaysImmutableFields = ['metricRecordCode'] as const;

const validatedSnapshotFields = [
  'metricCode',
  'metricName',
  'metricVersion',
  'metricCategory',
  'direction',
  'scopeType',
  'scopeLabel',
  'calculatedAt',
  'periodStart',
  'periodEnd',
  'valueType',
  'numericValue',
  'booleanValue',
  'textValue',
  'unit',
  'precision',
  'numerator',
  'denominator',
  'sampleSize',
  'resultSummary',
  'calculationMethod',
  'formulaSnapshot',
  'aggregationMethod',
  'missingDataPolicy',
  'confidenceInterval',
  'breakdowns',
  'project',
  'benchmark',
  'experiment',
  'prompt',
  'aiSystem',
  'promptExecutions',
  'observations',
  'citations',
  'evidence',
  'datasets',
  'software',
  'calculatedBy',
  'reproducibility',
] as const;

const calculatedStatuses = new Set([
  'calculated',
  'under-review',
  'validated',
  'rejected',
  'archived',
]);

const sealedStatuses = new Set(['validated', 'rejected', 'archived']);

const validateLifecycleTransition = ({
  incomingStatus,
  previousStatus,
}: {
  incomingStatus: string;
  previousStatus: string;
}) => {
  if (incomingStatus === previousStatus) return;

  if (previousStatus === 'validated') {
    if (!new Set(['rejected', 'archived']).has(incomingStatus)) {
      throwConflict(
        `A metric result sealed as "validated" cannot change to lifecycle status "${incomingStatus}". Reject or archive the result instead of reopening its calculation snapshot.`,
      );
    }

    return;
  }

  if (previousStatus === 'rejected' && incomingStatus !== 'archived') {
    throwConflict(
      `A metric result sealed as "rejected" cannot change to lifecycle status "${incomingStatus}". It may only be archived.`,
    );
  }

  if (previousStatus === 'archived') {
    throwConflict('An archived metric result cannot change lifecycle status.');
  }
};

const validateMetricResult = ({
  incoming,
  previous,
  lifecycleStatus,
}: {
  incoming: MetricDocument;
  previous: MetricDocument;
  lifecycleStatus: string;
}) => {
  if (!calculatedStatuses.has(lifecycleStatus)) return;

  const calculatedAt = incoming.calculatedAt ?? previous.calculatedAt;

  if (!calculatedAt) {
    throwConflict(
      `A metric result with lifecycle status "${lifecycleStatus}" requires Calculated At.`,
    );
  }

  const valueType = getString(incoming.valueType ?? previous.valueType) || 'number';
  const numericValue = getNumber(incoming.numericValue ?? previous.numericValue);
  const textValue = getString(incoming.textValue ?? previous.textValue);
  const unit = getString(incoming.unit ?? previous.unit) || 'proportion';
  const aggregationMethod =
    getString(incoming.aggregationMethod ?? previous.aggregationMethod) || 'ratio';
  const denominator = getNumber(incoming.denominator ?? previous.denominator);
  const sampleSize = getNumber(incoming.sampleSize ?? previous.sampleSize);

  if (valueType === 'number' && numericValue === null) {
    throwConflict('A calculated numeric metric requires Numeric Value.');
  }

  if (valueType === 'text' && textValue === null) {
    throwConflict('A calculated text metric requires Text Value.');
  }

  if (numericValue !== null) {
    if (unit === 'percentage' && (numericValue < 0 || numericValue > 100)) {
      throwConflict('Percentage metric values must be between 0 and 100.');
    }

    if (unit === 'proportion' && (numericValue < 0 || numericValue > 1)) {
      throwConflict('Proportion metric values must be between 0 and 1.');
    }

    if (unit === 'count' && numericValue < 0) {
      throwConflict('Count metric values cannot be negative.');
    }

    if (unit === 'position' && numericValue < 1) {
      throwConflict('Position metric values must be greater than or equal to 1.');
    }
  }

  if (aggregationMethod === 'ratio' && denominator !== null && denominator <= 0) {
    throwConflict('Ratio metrics require a denominator greater than zero.');
  }

  if (lifecycleStatus === 'validated') {
    if (sampleSize === null || sampleSize <= 0) {
      throwConflict('A validated metric result requires a Sample Size greater than zero.');
    }

    const qualityControl = getObject(
      incoming.qualityControl ?? previous.qualityControl,
    ) as QualityControlValue;
    const reviewStatus = getString(qualityControl.reviewStatus);

    if (reviewStatus !== 'accepted') {
      throwConflict(
        'A validated metric result requires Quality Control → Review Status to be Accepted.',
      );
    }

    if (!qualityControl.validatedAt) {
      throwConflict(
        'A validated metric result requires Quality Control → Validated At.',
      );
    }
  }
};

export const protectMetricSnapshot: CollectionBeforeValidateHook = ({
  data,
  operation,
  originalDoc,
}) => {
  const incoming = (data || {}) as MetricDocument;
  const previous = (originalDoc || {}) as MetricDocument;
  const previousStatus = getString(previous.lifecycleStatus) || 'planned';
  const incomingStatus = getString(incoming.lifecycleStatus) || previousStatus;

  validateMetricResult({ incoming, previous, lifecycleStatus: incomingStatus });

  if (operation !== 'update' || !originalDoc) return data;

  validateLifecycleTransition({ incomingStatus, previousStatus });

  const protectedFields: string[] = [...alwaysImmutableFields];

  if (sealedStatuses.has(previousStatus)) {
    protectedFields.push(...validatedSnapshotFields);
  }

  const changedFields = protectedFields.filter(
    (field) =>
      hasOwn(incoming, field) &&
      !valuesMatch(incoming[field], previous[field]),
  );

  if (changedFields.length > 0) {
    throwConflict(
      `The scientific metric snapshot is sealed. Protected fields changed: ${changedFields.join(', ')}. Record review notes, rejection metadata or a new metric result instead of overwriting a validated calculation.`,
    );
  }

  return data;
};
