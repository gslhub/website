import { APIError, type CollectionBeforeValidateHook } from 'payload';

type RelationshipValue =
  | string
  | number
  | { id?: string | number | null }
  | null
  | undefined;

type ObservationData = Record<string, unknown> & {
  promptExecution?: RelationshipValue;
};

type PromptExecutionContext = Record<string, unknown> & {
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

const throwContextConflict = (message: string): never => {
  throw new APIError(message, 409);
};

export const inheritObservationExecutionContext: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const incomingData = (data || {}) as ObservationData;
  const previousData = (originalDoc || {}) as ObservationData;
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

  if (!project || !experiment || !prompt || !aiSystem) {
    throwContextConflict(
      'The selected prompt execution is missing required scientific context and cannot receive observation records.',
    );
  }

  return {
    ...incomingData,
    promptExecution: promptExecutionId,
    project,
    benchmark: benchmark || null,
    experiment,
    prompt,
    aiSystem,
  };
};
