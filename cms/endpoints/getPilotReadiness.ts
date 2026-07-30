import type { Endpoint, Payload, PayloadRequest } from 'payload';

import { getResearchArtifactStorageReadiness } from '../storage/researchArtifactStorage';

type RecordID = string | number;
type PilotCollection =
  | 'projects'
  | 'benchmarks'
  | 'experiments'
  | 'prompts'
  | 'ai-systems'
  | 'metric-definitions';

type ScientificDocument = Record<string, unknown> & {
  id: RecordID;
};

type AdminUser = {
  role?: unknown;
};

type ReadinessCheck = {
  key: string;
  label: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  recordId?: string | null;
};

const PILOT = {
  projectCode: 'GSL-GEO-BENCH-01',
  benchmarkCode: 'GSL-BENCH-GEO-01',
  experimentCode: 'GSL-EXP-GEO-001',
  promptCode: 'GSL-PROMPT-GEO-001',
  aiSystemCode: 'GSL-AISYS-001',
  metricVersion: '0.1.0',
  metricCodes: ['AIR', 'CR', 'MCP', 'RCR'] as const,
  plannedRepetitions: 5,
} as const;

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const getRelationshipCount = (value: unknown): number => {
  if (Array.isArray(value)) return value.length;
  return value ? 1 : 0;
};

const findUnique = async ({
  payload,
  req,
  collection,
  field,
  value,
}: {
  payload: Payload;
  req: PayloadRequest;
  collection: PilotCollection;
  field: string;
  value: string;
}): Promise<ScientificDocument | null> => {
  const result = await payload.find({
    collection,
    where: { [field]: { equals: value } },
    limit: 2,
    depth: 0,
    pagination: false,
    draft: true,
    overrideAccess: true,
    req,
  });

  if (result.docs.length !== 1) return null;
  return result.docs[0] as ScientificDocument;
};

const recordCheck = ({
  key,
  label,
  document,
  field,
  expected,
}: {
  key: string;
  label: string;
  document: ScientificDocument | null;
  field: string;
  expected: unknown;
}): ReadinessCheck => {
  const actual = document ? document[field] ?? null : null;

  return {
    key,
    label,
    passed: document !== null && actual === expected,
    expected,
    actual,
    recordId: document ? String(document.id) : null,
  };
};

