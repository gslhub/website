import { createHash } from 'node:crypto';

import type { Payload, PayloadRequest } from 'payload';

type RecordID = string | number;
type RelationshipValue =
  | string
  | number
  | { id?: string | number | null }
  | null
  | undefined;

type ObservationDocument = Record<string, unknown> & {
  id: RecordID;
  observationCode?: unknown;
  lifecycleStatus?: unknown;
  promptExecution?: RelationshipValue;
  visibilityCoding?: unknown;
  comparison?: unknown;
  qualityControl?: unknown;
};

type ExecutionDocument = Record<string, unknown> & {
  id: RecordID;
  executionCode?: unknown;
  lifecycleStatus?: unknown;
};

export type ResponseConsistencyRateResult = {
  metricCode: 'RCR';
  metricVersion: '0.1.0';
  targetType: string;
  targetValue: string;
  numerator: number;
  denominator: number;
  candidateCount: number;
  excludedCount: number;
  numericValue: number;
  baselineObservationId: string;
  assessedVariationLevels: string[];
  validObservationIds: string[];
  validExecutionIds: string[];
  excludedCandidates: Array<{
    observationId: string;
    observationCode: string;
    executionId: string | null;
    executionCode: string | null;
    reason: string;
  }>;
  inputChecksum: string;
  outputChecksum: string;
  querySnapshot: string;
};

const assessedVariationLevels = new Set(['none', 'low', 'medium', 'high']);
const consistentVariationLevels = new Set(['none', 'low']);

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getRelationshipID = (value: RelationshipValue): RecordID | null => {
  if (typeof value === 'string' || typeof value === 'number') return value;

  if (value && typeof value === 'object') {
    const id = value.id;
    return typeof id === 'string' || typeof id === 'number' ? id : null;
  }

  return null;
};

const getNestedValue = (value: unknown, key: string): unknown =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)[key]
    : undefined;

const normalizeTargetValue = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');

const stableHash = (value: unknown): string =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');

