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
  qualityControl?: unknown;
};

type ExecutionDocument = Record<string, unknown> & {
  id: RecordID;
  executionCode?: unknown;
  lifecycleStatus?: unknown;
};

export type MeanCitationPositionResult = {
  metricCode: 'MCP';
  metricVersion: '0.1.0';
  targetType: string;
  targetValue: string;
  positionSum: number;
  denominator: number;
  candidateCount: number;
  excludedCount: number;
  numericValue: number;
  eligiblePositions: number[];
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

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getBoolean = (value: unknown): boolean | null =>
  typeof value === 'boolean' ? value : null;

const getPositiveInteger = (value: unknown): number | null =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1
    ? value
    : null;

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

export const calculateMeanCitationPosition = async ({
  payload,
  req,
  observationIds,
  targetType,
  targetValue,
  precision = 2,
}: {
  payload: Payload;
  req: PayloadRequest;
  observationIds: RecordID[];
  targetType: string;
  targetValue: string;
  precision?: number;
}): Promise<MeanCitationPositionResult> => {
  if (observationIds.length === 0) {
    throw new Error('MCP requires at least one candidate observation.');
  }

  const expectedTargetType = targetType.trim().toLowerCase();
  const expectedTargetValue = normalizeTargetValue(targetValue);
  const validObservationIds: string[] = [];
  const validExecutionIds: string[] = [];
  const eligiblePositions: number[] = [];
  const excludedCandidates: MeanCitationPositionResult['excludedCandidates'] = [];
  const usedExecutionIds = new Set<string>();
  const inputRows: Array<Record<string, unknown>> = [];

  for (const observationId of observationIds) {
    const observation = (await payload.findByID({
      collection: 'observations',
      id: observationId,
      depth: 0,
      draft: true,
      overrideAccess: true,
      req,
    })) as ObservationDocument;

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
    const cited = getBoolean(
      getNestedValue(observation.visibilityCoding, 'cited'),
    );
    const citationPosition = getPositiveInteger(
      getNestedValue(observation.visibilityCoding, 'citationPosition'),
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
      cited,
      citationPosition,
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

    const executionKey = String(execution.id);

    if (usedExecutionIds.has(executionKey)) {
      throw new Error(
        `MCP cannot use more than one accepted target-matched observation for execution ${executionCode || executionKey}.`,
      );
    }

    usedExecutionIds.add(executionKey);

    if (cited !== true) {
      exclude('The evaluated target is not cited in this valid observation.');
      continue;
    }

    if (citationPosition === null) {
      exclude(
        'The evaluated target is cited, but no valid one-based citation position was recorded.',
      );
      continue;
    }

    validObservationIds.push(String(observation.id));
    validExecutionIds.push(executionKey);
    eligiblePositions.push(citationPosition);
  }

  const denominator = eligiblePositions.length;

  if (denominator === 0) {
    throw new Error(
      'MCP is undefined because no validated, accepted and target-matched cited observation has a valid citation position.',
    );
  }

  const positionSum = eligiblePositions.reduce((total, position) => total + position, 0);
  const numericValue = round(positionSum / denominator, precision);
  const normalizedInputRows = [...inputRows].sort((left, right) =>
    String(left.observationCode).localeCompare(String(right.observationCode)),
  );
  const inputChecksum = stableHash(normalizedInputRows);
  const outputPayload = {
    metricCode: 'MCP' as const,
    metricVersion: '0.1.0' as const,
    targetType: expectedTargetType,
    targetValue: expectedTargetValue,
    positionSum,
    denominator,
    candidateCount: observationIds.length,
    excludedCount: excludedCandidates.length,
    numericValue,
    eligiblePositions,
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
        requiredExecutionLifecycle: 'completed',
        requiredObservationLifecycle: 'validated',
        requiredObservationReviewStatus: 'accepted',
        requiredCitationOutcome: true,
        requiredCitationPosition: 'integer >= 1',
        missingDataPolicy: 'exclude-and-report',
        candidateObservationIds: observationIds.map(String),
        eligiblePositions,
        excludedCandidates,
      },
      null,
      2,
    ),
  };
};
