import { APIError, type CollectionBeforeValidateHook } from 'payload';

type RelationshipValue =
  | string
  | number
  | { id?: string | number | null }
  | null
  | undefined;

type CitationData = Record<string, unknown> & {
  promptExecution?: RelationshipValue;
  observation?: RelationshipValue;
  evidence?: RelationshipValue[] | RelationshipValue;
};

type ScientificContext = Record<string, unknown> & {
  promptExecution?: RelationshipValue;
  project?: RelationshipValue;
  benchmark?: RelationshipValue;
  experiment?: RelationshipValue;
  prompt?: RelationshipValue;
  aiSystem?: RelationshipValue;
};

type RequiredScientificContext = {
  project: string | number;
  benchmark: string | number | null;
  experiment: string | number;
  prompt: string | number;
  aiSystem: string | number;
};

const getRelationshipId = (value: RelationshipValue): string | number | null => {
  if (typeof value === 'string' || typeof value === 'number') return value;

  if (value && typeof value === 'object') {
    const id = value.id;
    return typeof id === 'string' || typeof id === 'number' ? id : null;
  }

  return null;
};

const getRelationshipIds = (
  value: RelationshipValue[] | RelationshipValue,
): Array<string | number> => {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return values
    .map(getRelationshipId)
    .filter((id): id is string | number => id !== null);
};

const sameRelationship = (
  left: string | number | null,
  right: string | number | null,
) => left !== null && right !== null && String(left) === String(right);

const throwContextConflict = (message: string): never => {
  throw new APIError(message, 409);
};

const requireRelationship = (
  value: string | number | null,
  fieldLabel: string,
): string | number => {
  if (value === null) {
    throwContextConflict(
      `The selected prompt execution is missing its required ${fieldLabel} relationship and cannot receive citation records.`,
    );
  }

  return value;
};

const validateRelatedContext = ({
  record,
  expectedExecution,
  expectedContext,
  label,
}: {
  record: ScientificContext;
  expectedExecution: string | number;
  expectedContext: RequiredScientificContext;
  label: string;
}) => {
  const recordExecution = getRelationshipId(record.promptExecution);

  if (!sameRelationship(recordExecution, expectedExecution)) {
    throwContextConflict(
      `The selected ${label} belongs to a different prompt execution and cannot be linked to this citation record.`,
    );
  }

  const comparisons: Array<[
    string,
    string | number | null,
    string | number | null,
  ]> = [
    ['project', getRelationshipId(record.project), expectedContext.project],
    ['benchmark', getRelationshipId(record.benchmark), expectedContext.benchmark],
    ['experiment', getRelationshipId(record.experiment), expectedContext.experiment],
    ['prompt', getRelationshipId(record.prompt), expectedContext.prompt],
    ['AI system', getRelationshipId(record.aiSystem), expectedContext.aiSystem],
  ];

  const conflicts = comparisons
    .filter(([, actual, expected]) => {
      if (actual === null && expected === null) return false;
      return !sameRelationship(actual, expected);
    })
    .map(([field]) => field);

  if (conflicts.length > 0) {
    throwContextConflict(
      `The selected ${label} has scientific context that conflicts with its prompt execution: ${conflicts.join(', ')}.`,
    );
  }
};

export const inheritCitationExecutionContext: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const incomingData = (data || {}) as CitationData;
  const previousData = (originalDoc || {}) as CitationData;
  const promptExecutionId = getRelationshipId(
    incomingData.promptExecution ?? previousData.promptExecution,
  );

  if (!promptExecutionId) return data;

  const execution = (await req.payload.findByID({
    collection: 'prompt-executions',
    id: promptExecutionId,
    depth: 0,
    draft: true,
    overrideAccess: true,
    req,
  })) as ScientificContext;

  const expectedContext: RequiredScientificContext = {
    project: requireRelationship(getRelationshipId(execution.project), 'project'),
    benchmark: getRelationshipId(execution.benchmark),
    experiment: requireRelationship(
      getRelationshipId(execution.experiment),
      'experiment',
    ),
    prompt: requireRelationship(getRelationshipId(execution.prompt), 'prompt'),
    aiSystem: requireRelationship(
      getRelationshipId(execution.aiSystem),
      'AI system',
    ),
  };

  const observationId = getRelationshipId(
    incomingData.observation ?? previousData.observation,
  );

  if (observationId) {
    const observation = (await req.payload.findByID({
      collection: 'observations',
      id: observationId,
      depth: 0,
      draft: true,
      overrideAccess: true,
      req,
    })) as ScientificContext;

    validateRelatedContext({
      record: observation,
      expectedExecution: promptExecutionId,
      expectedContext,
      label: 'observation',
    });
  }

  const evidenceIds = getRelationshipIds(
    incomingData.evidence ?? previousData.evidence,
  );

  for (const evidenceId of evidenceIds) {
    const evidenceRecord = (await req.payload.findByID({
      collection: 'evidence',
      id: evidenceId,
      depth: 0,
      draft: true,
      overrideAccess: true,
      req,
    })) as ScientificContext;

    validateRelatedContext({
      record: evidenceRecord,
      expectedExecution: promptExecutionId,
      expectedContext,
      label: 'evidence record',
    });
  }

  return {
    ...incomingData,
    promptExecution: promptExecutionId,
    observation: observationId || null,
    evidence: evidenceIds,
    project: expectedContext.project,
    benchmark: expectedContext.benchmark || null,
    experiment: expectedContext.experiment,
    prompt: expectedContext.prompt,
    aiSystem: expectedContext.aiSystem,
  };
};
