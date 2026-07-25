import { APIError, type CollectionBeforeValidateHook } from 'payload';

type RelationshipValue =
  | string
  | number
  | { id?: string | number | null }
  | null
  | undefined;

type EvidenceData = Record<string, unknown> & {
  promptExecution?: RelationshipValue;
  observation?: RelationshipValue;
};

type PromptExecutionContext = Record<string, unknown> & {
  project?: RelationshipValue;
  benchmark?: RelationshipValue;
  experiment?: RelationshipValue;
  prompt?: RelationshipValue;
  aiSystem?: RelationshipValue;
  executedBy?: RelationshipValue;
};

type ObservationContext = Record<string, unknown> & {
  promptExecution?: RelationshipValue;
  project?: RelationshipValue;
  benchmark?: RelationshipValue;
  experiment?: RelationshipValue;
  prompt?: RelationshipValue;
  aiSystem?: RelationshipValue;
};

const getRelationshipId = (value: RelationshipValue): string | number | null => {
  if (typeof value === 'string' || typeof value === 'number') return value;

  if (value && typeof value === 'object') {
    const id = value.id;
    return typeof id === 'string' || typeof id === 'number' ? id : null;
  }

  return null;
};

const sameRelationship = (
  left: string | number | null,
  right: string | number | null,
) => left !== null && right !== null && String(left) === String(right);

const throwContextConflict = (message: string): never => {
  throw new APIError(message, 409);
};

export const inheritEvidenceExecutionContext: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const incomingData = (data || {}) as EvidenceData;
  const previousData = (originalDoc || {}) as EvidenceData;
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
  })) as PromptExecutionContext;

  const project = getRelationshipId(execution.project);
  const benchmark = getRelationshipId(execution.benchmark);
  const experiment = getRelationshipId(execution.experiment);
  const prompt = getRelationshipId(execution.prompt);
  const aiSystem = getRelationshipId(execution.aiSystem);
  const collectedBy = getRelationshipId(execution.executedBy);

  if (!project || !experiment || !prompt || !aiSystem || !collectedBy) {
    throwContextConflict(
      'The selected prompt execution is missing required scientific context and cannot receive evidence records.',
    );
  }

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
    })) as ObservationContext;

    const observationExecution = getRelationshipId(observation.promptExecution);

    if (!sameRelationship(observationExecution, promptExecutionId)) {
      throwContextConflict(
        'The selected observation belongs to a different prompt execution and cannot be linked to this evidence record.',
      );
    }

    const observationContext: Array<[
      string,
      string | number | null,
      string | number | null,
    ]> = [
      ['project', getRelationshipId(observation.project), project],
      ['benchmark', getRelationshipId(observation.benchmark), benchmark],
      ['experiment', getRelationshipId(observation.experiment), experiment],
      ['prompt', getRelationshipId(observation.prompt), prompt],
      ['AI system', getRelationshipId(observation.aiSystem), aiSystem],
    ];

    const conflicts = observationContext
      .filter(([, observed, expected]) => {
        if (observed === null && expected === null) return false;
        return !sameRelationship(observed, expected);
      })
      .map(([label]) => label);

    if (conflicts.length > 0) {
      throwContextConflict(
        `The selected observation has scientific context that conflicts with its prompt execution: ${conflicts.join(', ')}.`,
      );
    }
  }

  return {
    ...incomingData,
    promptExecution: promptExecutionId,
    observation: observationId || null,
    project,
    benchmark: benchmark || null,
    experiment,
    prompt,
    aiSystem,
    collectedBy,
  };
};
