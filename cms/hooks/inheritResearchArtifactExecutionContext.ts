import type { CollectionBeforeValidateHook } from 'payload';

type RelationshipValue = string | number | { id?: string | number | null } | null | undefined;

type ResearchArtifactData = Record<string, unknown> & {
  promptExecution?: RelationshipValue;
};

type PromptExecutionContext = Record<string, unknown> & {
  project?: RelationshipValue;
  benchmark?: RelationshipValue;
  experiment?: RelationshipValue;
  prompt?: RelationshipValue;
  aiSystem?: RelationshipValue;
  executedBy?: RelationshipValue;
};

const getRelationshipId = (value: RelationshipValue): string | number | null => {
  if (typeof value === 'string' || typeof value === 'number') return value;

  if (value && typeof value === 'object') {
    const id = value.id;
    return typeof id === 'string' || typeof id === 'number' ? id : null;
  }

  return null;
};

export const inheritResearchArtifactExecutionContext: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const incomingData = (data || {}) as ResearchArtifactData;
  const previousData = (originalDoc || {}) as ResearchArtifactData;
  const promptExecutionId = getRelationshipId(
    incomingData.promptExecution ?? previousData.promptExecution,
  );

  if (!promptExecutionId) return data;

  const execution = (await req.payload.findByID({
    collection: 'prompt-executions',
    id: promptExecutionId,
    depth: 0,
    overrideAccess: false,
    req,
  })) as PromptExecutionContext;

  const project = getRelationshipId(execution.project);
  const benchmark = getRelationshipId(execution.benchmark);
  const experiment = getRelationshipId(execution.experiment);
  const prompt = getRelationshipId(execution.prompt);
  const aiSystem = getRelationshipId(execution.aiSystem);
  const collectedBy = getRelationshipId(execution.executedBy);

  if (!project || !experiment || !prompt || !aiSystem || !collectedBy) {
    throw new Error(
      'The selected prompt execution is missing required scientific context and cannot receive research artifacts.',
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
    collectedBy,
  };
};
