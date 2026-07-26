import { APIError, type CollectionBeforeValidateHook } from 'payload';

type RelationshipValue =
  | string
  | number
  | { id?: string | number | null }
  | null
  | undefined;

type MetricData = Record<string, unknown> & {
  scopeType?: unknown;
  project?: RelationshipValue;
  benchmark?: RelationshipValue;
  experiment?: RelationshipValue;
  prompt?: RelationshipValue;
  aiSystem?: RelationshipValue;
  promptExecutions?: RelationshipValue[] | RelationshipValue;
  observations?: RelationshipValue[] | RelationshipValue;
  citations?: RelationshipValue[] | RelationshipValue;
  evidence?: RelationshipValue[] | RelationshipValue;
};

type ScientificContext = Record<string, unknown> & {
  project?: RelationshipValue;
  benchmark?: RelationshipValue;
  experiment?: RelationshipValue;
  prompt?: RelationshipValue;
  aiSystem?: RelationshipValue;
};

type ExpectedMetricContext = {
  project: string | number;
  benchmark: string | number;
  experiment: string | number | null;
  prompt: string | number | null;
  aiSystem: string | number | null;
};

type ContextCollection =
  | 'prompt-executions'
  | 'observations'
  | 'citations'
  | 'evidence';

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

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
      `Metric records require a ${fieldLabel} relationship before their analytical inputs can be validated.`,
    );
  }

  return value as string | number;
};

const validateRecordContext = ({
  record,
  expected,
  label,
}: {
  record: ScientificContext;
  expected: ExpectedMetricContext;
  label: string;
}) => {
  const comparisons: Array<[
    string,
    string | number | null,
    string | number | null,
    boolean,
  ]> = [
    ['project', getRelationshipId(record.project), expected.project, true],
    ['benchmark', getRelationshipId(record.benchmark), expected.benchmark, true],
    ['experiment', getRelationshipId(record.experiment), expected.experiment, expected.experiment !== null],
    ['prompt', getRelationshipId(record.prompt), expected.prompt, expected.prompt !== null],
    ['AI system', getRelationshipId(record.aiSystem), expected.aiSystem, expected.aiSystem !== null],
  ];

  const conflicts = comparisons
    .filter(([, actual, expectedValue, shouldCompare]) => {
      if (!shouldCompare) return false;
      return !sameRelationship(actual, expectedValue);
    })
    .map(([field]) => field);

  if (conflicts.length > 0) {
    throwContextConflict(
      `The selected ${label} has scientific context that conflicts with this metric record: ${conflicts.join(', ')}.`,
    );
  }
};

const validateScopeRequirements = ({
  scopeType,
  experiment,
  prompt,
  aiSystem,
  promptExecutions,
  observations,
}: {
  scopeType: string;
  experiment: string | number | null;
  prompt: string | number | null;
  aiSystem: string | number | null;
  promptExecutions: Array<string | number>;
  observations: Array<string | number>;
}) => {
  if (scopeType === 'experiment' && experiment === null) {
    throwContextConflict('An experiment-scoped metric requires an Experiment relationship.');
  }

  if (scopeType === 'prompt' && prompt === null) {
    throwContextConflict('A prompt-scoped metric requires a Prompt relationship.');
  }

  if (scopeType === 'ai-system' && aiSystem === null) {
    throwContextConflict('An AI-system-scoped metric requires an AI System relationship.');
  }

  if (scopeType === 'prompt-execution' && promptExecutions.length !== 1) {
    throwContextConflict(
      'A prompt-execution-scoped metric must reference exactly one Prompt Execution.',
    );
  }

  if (scopeType === 'observation' && observations.length !== 1) {
    throwContextConflict(
      'An observation-scoped metric must reference exactly one Observation.',
    );
  }
};

export const validateMetricScientificContext: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const incoming = (data || {}) as MetricData;
  const previous = (originalDoc || {}) as MetricData;

  const project = requireRelationship(
    getRelationshipId(incoming.project ?? previous.project),
    'Project',
  );
  const benchmark = requireRelationship(
    getRelationshipId(incoming.benchmark ?? previous.benchmark),
    'Benchmark',
  );
  const experiment = getRelationshipId(incoming.experiment ?? previous.experiment);
  const prompt = getRelationshipId(incoming.prompt ?? previous.prompt);
  const aiSystem = getRelationshipId(incoming.aiSystem ?? previous.aiSystem);
  const scopeType = getString(incoming.scopeType ?? previous.scopeType) || 'experiment';

  const promptExecutions = getRelationshipIds(
    incoming.promptExecutions ?? previous.promptExecutions,
  );
  const observations = getRelationshipIds(
    incoming.observations ?? previous.observations,
  );
  const citations = getRelationshipIds(incoming.citations ?? previous.citations);
  const evidence = getRelationshipIds(incoming.evidence ?? previous.evidence);

  validateScopeRequirements({
    scopeType,
    experiment,
    prompt,
    aiSystem,
    promptExecutions,
    observations,
  });

  const expected: ExpectedMetricContext = {
    project,
    benchmark,
    experiment,
    prompt,
    aiSystem,
  };

  const relationGroups: Array<{
    collection: ContextCollection;
    ids: Array<string | number>;
    label: string;
  }> = [
    {
      collection: 'prompt-executions',
      ids: promptExecutions,
      label: 'prompt execution',
    },
    { collection: 'observations', ids: observations, label: 'observation' },
    { collection: 'citations', ids: citations, label: 'citation' },
    { collection: 'evidence', ids: evidence, label: 'evidence record' },
  ];

  for (const group of relationGroups) {
    for (const id of group.ids) {
      const record = (await req.payload.findByID({
        collection: group.collection,
        id,
        depth: 0,
        draft: true,
        overrideAccess: true,
        req,
      })) as ScientificContext;

      validateRecordContext({ record, expected, label: group.label });
    }
  }

  return {
    ...incoming,
    project,
    benchmark,
    experiment: experiment || null,
    prompt: prompt || null,
    aiSystem: aiSystem || null,
    promptExecutions,
    observations,
    citations,
    evidence,
  };
};
