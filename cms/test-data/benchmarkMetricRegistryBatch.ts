import type { Payload, PayloadRequest } from 'payload';

import { ensureBenchmarkMetricDefinition } from '../hooks/syncBenchmarkMetricDefinitions';

type RecordID = string | number;

type RelationshipValue =
  | string
  | number
  | { id?: string | number | null }
  | null
  | undefined;

type BenchmarkDocument = {
  id: RecordID;
  benchmarkCode?: unknown;
};

type MetricDefinitionDocument = {
  id: RecordID;
  definitionCode?: unknown;
  metricCode?: unknown;
  version?: unknown;
  benchmarks?: RelationshipValue[] | RelationshipValue;
};

type GeneratedRecord = {
  collectionSlug: 'metric-definitions';
  recordId: string;
  recordCode: string;
  label: string;
};

const BENCHMARK_CODE = 'GSL-BENCH-GEO-01';
const DEFINITION_CODES = [
  'GSL-MDEF-AIR-0001',
  'GSL-MDEF-CR-0001',
  'GSL-MDEF-MCP-0001',
  'GSL-MDEF-RCR-0001',
] as const;

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

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

const requireAdmin = (req: PayloadRequest) => {
  const user = req.user as { role?: unknown } | null | undefined;

  if (!user || user.role !== 'admin') {
    throw new Error(
      'Only an administrator can synchronize the benchmark metric registry.',
    );
  }
};

const findOne = async ({
  payload,
  req,
  collection,
  field,
  value,
}: {
  payload: Payload;
  req: PayloadRequest;
  collection: 'benchmarks' | 'metric-definitions';
  field: string;
  value: string;
}) => {
  const result = await payload.find({
    collection,
    where: {
      [field]: {
        equals: value,
      },
    },
    limit: 2,
    depth: 0,
    pagination: false,
    draft: true,
    overrideAccess: true,
    req,
  });

  if (result.docs.length === 0) {
    throw new Error(`Required ${collection} record not found: ${field} = ${value}`);
  }

  if (result.docs.length > 1) {
    throw new Error(
      `Expected one ${collection} record but found ${result.docs.length}: ${field} = ${value}`,
    );
  }

  return result.docs[0];
};

export const synchronizePilotBenchmarkMetricRegistry = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<GeneratedRecord[]> => {
  requireAdmin(req);

  const benchmark = (await findOne({
    payload,
    req,
    collection: 'benchmarks',
    field: 'benchmarkCode',
    value: BENCHMARK_CODE,
  })) as BenchmarkDocument;

  const definitions: MetricDefinitionDocument[] = [];

  for (const definitionCode of DEFINITION_CODES) {
    const definition = (await findOne({
      payload,
      req,
      collection: 'metric-definitions',
      field: 'definitionCode',
      value: definitionCode,
    })) as MetricDefinitionDocument;

    const benchmarkIDs = getRelationshipIDs(definition.benchmarks);

    if (!includesID(benchmarkIDs, benchmark.id)) {
      throw new Error(
        `Metric Definition ${definitionCode} is not related to benchmark ${BENCHMARK_CODE}. Correct the definition relationship before synchronizing the registry.`,
      );
    }

    definitions.push(definition);
  }

  for (const definition of definitions) {
    await ensureBenchmarkMetricDefinition({
      benchmarkID: benchmark.id,
      definitionID: definition.id,
      req,
    });
  }

  return definitions.map((definition) => {
    const definitionCode = getString(definition.definitionCode) || String(definition.id);
    const metricCode = getString(definition.metricCode) || 'Metric';
    const version = getString(definition.version) || 'unknown';

    return {
      collectionSlug: 'metric-definitions',
      recordId: String(definition.id),
      recordCode: definitionCode,
      label: `${metricCode} ${version} linked to ${BENCHMARK_CODE}`,
    };
  });
};
