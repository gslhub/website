import { APIError, type CollectionBeforeValidateHook } from 'payload';

type PromptDocument = Record<string, unknown> & {
  lifecycleStatus?: unknown;
  validatedAt?: unknown;
};

const hasOwn = (value: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const normalizeComparableValue = (value: unknown): unknown => {
  if (value === undefined || value === null) return null;
  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) {
    return value.map(normalizeComparableValue);
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;

    if (hasOwn(record, 'id')) {
      return normalizeComparableValue(record.id);
    }

    return Object.keys(record)
      .sort()
      .reduce<Record<string, unknown>>((normalized, key) => {
        normalized[key] = normalizeComparableValue(record[key]);
        return normalized;
      }, {});
  }

  return value;
};

const valuesMatch = (left: unknown, right: unknown) =>
  JSON.stringify(normalizeComparableValue(left)) ===
  JSON.stringify(normalizeComparableValue(right));

const throwConflict = (message: string): never => {
  throw new APIError(message, 409);
};

const alwaysImmutableFields = ['promptCode'] as const;

const sealedDefinitionFields = [
  'slug',
  'promptText',
  'promptType',
  'researchIntent',
  'version',
  'promptLanguage',
  'difficulty',
  'controlled',
  'executionInstructions',
  'expectedBehaviour',
  'variablePlaceholders',
  'constraints',
  'validatedAt',
  'project',
  'benchmarks',
  'experiments',
  'researchAreas',
] as const;

const sealedStatuses = new Set(['validated', 'active', 'deprecated', 'archived']);

const allowedTransitions: Record<string, Set<string>> = {
  planned: new Set(['under-review']),
  'under-review': new Set(['planned', 'validated']),
  validated: new Set(['active', 'deprecated', 'archived']),
  active: new Set(['deprecated', 'archived']),
  deprecated: new Set(['archived']),
  archived: new Set(),
};

const validateLifecycleTransition = ({
  incomingStatus,
  previousStatus,
}: {
  incomingStatus: string;
  previousStatus: string;
}) => {
  if (incomingStatus === previousStatus) return;

  const allowed = allowedTransitions[previousStatus];

  if (!allowed || !allowed.has(incomingStatus)) {
    throwConflict(
      `Prompt lifecycle status cannot change from "${previousStatus}" to "${incomingStatus}". Validate the prompt before activating it, and deprecate or archive frozen versions instead of reopening them.`,
    );
  }
};

const validateFrozenPromptRequirements = ({
  incoming,
  previous,
  lifecycleStatus,
}: {
  incoming: PromptDocument;
  previous: PromptDocument;
  lifecycleStatus: string;
}) => {
  if (!sealedStatuses.has(lifecycleStatus)) return;

  const validatedAt = incoming.validatedAt ?? previous.validatedAt;

  if (!validatedAt) {
    throwConflict(
      `A prompt with lifecycle status "${lifecycleStatus}" requires Validated At before its scientific definition can be frozen.`,
    );
  }
};

export const protectPromptDefinition: CollectionBeforeValidateHook = ({
  data,
  operation,
  originalDoc,
}) => {
  const incoming = (data || {}) as PromptDocument;
  const previous = (originalDoc || {}) as PromptDocument;
  const previousStatus = getString(previous.lifecycleStatus) || 'planned';
  const incomingStatus = getString(incoming.lifecycleStatus) || previousStatus;

  validateFrozenPromptRequirements({ incoming, previous, lifecycleStatus: incomingStatus });

  if (operation !== 'update' || !originalDoc) return data;

  validateLifecycleTransition({ incomingStatus, previousStatus });

  const protectedFields: string[] = [...alwaysImmutableFields];

  if (sealedStatuses.has(previousStatus)) {
    protectedFields.push(...sealedDefinitionFields);
  }

  const changedFields = protectedFields.filter(
    (field) =>
      hasOwn(incoming, field) &&
      !valuesMatch(incoming[field], previous[field]),
  );

  if (changedFields.length > 0) {
    throwConflict(
      `The validated prompt definition is frozen. Protected fields changed: ${changedFields.join(', ')}. Create a new prompt version instead of overwriting wording, constraints or execution conditions already used by scientific runs.`,
    );
  }

  return data;
};
