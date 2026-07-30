import type { Payload, PayloadRequest } from 'payload';

import { getResearchArtifactStorageReadiness } from '../storage/researchArtifactStorage';

type RecordID = string | number;
type ScientificDocument = Record<string, unknown> & { id: RecordID };
type GeneratedRecord = {
  collectionSlug: 'prompt-executions';
  recordId: string;
  recordCode: string;
  label: string;
};

type PilotCollection =
  | 'projects'
  | 'benchmarks'
  | 'experiments'
  | 'prompts'
  | 'ai-systems'
  | 'researchers';

const PILOT = {
  projectCode: 'GSL-GEO-BENCH-01',
  benchmarkCode: 'GSL-BENCH-GEO-01',
  experimentCode: 'GSL-EXP-GEO-001',
  promptCode: 'GSL-PROMPT-GEO-001',
  aiSystemCode: 'GSL-AISYS-001',
  researcherSlug: 'eduardo-yauri',
  metricVersion: '0.1.0',
  metricCodes: ['AIR', 'CR', 'MCP', 'RCR'] as const,
  plannedRepetitions: 5,
  runLabel: 'GSLHub GEO Pilot Round 0.1 — Real controlled executions',
} as const;

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const hasRelationships = (value: unknown): boolean =>
  Array.isArray(value) ? value.length > 0 : Boolean(value);

const requireAdmin = (req: PayloadRequest) => {
  const user = req.user as { role?: unknown } | null | undefined;

  if (!user || user.role !== 'admin') {
    throw new Error('Only an administrator can provision real pilot executions.');
  }
};

const findUnique = async ({
  payload,
  req,
  collection,
  field,
  value,
  locale,
}: {
  payload: Payload;
  req: PayloadRequest;
  collection: PilotCollection;
  field: string;
  value: string;
  locale?: 'en' | 'es';
}): Promise<ScientificDocument> => {
  const result = await payload.find({
    collection,
    where: { [field]: { equals: value } },
    limit: 2,
    depth: 0,
    pagination: false,
    draft: true,
    overrideAccess: true,
    req,
    ...(locale ? { locale, fallbackLocale: false } : {}),
  });

  if (result.docs.length !== 1) {
    throw new Error(
      `Expected exactly one ${collection} record for ${field} = ${value}, found ${result.docs.length}.`,
    );
  }

  return result.docs[0] as ScientificDocument;
};