const round = (value: number, precision: number): number => {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

export const calculateResponseConsistencyRate = async ({
  payload,
  req,
  observationIds,
  targetType,
  targetValue,
  precision = 4,
}: {
  payload: Payload;
  req: PayloadRequest;
  observationIds: RecordID[];
  targetType: string;
  targetValue: string;
  precision?: number;
}): Promise<ResponseConsistencyRateResult> => {
  if (observationIds.length < 2) {
    throw new Error('RCR requires one baseline observation and at least one comparison observation.');
  }

  const expectedTargetType = targetType.trim().toLowerCase();
  const expectedTargetValue = normalizeTargetValue(targetValue);
  const validObservationIds: string[] = [];
  const validExecutionIds: string[] = [];
  const assessedLevels: string[] = [];
  const excludedCandidates: ResponseConsistencyRateResult['excludedCandidates'] = [];
  const usedExecutionIds = new Set<string>();
  const baselineIDs = new Set<string>();
  const inputRows: Array<Record<string, unknown>> = [];
  const documents = new Map<string, ObservationDocument>();
  let numerator = 0;

  for (const observationId of observationIds) {
    const observation = (await payload.findByID({
      collection: 'observations',
      id: observationId,
      depth: 0,
      draft: true,
      overrideAccess: true,
      req,
    })) as ObservationDocument;

    documents.set(String(observation.id), observation);
    const executionId = getRelationshipID(observation.promptExecution);
    const execution =
      executionId === null
        ? null
        : ((await payload.findByID({
            collection: 'prompt-executions',
            id: executionId,
            depth: 0,
            draft: true,
            overrideAccess: true,
            req,
          })) as ExecutionDocument);
    const observationCode =
      getString(observation.observationCode) || String(observation.id);
    const executionCode = execution
      ? getString(execution.executionCode) || String(execution.id)
      : null;
    const observationLifecycle = getString(observation.lifecycleStatus);
    const executionLifecycle = execution
      ? getString(execution.lifecycleStatus)
      : null;
    const reviewStatus = getString(
      getNestedValue(observation.qualityControl, 'reviewStatus'),
    );
    const observedTargetType = getString(
      getNestedValue(observation.visibilityCoding, 'targetType'),
    );
    const observedTargetValueRaw = getString(
      getNestedValue(observation.visibilityCoding, 'targetValue'),
    );
    const observedTargetValue = observedTargetValueRaw
      ? normalizeTargetValue(observedTargetValueRaw)
      : null;
    const baselineObservationId = getRelationshipID(
      getNestedValue(observation.comparison, 'baselineObservation') as RelationshipValue,
    );
    const variationLevel = getString(
      getNestedValue(observation.comparison, 'variationLevel'),
    );

    inputRows.push({
      observationId: String(observation.id),
      observationCode,
      observationLifecycle,
      reviewStatus,
      executionId: execution ? String(execution.id) : null,
      executionCode,
      executionLifecycle,
      targetType: observedTargetType,
      targetValue: observedTargetValue,
      baselineObservationId:
        baselineObservationId === null ? null : String(baselineObservationId),
      variationLevel,
    });

    const exclude = (reason: string) =>
      excludedCandidates.push({
        observationId: String(observation.id),
        observationCode,
        executionId: execution ? String(execution.id) : null,
        executionCode,
        reason,
      });

    if (!execution) {
      exclude('No prompt execution is linked to the observation.');
      continue;
    }

    if (executionLifecycle !== 'completed') {
      exclude(
        `Execution lifecycle is ${executionLifecycle || 'missing'}, not completed.`,
      );
      continue;
    }

    if (observationLifecycle !== 'validated') {
      exclude(
        `Observation lifecycle is ${observationLifecycle || 'missing'}, not validated.`,
      );
      continue;
    }

    if (reviewStatus !== 'accepted') {
      exclude(
        `Observation review status is ${reviewStatus || 'missing'}, not accepted.`,
      );
      continue;
    }

    if (observedTargetType !== expectedTargetType) {
      exclude(
        `Target type ${observedTargetType || 'missing'} does not match ${expectedTargetType}.`,
      );
      continue;
    }

    if (observedTargetValue !== expectedTargetValue) {
      exclude(
        `Target value ${observedTargetValue || 'missing'} does not match ${expectedTargetValue}.`,
      );
      continue;
    }

    if (baselineObservationId === null || variationLevel === 'not-assessed') {
      exclude('Frozen baseline observation; it is not part of the assessed-comparison denominator.');
      continue;
    }

    if (!assessedVariationLevels.has(variationLevel || '')) {
      exclude(
        `Variation level ${variationLevel || 'missing'} is not an assessed RCR category.`,
      );
      continue;
    }

    if (String(baselineObservationId) === String(observation.id)) {
      throw new Error(`RCR comparison ${observationCode} cannot reference itself as baseline.`);
    }

    const executionKey = String(execution.id);

    if (usedExecutionIds.has(executionKey)) {
      throw new Error(
        `RCR cannot use more than one accepted comparison observation for execution ${executionCode || executionKey}.`,
      );
    }

    usedExecutionIds.add(executionKey);
    baselineIDs.add(String(baselineObservationId));
    validObservationIds.push(String(observation.id));
    validExecutionIds.push(executionKey);
    assessedLevels.push(variationLevel as string);

    if (consistentVariationLevels.has(variationLevel as string)) numerator += 1;
  }

  if (baselineIDs.size !== 1) {
    throw new Error(
      `RCR requires exactly one frozen baseline across assessed comparisons; found ${baselineIDs.size}.`,
    );
  }

  const baselineObservationId = [...baselineIDs][0];
  const baseline = documents.get(baselineObservationId);

  if (!baseline) {
    throw new Error(
      `RCR baseline observation ${baselineObservationId} is not included in the candidate observation set.`,
    );
  }

  const baselineExecutionId = getRelationshipID(baseline.promptExecution);
  const baselineExecution =
    baselineExecutionId === null
      ? null
      : ((await payload.findByID({
          collection: 'prompt-executions',
          id: baselineExecutionId,
          depth: 0,
          draft: true,
          overrideAccess: true,
          req,
        })) as ExecutionDocument);
  const baselineReviewStatus = getString(
    getNestedValue(baseline.qualityControl, 'reviewStatus'),
  );
  const baselineTargetType = getString(
    getNestedValue(baseline.visibilityCoding, 'targetType'),
  );
  const baselineTargetValueRaw = getString(
    getNestedValue(baseline.visibilityCoding, 'targetValue'),
  );
  const baselineTargetValue = baselineTargetValueRaw
    ? normalizeTargetValue(baselineTargetValueRaw)
    : null;

  if (
    !baselineExecution ||
    getString(baselineExecution.lifecycleStatus) !== 'completed' ||
    getString(baseline.lifecycleStatus) !== 'validated' ||
    baselineReviewStatus !== 'accepted' ||
    baselineTargetType !== expectedTargetType ||
    baselineTargetValue !== expectedTargetValue
  ) {
    throw new Error(
      'RCR baseline must be a completed, validated, accepted and target-matched observation.',
    );
  }

  const denominator = validObservationIds.length;

  if (denominator === 0) {
    throw new Error('RCR is undefined because no valid assessed comparisons remain.');
  }

  const numericValue = round(numerator / denominator, precision);
  const normalizedInputRows = [...inputRows].sort((left, right) =>
    String(left.observationCode).localeCompare(String(right.observationCode)),
  );
  const inputChecksum = stableHash(normalizedInputRows);
  const outputPayload = {
    metricCode: 'RCR' as const,
    metricVersion: '0.1.0' as const,
    targetType: expectedTargetType,
    targetValue: expectedTargetValue,
    numerator,
    denominator,
    candidateCount: observationIds.length,
    excludedCount: excludedCandidates.length,
    numericValue,
    baselineObservationId,
    assessedVariationLevels: assessedLevels,
  };

  return {
    ...outputPayload,
    validObservationIds,
    validExecutionIds,
    excludedCandidates,
    inputChecksum,
    outputChecksum: stableHash(outputPayload),
    querySnapshot: JSON.stringify(
      {
        targetType: expectedTargetType,
        targetValue: expectedTargetValue,
        baselineObservationId,
        requiredExecutionLifecycle: 'completed',
        requiredObservationLifecycle: 'validated',
        requiredObservationReviewStatus: 'accepted',
        consistentVariationLevels: ['none', 'low'],
        assessedVariationLevels: ['none', 'low', 'medium', 'high'],
        missingDataPolicy: 'exclude-and-report',
        candidateObservationIds: observationIds.map(String),
        excludedCandidates,
      },
      null,
      2,
    ),
  };
};
