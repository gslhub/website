import type { Endpoint, PayloadRequest } from 'payload';

import { getResearchArtifactStorageReadiness } from '../storage/researchArtifactStorage';
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
  if (
    key === 'durable-storage' ||
    key === 'artifact-roundtrip-verified' ||
    key === 'backup-recovery-verified'
  ) {
    return '/admin/collections/research-artifacts';
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
    return 'Review the complete bilingual definition, add Validated At and Validated By, then move it to Validated.';
  }
  if (key === 'durable-storage') {
    return 'Configure private S3-compatible storage in the production environment and redeploy.';
  }
  if (key === 'artifact-roundtrip-verified') {
    return 'Upload and download a restricted artifact, compare SHA-256 values and set PILOT_ARTIFACT_ROUNDTRIP_VERIFIED_AT.';
  }
  if (key === 'backup-recovery-verified') {
    return 'Restore a verified MongoDB and object-storage backup in an isolated environment and set PILOT_BACKUP_RECOVERY_VERIFIED_AT.';
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
    const storage = getResearchArtifactStorageReadiness();

    const durableStorageCheck = checks.find(
      (check) => getString(check.key) === 'durable-storage',
    );

    if (durableStorageCheck) {
      durableStorageCheck.actual = {
        enabled: storage.enabled,
        provider: storage.provider,
        bucket: storage.bucket,
        region: storage.region,
        endpointHost: storage.endpointHost,
        artifactRoundtripVerifiedAt: storage.artifactRoundtripVerifiedAt,
        backupRecoveryVerifiedAt: storage.backupRecoveryVerifiedAt,
      };
    }

    checks.push(
      {
        key: 'artifact-roundtrip-verified',
        label: 'Restricted artifact upload and authenticated download preserve SHA-256',
        passed: storage.artifactRoundtripVerified,
        expected: 'PILOT_ARTIFACT_ROUNDTRIP_VERIFIED_AT contains a valid ISO-8601 timestamp',
        actual: storage.artifactRoundtripVerifiedAt,
      },
      {
        key: 'backup-recovery-verified',
        label: 'MongoDB and object-storage backup has been restored and verified in isolation',
        passed: storage.backupRecoveryVerified,
        expected: 'PILOT_BACKUP_RECOVERY_VERIFIED_AT contains a valid ISO-8601 timestamp',
        actual: storage.backupRecoveryVerifiedAt,
      },
    );

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