const assertScientificReadiness = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}) => {
  const [project, benchmark, experiment, prompt, aiSystem, researcher] =
    await Promise.all([
      findUnique({
        payload,
        req,
        collection: 'projects',
        field: 'projectCode',
        value: PILOT.projectCode,
      }),
      findUnique({
        payload,
        req,
        collection: 'benchmarks',
        field: 'benchmarkCode',
        value: PILOT.benchmarkCode,
      }),
      findUnique({
        payload,
        req,
        collection: 'experiments',
        field: 'experimentCode',
        value: PILOT.experimentCode,
      }),
      findUnique({
        payload,
        req,
        collection: 'prompts',
        field: 'promptCode',
        value: PILOT.promptCode,
        locale: 'en',
      }),
      findUnique({
        payload,
        req,
        collection: 'ai-systems',
        field: 'systemCode',
        value: PILOT.aiSystemCode,
      }),
      findUnique({
        payload,
        req,
        collection: 'researchers',
        field: 'slug',
        value: PILOT.researcherSlug,
      }),
    ]);

  const blockers: string[] = [];

  if (getString(project.status) !== 'active') {
    blockers.push(`Project must be Active; current value is ${getString(project.status) || 'missing'}.`);
  }

  if (getString(benchmark.lifecycleStatus) !== 'pilot') {
    blockers.push(
      `Benchmark must be Pilot; current value is ${getString(benchmark.lifecycleStatus) || 'missing'}.`,
    );
  }

  if (getString(experiment.lifecycleStatus) !== 'ready') {
    blockers.push(
      `Experiment must be Ready; current value is ${getString(experiment.lifecycleStatus) || 'missing'}.`,
    );
  }

  if (getNumber(experiment.plannedRepetitions) !== PILOT.plannedRepetitions) {
    blockers.push(
      `Experiment must declare ${PILOT.plannedRepetitions} planned repetitions.`,
    );
  }

  if (getString(prompt.lifecycleStatus) !== 'validated' || !prompt.validatedAt) {
    blockers.push('Prompt must be Validated and include Validated At.');
  }

  if (getString(aiSystem.lifecycleStatus) !== 'active') {
    blockers.push(
      `AI-system profile must be Active; current value is ${getString(aiSystem.lifecycleStatus) || 'missing'}.`,
    );
  }

  for (const metricCode of PILOT.metricCodes) {
    const result = await payload.find({
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

    if (result.docs.length !== 1) {
      blockers.push(
        `${metricCode} ${PILOT.metricVersion} must exist exactly once; found ${result.docs.length}.`,
      );
      continue;
    }

    const definition = result.docs[0] as ScientificDocument;
    const lifecycleStatus = getString(definition.lifecycleStatus);

    if (
      !new Set(['validated', 'active']).has(lifecycleStatus || '') ||
      !definition.validatedAt ||
      !hasRelationships(definition.validatedBy)
    ) {
      blockers.push(
        `${metricCode} ${PILOT.metricVersion} must be Validated or Active with Validated At and Validated By.`,
      );
    }
  }

  const storage = getResearchArtifactStorageReadiness();
  if (
    !storage.enabled ||
    !storage.bucket ||
    !storage.region ||
    storage.endpointHost === 'invalid-url'
  ) {
    blockers.push('Durable S3-compatible research-artifact storage must be enabled and configured.');
  }

  if (blockers.length > 0) {
    throw new Error(
      `Real pilot execution provisioning is blocked:\n- ${blockers.join('\n- ')}`,
    );
  }

  const promptText = getString(prompt.promptText);
  const promptVersion = getString(prompt.version);
  const promptLanguage = getString(prompt.promptLanguage);

  if (!promptText || !promptVersion || !promptLanguage) {
    throw new Error(
      'The validated prompt must expose Prompt Text, Version and Prompt Language in the English locale.',
    );
  }

  return {
    project,
    benchmark,
    experiment,
    prompt,
    aiSystem,
    researcher,
    promptText,
    promptVersion,
    promptLanguage,
  };
};

const normalizeExistingExecutions = async ({
  payload,
  req,
  experimentId,
}: {
  payload: Payload;
  req: PayloadRequest;
  experimentId: RecordID;
}): Promise<GeneratedRecord[] | null> => {
  const result = await payload.find({
    collection: 'prompt-executions',
    where: { experiment: { equals: experimentId } },
    limit: 100,
    depth: 0,
    pagination: false,
    draft: true,
    overrideAccess: true,
    req,
  });

  const realExecutions = result.docs.filter((document) => {
    const code = getString((document as Record<string, unknown>).executionCode);
    return code !== null && !code.startsWith('TEST-');
  }) as ScientificDocument[];

  if (realExecutions.length === 0) return null;

  const expectedCodes = new Set(
    Array.from({ length: PILOT.plannedRepetitions }, (_, index) =>
      `GSL-EXEC-GEO-${String(index + 1).padStart(4, '0')}`,
    ),
  );

  const validExistingSet =
    realExecutions.length === PILOT.plannedRepetitions &&
    realExecutions.every((execution) => {
      const code = getString(execution.executionCode);
      const repetitionNumber = getNumber(execution.repetitionNumber);
      const lifecycleStatus = getString(execution.lifecycleStatus);

      return (
        code !== null &&
        expectedCodes.has(code) &&
        repetitionNumber !== null &&
        code.endsWith(String(repetitionNumber).padStart(4, '0')) &&
        lifecycleStatus === 'planned'
      );
    });

  if (!validExistingSet) {
    throw new Error(
      'Real pilot executions already exist, but they are not the exact five planned GSL-EXEC-GEO-0001…0005 records. Review them manually before retrying.',
    );
  }

  return realExecutions
    .sort(
      (left, right) =>
        (getNumber(left.repetitionNumber) || 0) -
        (getNumber(right.repetitionNumber) || 0),
    )
    .map((execution) => ({
      collectionSlug: 'prompt-executions',
      recordId: String(execution.id),
      recordCode: getString(execution.executionCode) || String(execution.id),
      label: `Real pilot execution repetition ${getNumber(execution.repetitionNumber) || '?'}`,
    }));
};

export const provisionRealPilotExecutions = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<GeneratedRecord[]> => {
  requireAdmin(req);
  const context = await assertScientificReadiness({ payload, req });
  const existing = await normalizeExistingExecutions({
    payload,
    req,
    experimentId: context.experiment.id,
  });

  if (existing) return existing;

  const createdRecords: GeneratedRecord[] = [];

  try {
    for (let repetitionNumber = 1; repetitionNumber <= PILOT.plannedRepetitions; repetitionNumber += 1) {
      const executionCode = `GSL-EXEC-GEO-${String(repetitionNumber).padStart(4, '0')}`;
      const created = await payload.create({
        collection: 'prompt-executions',
        locale: 'en',
        fallbackLocale: false,
        draft: true,
        overrideAccess: true,
        req,
        data: {
          executionCode,
          lifecycleStatus: 'planned',
          repetitionNumber,
          runLabel: PILOT.runLabel,
          prompt: context.prompt.id,
          promptVersion: context.promptVersion,
          promptLanguage: context.promptLanguage,
          promptSnapshot: context.promptText,
          project: context.project.id,
          benchmark: context.benchmark.id,
          experiment: context.experiment.id,
          aiSystem: context.aiSystem.id,
          executedBy: context.researcher.id,
          executionEnvironment: {
            accessMode: 'authenticated-web',
            accountTier: 'Paid individual',
            modelVersion: getString(context.aiSystem.modelVersion) || undefined,
            interfaceVersion: getString(context.aiSystem.interfaceVersion) || undefined,
            releaseChannel: getString(context.aiSystem.releaseChannel) || 'production',
            locale: 'en-US',
            timezone: 'Europe/Madrid',
            location: 'Barcelona, Spain',
            webAccessEnabled: true,
            searchModeSelection: 'manual',
            newSessionConfirmed: false,
            memoryEnabled: false,
            customInstructionsEnabled: false,
          },
          response: {
            status: 'not-executed',
            format: 'markdown',
            sourcesPanelShown: false,
            explicitCitationsShown: false,
            sourceLinksShown: false,
            visibleCitationCount: 0,
          },
          integrity: {
            evidenceNotes:
              'Real pilot execution reserved before capture. No response or evidence has yet been collected.',
          },
          qualityControl: {
            reviewStatus: 'pending',
            reviewers: [],
          },
          notes:
            'Permanent scientific record for the first controlled GSLHub GEO pilot. Do not delete through test-data cleanup.',
          _status: 'draft',
        },
      });

      createdRecords.push({
        collectionSlug: 'prompt-executions',
        recordId: String(created.id),
        recordCode: executionCode,
        label: `Real pilot execution repetition ${repetitionNumber}`,
      });
    }

    return createdRecords;
  } catch (error) {
    for (const record of [...createdRecords].reverse()) {
      await payload
        .delete({
          collection: 'prompt-executions',
          id: record.recordId,
          overrideAccess: true,
          req,
        })
        .catch(() => undefined);
    }

    throw error;
  }
};
