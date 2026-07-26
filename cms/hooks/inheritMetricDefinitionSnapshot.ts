import {
  APIError,
  type CollectionBeforeValidateHook,
  type PayloadRequest,
} from 'payload';

type RelationshipValue =
  | string
  | number
  | { id?: string | number | null }
  | null
  | undefined;

type MetricResultDocument = Record<string, unknown> & {
  metricRecordCode?: unknown;
  lifecycleStatus?: unknown;
  metricDefinition?: RelationshipValue;
  metricCode?: unknown;
  metricVersion?: unknown;
  numericValue?: unknown;
  unit?: unknown;
  project?: RelationshipValue;
  benchmark?: RelationshipValue;
};

type MetricDefinitionDocument = Record<string, unknown> & {
  id: string | number;
  title?: unknown;
  metricCode?: unknown;
  version?: unknown;
  lifecycleStatus?: unknown;
  category?: unknown;
  direction?: unknown;
  unitOfAnalysis?: unknown;
  valueType?: unknown;
  unit?: unknown;
  formula?: unknown;
  aggregationMethod?: unknown;
  missingDataPolicy?: unknown;
  roundingPrecision?: unknown;
  project?: RelationshipValue;
  benchmarks?: RelationshipValue[] | RelationshipValue;
};

const sealedMetricResultStatuses = new Set(['validated', 'rejected', 'archived']);
const usableDefinitionStatuses = new Set(['validated', 'active']);

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const getRelationshipID = (value: RelationshipValue): string | number | null => {
  if (typeof value === 'string' || typeof value === 'number') return value;

  if (value && typeof value === 'object') {
    const id = value.id;
    return typeof id === 'string' || typeof id === 'number' ? id : null;
  }

  return null;
};

const getRelationshipIDs = (
  value: RelationshipValue[] | RelationshipValue,
): Array<string | number> => {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return values
    .map(getRelationshipID)
    .filter((id): id is string | number => id !== null);
};

const sameRelationship = (
  left: string | number | null,
  right: string | number | null,
) => left !== null && right !== null && String(left) === String(right);

const throwConflict = (message: string, status = 409): never => {
  throw new APIError(message, status);
};

const resolveTestDefinitionID = async ({
  incoming,
  previous,
  req,
}: {
  incoming: MetricResultDocument;
  previous: MetricResultDocument;
  req: PayloadRequest;
}): Promise<string | number | null> => {
  const metricCode = getString(incoming.metricCode ?? previous.metricCode);
  const metricVersion =
    getString(incoming.metricVersion ?? previous.metricVersion) || '0.1.0';

  if (!metricCode) return null;

  const result = await req.payload.find({
    collection: 'metric-definitions',
    where: {
      and: [
        { metricCode: { equals: metricCode } },
        { version: { equals: metricVersion } },
      ],
    },
    limit: 2,
    depth: 0,
    pagination: false,
    draft: true,
    overrideAccess: true,
    req,
  });

  if (result.docs.length === 0) {
    throwConflict(
      `Test metric ${metricCode} ${metricVersion} cannot be generated because its Metric Definition does not exist. Create the Pilot metric definitions batch first.`,
      400,
    );
  }

  if (result.docs.length > 1) {
    throwConflict(
      `Test metric ${metricCode} ${metricVersion} matched multiple Metric Definitions. Resolve the duplicate definitions before generating results.`,
    );
  }

  return result.docs[0].id;
};

const normalizeTestNumericValue = ({
  incoming,
  previous,
  definitionUnit,
  isTestResult,
}: {
  incoming: MetricResultDocument;
  previous: MetricResultDocument;
  definitionUnit: string | null;
  isTestResult: boolean;
}): number | null => {
  const numericValue = getNumber(incoming.numericValue ?? previous.numericValue);
  const incomingUnit = getString(incoming.unit ?? previous.unit);

  if (
    isTestResult &&
    numericValue !== null &&
    incomingUnit === 'percentage' &&
    definitionUnit === 'proportion'
  ) {
    return numericValue / 100;
  }

  return numericValue;
};

