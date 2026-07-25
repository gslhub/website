import type { CollectionBeforeValidateHook } from 'payload';

type PromptExecutionData = Record<string, unknown> & {
  lifecycleStatus?: unknown;
  executionDate?: unknown;
  response?: unknown;
};

type ResponseValue = Record<string, unknown> & {
  status?: unknown;
};

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value : null;

const getResponseStatus = (value: unknown): string | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  return getString((value as ResponseValue).status);
};

const statusesRequiringExecutionDate = new Set([
  'running',
  'completed',
  'failed',
  'excluded',
]);

export const validatePromptExecutionLifecycle: CollectionBeforeValidateHook = ({
  data,
  originalDoc,
}) => {
  const incoming = (data || {}) as PromptExecutionData;
  const previous = (originalDoc || {}) as PromptExecutionData;

  const lifecycleStatus = getString(incoming.lifecycleStatus ?? previous.lifecycleStatus) || 'planned';
  const executionDate = incoming.executionDate ?? previous.executionDate;
  const responseStatus =
    getResponseStatus(incoming.response) || getResponseStatus(previous.response) || 'not-executed';

  if (statusesRequiringExecutionDate.has(lifecycleStatus) && !executionDate) {
    throw new Error(
      `Prompt executions with lifecycle status "${lifecycleStatus}" require the actual execution date and time.`,
    );
  }

  if ((lifecycleStatus === 'planned' || lifecycleStatus === 'queued') && responseStatus !== 'not-executed') {
    throw new Error(
      `Prompt executions with lifecycle status "${lifecycleStatus}" must keep the response status as "Not executed".`,
    );
  }

  if (lifecycleStatus === 'completed' && responseStatus === 'not-executed') {
    throw new Error(
      'A completed prompt execution must record the observed response outcome.',
    );
  }

  return data;
};
