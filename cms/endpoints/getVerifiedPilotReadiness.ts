import type { Endpoint, PayloadRequest } from 'payload';

import { getPilotReadinessEndpoint } from './getPilotReadiness';

type ReadinessCheck = {
  key?: unknown;
  label?: unknown;
  passed?: unknown;
  expected?: unknown;
  actual?: unknown;
  recordId?: unknown;
};

type ReadinessResponse = Record<string, unknown> & {
  checks?: unknown;
  executionInventory?: unknown;
};

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const getChecks = (value: unknown): ReadinessCheck[] =>
  Array.isArray(value)
    ? value.filter(
        (item): item is ReadinessCheck =>
          Boolean(item) && typeof item === 'object' && !Array.isArray(item),
      )
    : [];

const adminPathForCheck = (check: ReadinessCheck): string | null => {
  const key = getString(check.key);
  const recordId = getString(check.recordId);

  if (key === 'project-active' && recordId) {
    return `/admin/collections/projects/${recordId}`;
  }
  if (key === 'benchmark-pilot' && recordId) {
    return `/admin/collections/benchmarks/${recordId}`;
  }
  if ((key === 'experiment-ready' || key === 'experiment-repetitions') && recordId) {
    return `/admin/collections/experiments/${recordId}`;
  }
  if (key === 'prompt-validated' && recordId) {
    return `/admin/collections/prompts/${recordId}`;
  }
  if (key === 'ai-system-active' && recordId) {
    return `/admin/collections/ai-systems/${recordId}`;
  }
  if (key?.startsWith('metric-') && recordId) {
    return `/admin/collections/metric-definitions/${recordId}`;
  }
  if (key?.startsWith('metric-')) {
    return '/admin/collections/test-data-batches/create';
  }
  if (key === 'local-storage-location') {
    return '/admin/collections/research-artifacts';
  }
  if (key === 'local-storage-roundtrip') {
    return recordId
      ? `/admin/collections/storage-verifications/${recordId}`
      : '/admin/collections/storage-verifications/create';
  }
  if (key === 'local-storage-recovery') {
    return recordId
      ? `/admin/collections/storage-verifications/${recordId}`
      : '/admin/collections/test-data-batches/create';
  }

  return null;
};

const instructionForCheck = (check: ReadinessCheck): string => {
  const key = getString(check.key);

  if (key === 'benchmark-pilot') {
    return 'Review the protocol, systems, dates and metric registry, then move the benchmark from Planned to Pilot.';
  }
  if (key === 'experiment-ready') {
    return 'Review the final protocol, inclusion and exclusion criteria and variables, then move the experiment to Ready.';
  }
  if (key === 'prompt-validated') {
    return 'Review the exact wording and constraints, complete Validated At and move the prompt to Validated.';
  }
  if (key?.startsWith('metric-') && !getString(check.recordId)) {
    return 'Create an Administrative Batch using “Permanent pilot metric definitions”, run the action and review the four resulting definitions.';
  }
  if (key?.startsWith('metric-')) {
    return 'Complete the independent scientific review before moving the metric definition to Validated.';
  }
  if (key === 'local-storage-location') {
    return 'Ensure research artifacts use an absolute persistent local directory outside the Node deployment release.';
  }
  if (key === 'local-storage-roundtrip') {
    return 'Create the immutable roundtrip Storage Verification for the completed HTTP 200 → Restart → HTTP 200 → Redeploy → HTTP 200 test.';
  }
  if (key === 'local-storage-recovery') {
    return 'Create an Administrative Batch using “Verify local artifact backup/recovery” and run the controlled recovery drill; a permanent recovery audit will be created automatically.';
  }

  return `Resolve: ${getString(check.label) || key || 'unidentified readiness condition'}.`;
};

export const getVerifiedPilotReadinessEndpoint: Endpoint = {
  path: '/pilot-readiness',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    const baseResponse = await getPilotReadinessEndpoint.handler(req);

    if (!(baseResponse instanceof Response) || !baseResponse.ok) {
      return baseResponse;
    }

    const data = (await baseResponse.json()) as ReadinessResponse;
    const checks = getChecks(data.checks);

    const scientificAndStorageReady = checks.every((check) => check.passed === true);
    const inventory =
      data.executionInventory &&
      typeof data.executionInventory === 'object' &&
      !Array.isArray(data.executionInventory)
        ? (data.executionInventory as Record<string, unknown>)
        : {};
    const plannedExecutions = getNumber(inventory.plannedExecutions) || 0;
    const expectedPlannedExecutions =
      getNumber(inventory.expectedPlannedExecutions) || 5;
    const readyToRunExecutions =
      scientificAndStorageReady && plannedExecutions === expectedPlannedExecutions;
    const blockers = checks.filter((check) => check.passed !== true);
    const actionPlan = blockers.map((check, index) => ({
      order: index + 1,
      key: getString(check.key),
      label: getString(check.label),
      instruction: instructionForCheck(check),
      adminPath: adminPathForCheck(check),
    }));

    return Response.json({
      ...data,
      scientificAndStorageReady,
      readyToRunExecutions,
      checks,
      blockers,
      actionPlan,
      nextAction: !scientificAndStorageReady
        ? actionPlan[0]?.instruction || 'Resolve the reported readiness blockers.'
        : plannedExecutions !== expectedPlannedExecutions
          ? 'Run the permanent real pilot executions administrative action to create exactly five planned GSL-EXEC records.'
          : 'The controlled execution round can begin under the approved manual protocol.',
    });
  },
};
