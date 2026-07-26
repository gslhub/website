import type {
  CollectionAfterChangeHook,
  CollectionBeforeDeleteHook,
  PayloadRequest,
} from 'payload';

type RelationshipValue =
  | string
  | number
  | { id?: string | number | null }
  | null
  | undefined;

type MetricDefinitionDocument = Record<string, unknown> & {
  id: string | number;
  benchmarks?: RelationshipValue[] | RelationshipValue;
};

type BenchmarkDocument = Record<string, unknown> & {
  id: string | number;
  metricDefinitions?: RelationshipValue[] | RelationshipValue;
};

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

const includesID = (values: Array<string | number>, target: string | number) =>
  values.some((value) => String(value) === String(target));

const uniqueIDs = (values: Array<string | number>) => {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key = String(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const updateBenchmarkRegistry = async ({
  benchmarkID,
  definitionID,
  mode,
  req,
}: {
  benchmarkID: string | number;
  definitionID: string | number;
  mode: 'add' | 'remove';
  req: PayloadRequest;
}) => {
  const benchmark = (await req.payload.findByID({
    collection: 'benchmarks',
    id: benchmarkID,
    depth: 0,
    draft: true,
    overrideAccess: true,
    req,
  })) as BenchmarkDocument;

  const currentIDs = getRelationshipIDs(benchmark.metricDefinitions);
  const nextIDs =
    mode === 'add'
      ? uniqueIDs([...currentIDs, definitionID])
      : currentIDs.filter((id) => String(id) !== String(definitionID));

  const changed =
    nextIDs.length !== currentIDs.length ||
    nextIDs.some((id, index) => String(id) !== String(currentIDs[index]));

  if (!changed) return;

  await req.payload.update({
    collection: 'benchmarks',
    id: benchmarkID,
    draft: true,
    overrideAccess: true,
    req,
    data: {
      metricDefinitions: nextIDs,
    },
  });
};

export const ensureBenchmarkMetricDefinition = async ({
  benchmarkID,
  definitionID,
  req,
}: {
  benchmarkID: string | number;
  definitionID: string | number;
  req: PayloadRequest;
}) =>
  updateBenchmarkRegistry({
    benchmarkID,
    definitionID,
    mode: 'add',
    req,
  });

export const removeBenchmarkMetricDefinition = async ({
  benchmarkID,
  definitionID,
  req,
}: {
  benchmarkID: string | number;
  definitionID: string | number;
  req: PayloadRequest;
}) =>
  updateBenchmarkRegistry({
    benchmarkID,
    definitionID,
    mode: 'remove',
    req,
  });

export const syncBenchmarkMetricDefinitionsAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  const current = doc as MetricDefinitionDocument;
  const previous = (previousDoc || {}) as MetricDefinitionDocument;
  const currentBenchmarkIDs = getRelationshipIDs(current.benchmarks);
  const previousBenchmarkIDs = getRelationshipIDs(previous.benchmarks);

  const addedBenchmarkIDs = currentBenchmarkIDs.filter(
    (id) => !includesID(previousBenchmarkIDs, id),
  );
  const removedBenchmarkIDs = previousBenchmarkIDs.filter(
    (id) => !includesID(currentBenchmarkIDs, id),
  );

  for (const benchmarkID of addedBenchmarkIDs) {
    await ensureBenchmarkMetricDefinition({
      benchmarkID,
      definitionID: current.id,
      req,
    });
  }

  for (const benchmarkID of removedBenchmarkIDs) {
    await removeBenchmarkMetricDefinition({
      benchmarkID,
      definitionID: current.id,
      req,
    });
  }

  return doc;
};

export const detachMetricDefinitionBeforeDelete: CollectionBeforeDeleteHook = async ({
  id,
  req,
}) => {
  const definition = (await req.payload.findByID({
    collection: 'metric-definitions',
    id,
    depth: 0,
    draft: true,
    overrideAccess: true,
    req,
  })) as MetricDefinitionDocument;

  const benchmarkIDs = getRelationshipIDs(definition.benchmarks);

  for (const benchmarkID of benchmarkIDs) {
    await removeBenchmarkMetricDefinition({
      benchmarkID,
      definitionID: definition.id,
      req,
    });
  }
};
