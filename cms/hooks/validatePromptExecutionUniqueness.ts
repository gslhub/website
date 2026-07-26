import { APIError, type CollectionBeforeValidateHook } from 'payload';

type RelationshipValue =
  | string
  | number
  | { id?: string | number | null }
  | null
  | undefined;

type PromptExecutionData = Record<string, unknown> & {
  id?: unknown;
  executionCode?: unknown;
  experiment?: RelationshipValue;
  prompt?: RelationshipValue;
  promptVersion?: unknown;
  aiSystem?: RelationshipValue;
  repetitionNumber?: unknown;
};

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isInteger(value) ? value : null;

const getRelationshipId = (value: RelationshipValue): string | number | null => {
  if (typeof value === 'string' || typeof value === 'number') return value;

  if (value && typeof value === 'object') {
    const id = value.id;
    return typeof id === 'string' || typeof id === 'number' ? id : null;
  }

  return null;
};

const getDocumentId = (value: unknown): string | number | null =>
  typeof value === 'string' || typeof value === 'number' ? value : null;

export const validatePromptExecutionUniqueness: CollectionBeforeValidateHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const incoming = (data || {}) as PromptExecutionData;
  const previous = (originalDoc || {}) as PromptExecutionData;

  const executionCode = getString(incoming.executionCode ?? previous.executionCode);

  // Disposable test batches intentionally reuse the same scientific condition
  // across independently owned batches. Their globally unique TEST execution code
  // and batch cleanup rules provide isolation without reserving real pilot slots.
  if (executionCode?.startsWith('TEST-')) return data;

  const experiment = getRelationshipId(incoming.experiment ?? previous.experiment);
  const prompt = getRelationshipId(incoming.prompt ?? previous.prompt);
  const promptVersion = getString(incoming.promptVersion ?? previous.promptVersion);
  const aiSystem = getRelationshipId(incoming.aiSystem ?? previous.aiSystem);
  const repetitionNumber = getNumber(
    incoming.repetitionNumber ?? previous.repetitionNumber,
  );

  if (
    experiment === null ||
    prompt === null ||
    promptVersion === null ||
    aiSystem === null ||
    repetitionNumber === null
  ) {
    return data;
  }

  const currentId =
    operation === 'update'
      ? getDocumentId(previous.id)
      : null;

  const matches = await req.payload.find({
    collection: 'prompt-executions',
    where: {
      and: [
        { experiment: { equals: experiment } },
        { prompt: { equals: prompt } },
        { promptVersion: { equals: promptVersion } },
        { aiSystem: { equals: aiSystem } },
        { repetitionNumber: { equals: repetitionNumber } },
        ...(currentId !== null ? [{ id: { not_equals: currentId } }] : []),
      ],
    },
    limit: 1,
    depth: 0,
    pagination: false,
    draft: true,
    overrideAccess: true,
    req,
  });

  if (matches.docs.length === 0) return data;

  const conflictingRecord = matches.docs[0] as PromptExecutionData;
  const conflictingCode =
    getString(conflictingRecord.executionCode) || 'another prompt execution';

  throw new APIError(
    `This controlled execution condition is already reserved by ${conflictingCode}. The combination of Experiment, Prompt, Prompt Version, AI System and Repetition Number must be unique. Create a new repetition or a new experiment instead of duplicating the condition.`,
    409,
  );
};