export const inheritMetricDefinitionSnapshot: CollectionBeforeValidateHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const incoming = (data || {}) as MetricResultDocument;
  const previous = (originalDoc || {}) as MetricResultDocument;
  const metricRecordCode =
    getString(incoming.metricRecordCode ?? previous.metricRecordCode) || '';
  const isTestResult = metricRecordCode.startsWith('TEST-');
  let definitionID = getRelationshipID(
    incoming.metricDefinition ?? previous.metricDefinition,
  );

  if (definitionID === null && isTestResult) {
    definitionID = await resolveTestDefinitionID({ incoming, previous, req });
  }

  if (definitionID === null) {
    throwConflict(
      'Every metric result must reference a versioned Metric Definition before it can be calculated or reviewed.',
      400,
    );
  }

  const previousDefinitionID = getRelationshipID(previous.metricDefinition);
  const previousStatus = getString(previous.lifecycleStatus) || 'planned';

  if (
    operation === 'update' &&
    previousDefinitionID !== null &&
    !sameRelationship(definitionID, previousDefinitionID) &&
    sealedMetricResultStatuses.has(previousStatus)
  ) {
    throwConflict(
      'A sealed metric result cannot be linked to a different Metric Definition. Create a new metric result for the new definition version.',
    );
  }

  const definition = (await req.payload.findByID({
    collection: 'metric-definitions',
    id: definitionID,
    depth: 0,
    draft: true,
    overrideAccess: true,
    req,
  })) as MetricDefinitionDocument;

  const definitionStatus = getString(definition.lifecycleStatus) || 'planned';

  if (!isTestResult && !usableDefinitionStatuses.has(definitionStatus)) {
    throwConflict(
      `Metric Definition ${getString(definition.metricCode) || definition.id} is "${definitionStatus}". Real metric results require a Validated or Active definition.`,
    );
  }

  const definitionProject = getRelationshipID(definition.project);
  const selectedProject = getRelationshipID(incoming.project ?? previous.project);

  if (
    selectedProject !== null &&
    definitionProject !== null &&
    !sameRelationship(selectedProject, definitionProject)
  ) {
    throwConflict(
      'The selected Metric Definition belongs to a different Project than this metric result.',
    );
  }

  const definitionBenchmarks = getRelationshipIDs(definition.benchmarks);
  const selectedBenchmark = getRelationshipID(incoming.benchmark ?? previous.benchmark);

  if (
    selectedBenchmark !== null &&
    definitionBenchmarks.length > 0 &&
    !definitionBenchmarks.some((id) => sameRelationship(id, selectedBenchmark))
  ) {
    throwConflict(
      'The selected Metric Definition is not registered for this Benchmark.',
    );
  }

  const inheritedProject = selectedProject ?? definitionProject;
  const inheritedBenchmark =
    selectedBenchmark ??
    (definitionBenchmarks.length === 1 ? definitionBenchmarks[0] : null);

  if (inheritedProject === null || inheritedBenchmark === null) {
    throwConflict(
      'The Metric Definition must resolve one Project and one Benchmark for this metric result.',
      400,
    );
  }

  const definitionUnit = getString(definition.unit);
  const normalizedNumericValue = normalizeTestNumericValue({
    incoming,
    previous,
    definitionUnit,
    isTestResult,
  });

  return {
    ...incoming,
    metricDefinition: definition.id,
    metricCode: getString(definition.metricCode),
    metricName: getString(definition.title),
    metricVersion: getString(definition.version),
    metricCategory: getString(definition.category),
    direction: getString(definition.direction),
    scopeType: getString(definition.unitOfAnalysis),
    valueType: getString(definition.valueType),
    numericValue: normalizedNumericValue,
    unit: definitionUnit,
    precision: getNumber(definition.roundingPrecision) ?? 4,
    formulaSnapshot: getString(definition.formula),
    aggregationMethod: getString(definition.aggregationMethod),
    missingDataPolicy: getString(definition.missingDataPolicy),
    project: inheritedProject,
    benchmark: inheritedBenchmark,
  };
};
