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

export type AIRExcludedCandidate = {
  observationId: string;
  observationCode: string;
  executionId: string | null;
  executionCode: string | null;
  reason: string;
};

export type AnswerInclusionRateResult = {
  metricCode: 'AIR';
  metricVersion: '0.1.0';
  targetType: string;
  targetValue: string;
  numerator: number;
  denominator: number;
  candidateCount: number;
  excludedCount: number;
  numericValue: number;
  validObservationIds: string[];
  validExecutionIds: string[];
  excludedCandidates: AIRExcludedCandidate[];
  inputChecksum: string;
  outputChecksum: string;
  querySnapshot: string;
};

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getBoolean = (value: unknown): boolean | null =>
  typeof value === 'boolean' ? value : null;

const getRelationshipID = (value: RelationshipValue): RecordID | null => {
  if (typeof value === 'string' || typeof value === 'number') return value;

  if (value && typeof value === 'object') {
    const id = value.id;
    return typeof id === 'string' || typeof id === 'number' ? id : null;
  }

  return null;
};

const getNestedValue = (
  value: unknown,
  key: string,
): unknown => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return (value as Record<string, unknown>)[key];
};

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

export const calculateAnswerInclusionRate = async ({
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
}): Promise<AnswerInclusionRateResult> => {
  if (observationIds.length === 0) {
    throw new Error('AIR requires at least one candidate observation.');
  }

  const expectedTargetType = targetType.trim().toLowerCase();
  const expectedTargetValue = normalizeTargetValue(targetValue);
  const validObservationIds: string[] = [];
  const validExecutionIds: string[] = [];
  const excludedCandidates: AIRExcludedCandidate[] = [];
  const usedExecutionIds = new Set<string>();
  const inputRows: Array<Record<string, unknown>> = [];
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

    const executionId = getRelationshipID(observation.promptExecution);
    const observationCode =
      getString(observation.observationCode) || String(observation.id);
    let execution: ExecutionDocument | null = null;

    if (executionId !== null) {
      execution = (await payload.findByID({
        collection: 'prompt-executions',
        id: executionId,
        depth: 0,
        draft: true,
        overrideAccess: true,
        req,
      })) as ExecutionDocument;
    }

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
    const mentioned = getBoolean(
      getNestedValue(observation.visibilityCoding, 'mentioned'),
    );
    const observedTargetValue = observedTargetValueRaw
      ? normalizeTargetValue(observedTargetValueRaw)
      : null;

    const inputRow = {
      observationId: String(observation.id),
      observationCode,
      observationLifecycle,
      reviewStatus,
      executionId: execution ? String(execution.id) : null,
      executionCode,
      executionLifecycle,
      targetType: observedTargetType,
      targetValue: observedTargetValue,
      mentioned,
    };

    inputRows.push(inputRow);

    const exclude = (reason: string) => {
      excludedCandidates.push({
        observationId: String(observation.id),
        observationCode,
        executionId: execution ? String(execution.id) : null,
        executionCode,
        reason,
      });
    };

    if (!execution) {
      exclude('No prompt execution is linked to the observation.');
      continue;
    }

    if (executionLifecycle !== 'completed') {
      exclude(`Execution lifecycle is ${executionLifecycle || 'missing'}, not completed.`);
      continue;
    }

    if (observationLifecycle !== 'validated') {
      exclude(
        `Observation lifecycle is ${observationLifecycle || 'missing'}, not validated.`,
      );
      continue;
    }

    if (reviewStatus !== 'accepted') {
      exclude(`Observation review status is ${reviewStatus || 'missing'}, not accepted.`);
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

    if (mentioned === null) {
      exclude('The inclusion outcome is not codable as a boolean value.');
      continue;
    }

    const executionKey = String(execution.id);

    if (usedExecutionIds.has(executionKey)) {
      throw new Error(
        `AIR cannot use more than one accepted observation for execution ${executionCode || executionKey}.`,
      );
    }

    usedExecutionIds.add(executionKey);
    validObservationIds.push(String(observation.id));
    validExecutionIds.push(executionKey);

    if (mentioned) numerator += 1;
  }

  const denominator = validObservationIds.length;

  if (denominator === 0) {
    throw new Error(
      'AIR is undefined because no completed execution has one validated, accepted and target-matched observation.',
    );
  }

  const numericValue = round(numerator / denominator, precision);
  const normalizedInputRows = [...inputRows].sort((left, right) =>
    String(left.observationCode).localeCompare(String(right.observationCode)),
  );
  const inputChecksum = stableHash(normalizedInputRows);
  const outputPayload = {
    metricCode: 'AIR',
    metricVersion: '0.1.0',
    targetType: expectedTargetType,
    targetValue: expectedTargetValue,
    numerator,
    denominator,
    candidateCount: observationIds.length,
    excludedCount: excludedCandidates.length,
    numericValue,
  } as const;
  const outputChecksum = stableHash(outputPayload);

  return {
    ...outputPayload,
    validObservationIds,
    validExecutionIds,
    excludedCandidates,
    inputChecksum,
    outputChecksum,
    querySnapshot: JSON.stringify(
      {
        targetType: expectedTargetType,
        targetValue: expectedTargetValue,
        requiredExecutionLifecycle: 'completed',
        requiredObservationLifecycle: 'validated',
        requiredObservationReviewStatus: 'accepted',
        missingDataPolicy: 'exclude-and-report',
        candidateObservationIds: observationIds.map(String),
        excludedCandidates,
      },
      null,
      2,
    ),
  };
};
