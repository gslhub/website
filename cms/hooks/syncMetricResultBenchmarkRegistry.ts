import type { CollectionAfterChangeHook } from 'payload';

import { ensureBenchmarkMetricDefinition } from './syncBenchmarkMetricDefinitions';

type RelationshipValue =
  | string
  | number
  | { id?: string | number | null }
  | null
  | undefined;

type MetricResultDocument = Record<string, unknown> & {
  metricDefinition?: RelationshipValue;
  benchmark?: RelationshipValue;
};

const getRelationshipID = (value: RelationshipValue): string | number | null => {
  if (typeof value === 'string' || typeof value === 'number') return value;

  if (value && typeof value === 'object') {
    const id = value.id;
    return typeof id === 'string' || typeof id === 'number' ? id : null;
  }

  return null;
};

export const syncMetricResultBenchmarkRegistry: CollectionAfterChangeHook = async ({
  doc,
  req,
}) => {
  const metricResult = doc as MetricResultDocument;
  const definitionID = getRelationshipID(metricResult.metricDefinition);
  const benchmarkID = getRelationshipID(metricResult.benchmark);

  if (definitionID === null || benchmarkID === null) return doc;

  await ensureBenchmarkMetricDefinition({
    benchmarkID,
    definitionID,
    req,
  });

  return doc;
};