export const getPilotReadinessEndpoint: Endpoint = {
  path: '/pilot-readiness',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    const user = req.user as AdminUser | null | undefined;

    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Only an administrator can inspect first-pilot readiness.' },
        { status: 403 },
      );
    }

    const [project, benchmark, experiment, prompt, aiSystem, ...metricDefinitions] =
      await Promise.all([
        findUnique({
          payload: req.payload,
          req,
          collection: 'projects',
          field: 'projectCode',
          value: PILOT.projectCode,
        }),
        findUnique({
          payload: req.payload,
          req,
          collection: 'benchmarks',
          field: 'benchmarkCode',
          value: PILOT.benchmarkCode,
        }),
        findUnique({
          payload: req.payload,
          req,
          collection: 'experiments',
          field: 'experimentCode',
          value: PILOT.experimentCode,
        }),
        findUnique({
          payload: req.payload,
          req,
          collection: 'prompts',
          field: 'promptCode',
          value: PILOT.promptCode,
        }),
        findUnique({
          payload: req.payload,
          req,
          collection: 'ai-systems',
          field: 'systemCode',
          value: PILOT.aiSystemCode,
        }),
        ...PILOT.metricCodes.map(async (metricCode) => {
          const result = await req.payload.find({
            collection: 'metric-definitions',
            where: {
              and: [
                { metricCode: { equals: metricCode } },
                { version: { equals: PILOT.metricVersion } },
              ],
            },
            limit: 2,
            depth: 0,
            pagination: false,
            draft: true,
            overrideAccess: true,
            req,
          });

          return result.docs.length === 1
            ? (result.docs[0] as ScientificDocument)
            : null;
        }),
      ]);

    const checks: ReadinessCheck[] = [
      recordCheck({
        key: 'project-active',
        label: 'Project is scientifically active',
        document: project,
        field: 'status',
        expected: 'active',
      }),
      recordCheck({
        key: 'benchmark-pilot',
        label: 'Benchmark is frozen at Pilot',
        document: benchmark,
        field: 'lifecycleStatus',
        expected: 'pilot',
      }),
      recordCheck({
        key: 'experiment-ready',
        label: 'Experiment is frozen at Ready',
        document: experiment,
        field: 'lifecycleStatus',
        expected: 'ready',
      }),
      {
        key: 'experiment-repetitions',
        label: 'Experiment declares five planned repetitions',
        passed:
          experiment !== null &&
          getNumber(experiment.plannedRepetitions) === PILOT.plannedRepetitions,
        expected: PILOT.plannedRepetitions,
        actual: experiment ? getNumber(experiment.plannedRepetitions) : null,
        recordId: experiment ? String(experiment.id) : null,
      },
      recordCheck({
        key: 'prompt-validated',
        label: 'Prompt wording and version are validated',
        document: prompt,
        field: 'lifecycleStatus',
        expected: 'validated',
      }),
      recordCheck({
        key: 'ai-system-active',
        label: 'AI-system evaluation profile is active',
        document: aiSystem,
        field: 'lifecycleStatus',
        expected: 'active',
      }),
    ];

    for (const [index, metricCode] of PILOT.metricCodes.entries()) {
      const definition = metricDefinitions[index];
      const lifecycleStatus = getString(definition?.lifecycleStatus);
      const validatedAt = definition?.validatedAt ?? null;
      const validatedByCount = getRelationshipCount(definition?.validatedBy);

      checks.push({
        key: `metric-${metricCode.toLowerCase()}-validated`,
        label: `${metricCode} ${PILOT.metricVersion} is validated and attributed`,
        passed:
          definition !== null &&
          new Set(['validated', 'active']).has(lifecycleStatus || '') &&
          Boolean(validatedAt) &&
          validatedByCount > 0,
        expected: {
          lifecycleStatus: 'validated or active',
          validatedAt: 'present',
          validatedBy: 'at least one researcher',
        },
        actual: definition
          ? {
              lifecycleStatus,
              validatedAt,
              validatedByCount,
            }
          : null,
        recordId: definition ? String(definition.id) : null,
      });
    }

    const storage = getResearchArtifactStorageReadiness();
    checks.push({
      key: 'durable-storage',
      label: 'Durable object storage is enabled and configured',
      passed:
        storage.enabled &&
        Boolean(storage.bucket) &&
        Boolean(storage.region) &&
        storage.endpointHost !== 'invalid-url',
      expected: 'enabled S3-compatible private storage',
      actual: {
        enabled: storage.enabled,
        provider: storage.provider,
        bucket: storage.bucket,
        region: storage.region,
        endpointHost: storage.endpointHost,
      },
    });

    let plannedExecutions = 0;
    let nonTestExecutions = 0;

    if (experiment) {
      const executions = await req.payload.find({
        collection: 'prompt-executions',
        where: { experiment: { equals: experiment.id } },
        limit: 100,
        depth: 0,
        pagination: false,
        draft: true,
        overrideAccess: true,
        req,
      });

      const realExecutions = executions.docs.filter((execution) => {
        const code = getString(
          (execution as Record<string, unknown>).executionCode,
        );
        return code !== null && !code.startsWith('TEST-');
      });

      nonTestExecutions = realExecutions.length;
      plannedExecutions = realExecutions.filter(
        (execution) =>
          getString((execution as Record<string, unknown>).lifecycleStatus) ===
          'planned',
      ).length;
    }

    const scientificAndStorageReady = checks.every((check) => check.passed);
    const readyToRunExecutions =
      scientificAndStorageReady && plannedExecutions === PILOT.plannedRepetitions;

    return Response.json({
      pilot: PILOT,
      scientificAndStorageReady,
      readyToRunExecutions,
      executionInventory: {
        nonTestExecutions,
        plannedExecutions,
        expectedPlannedExecutions: PILOT.plannedRepetitions,
      },
      checks,
      blockers: checks.filter((check) => !check.passed),
      nextAction: !scientificAndStorageReady
        ? 'Resolve the reported blockers before creating real execution records.'
        : plannedExecutions !== PILOT.plannedRepetitions
          ? 'Create exactly five real planned Prompt Executions with GSL-EXEC codes.'
          : 'The controlled execution round can begin under the approved manual protocol.',
    });
  },
};
