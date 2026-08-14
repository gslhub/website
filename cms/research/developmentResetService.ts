import type { Payload, PayloadRequest } from 'payload';

import { PILOT_METRIC_DEFINITIONS } from '../metrics/pilotMetricDefinitionRegistry';
import { synchronizePermanentPilotMetricDefinitions } from '../metrics/pilotMetricDefinitionService';
import { assertDevelopmentMode, getResearchEnvironment } from './researchEnvironment';

type RecordID = string | number;
type ResetScope = 'test' | 'final';
type ResettableCollection =
  | 'metrics'
  | 'citations'
  | 'evidence'
  | 'research-artifacts'
  | 'observations'
  | 'prompt-executions'
  | 'metric-definitions';

type ResetTarget = {
  collection: ResettableCollection;
  id: RecordID;
  code: string;
  reason: 'test-code' | 'development-pilot';
};

type DocumentRecord = Record<string, unknown> & { id: RecordID };

type ResetPreview = {
  mode: 'development' | 'doctoral';
  scope: ResetScope;
  deletions: Record<string, number>;
  totalDeletions: number;
  pilotMetricDefinitionsReset: number;
  testResearchers: Array<{ id: string; slug: string; name: string }>;
  preservedInfrastructureArtifacts: number;
  preservedInfrastructureExecutions: number;
  blockers: string[];
};

const TEST_CODE_SPECS: Array<{
  collection: ResettableCollection;
  codeField: string;
  drafts: boolean;
}> = [
  { collection: 'metrics', codeField: 'metricRecordCode', drafts: true },
  { collection: 'citations', codeField: 'citationCode', drafts: true },
  { collection: 'evidence', codeField: 'evidenceCode', drafts: true },
  { collection: 'research-artifacts', codeField: 'artifactCode', drafts: false },
  { collection: 'observations', codeField: 'observationCode', drafts: true },
  { collection: 'prompt-executions', codeField: 'executionCode', drafts: true },
  { collection: 'metric-definitions', codeField: 'definitionCode', drafts: true },
];

const DELETE_ORDER: ResettableCollection[] = [
  'metrics',
  'citations',
  'evidence',
  'research-artifacts',
  'observations',
  'prompt-executions',
  'metric-definitions',
];

const DEVELOPMENT_PILOT_EXECUTION_CODES = new Set(
  Array.from({ length: 5 }, (_, index) =>
    `GSL-EXEC-GEO-${String(index + 1).padStart(4, '0')}`,
  ),
);

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const getRelationshipID = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  const record = getRecord(value);
  const id = record.id;
  return typeof id === 'string' || typeof id === 'number' ? String(id) : null;
};

const getRelationshipIDs = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.flatMap((item) => {
        const id = getRelationshipID(item);
        return id ? [id] : [];
      })
    : [];

const requireAdmin = (req: PayloadRequest): RecordID => {
  const user = req.user as { id?: unknown; role?: unknown } | null | undefined;
  if (!user || user.role !== 'admin') {
    throw new Error('Only an administrator can preview or execute development resets.');
  }
  if (typeof user.id !== 'string' && typeof user.id !== 'number') {
    throw new Error('The administrator account does not expose a valid ID.');
  }
  return user.id;
};

const findAll = async ({
  payload,
  req,
  collection,
  drafts = false,
}: {
  payload: Payload;
  req: PayloadRequest;
  collection:
    | ResettableCollection
    | 'storage-verifications'
    | 'researchers';
  drafts?: boolean;
}): Promise<DocumentRecord[]> => {
  const result = await payload.find({
    collection,
    limit: 10000,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
    ...(drafts ? { draft: true } : {}),
  });

  return result.docs as DocumentRecord[];
};

const collectInfrastructureProtection = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}) => {
  const verifications = await findAll({
    payload,
    req,
    collection: 'storage-verifications',
  });
  const artifactIDs = new Set(
    verifications.flatMap((verification) => {
      const id = getRelationshipID(verification.artifact);
      return id ? [id] : [];
    }),
  );

  const artifacts = await findAll({
    payload,
    req,
    collection: 'research-artifacts',
  });
  const executionIDs = new Set<string>();

  for (const artifact of artifacts) {
    if (!artifactIDs.has(String(artifact.id))) continue;
    const executionID = getRelationshipID(artifact.promptExecution);
    if (executionID) executionIDs.add(executionID);
  }

  return { artifactIDs, executionIDs };
};

const targetKey = (target: ResetTarget) => `${target.collection}:${String(target.id)}`;

const collectTargets = async ({
  payload,
  req,
  scope,
}: {
  payload: Payload;
  req: PayloadRequest;
  scope: ResetScope;
}) => {
  const protectedInfrastructure = await collectInfrastructureProtection({ payload, req });
  const targets = new Map<string, ResetTarget>();

  for (const spec of TEST_CODE_SPECS) {
    const documents = await findAll({
      payload,
      req,
      collection: spec.collection,
      drafts: spec.drafts,
    });

    for (const document of documents) {
      const code = getString(document[spec.codeField]);
      if (!code?.startsWith('TEST-')) continue;

      if (
        spec.collection === 'research-artifacts' &&
        protectedInfrastructure.artifactIDs.has(String(document.id))
      ) {
        continue;
      }
      if (
        spec.collection === 'prompt-executions' &&
        protectedInfrastructure.executionIDs.has(String(document.id))
      ) {
        continue;
      }

      const target: ResetTarget = {
        collection: spec.collection,
        id: document.id,
        code,
        reason: 'test-code',
      };
      targets.set(targetKey(target), target);
    }
  }

  const pilotExecutionIDs = new Set<string>();

  if (scope === 'final') {
    const executions = await findAll({
      payload,
      req,
      collection: 'prompt-executions',
      drafts: true,
    });

    for (const execution of executions) {
      const code = getString(execution.executionCode);
      if (!code || !DEVELOPMENT_PILOT_EXECUTION_CODES.has(code)) continue;
      if (protectedInfrastructure.executionIDs.has(String(execution.id))) continue;

      pilotExecutionIDs.add(String(execution.id));
      const target: ResetTarget = {
        collection: 'prompt-executions',
        id: execution.id,
        code,
        reason: 'development-pilot',
      };
      targets.set(targetKey(target), target);
    }

    if (pilotExecutionIDs.size > 0) {
      const dependentSpecs: Array<{
        collection: ResettableCollection;
        codeField: string;
        drafts: boolean;
        relationField: 'promptExecution' | 'promptExecutions';
      }> = [
        { collection: 'metrics', codeField: 'metricRecordCode', drafts: true, relationField: 'promptExecutions' },
        { collection: 'citations', codeField: 'citationCode', drafts: true, relationField: 'promptExecution' },
        { collection: 'evidence', codeField: 'evidenceCode', drafts: true, relationField: 'promptExecution' },
        { collection: 'research-artifacts', codeField: 'artifactCode', drafts: false, relationField: 'promptExecution' },
        { collection: 'observations', codeField: 'observationCode', drafts: true, relationField: 'promptExecution' },
      ];

      for (const spec of dependentSpecs) {
        const documents = await findAll({
          payload,
          req,
          collection: spec.collection,
          drafts: spec.drafts,
        });

        for (const document of documents) {
          if (
            spec.collection === 'research-artifacts' &&
            protectedInfrastructure.artifactIDs.has(String(document.id))
          ) {
            continue;
          }

          const relatedExecutionIDs =
            spec.relationField === 'promptExecutions'
              ? getRelationshipIDs(document[spec.relationField])
              : [getRelationshipID(document[spec.relationField])].filter(
                  (id): id is string => Boolean(id),
                );
          const belongsToDevelopmentPilot = relatedExecutionIDs.some((id) =>
            pilotExecutionIDs.has(id),
          );
          if (!belongsToDevelopmentPilot) continue;

          const code = getString(document[spec.codeField]) || String(document.id);
          const target: ResetTarget = {
            collection: spec.collection,
            id: document.id,
            code,
            reason: 'development-pilot',
          };
          targets.set(targetKey(target), target);
        }
      }
    }
  }

  return {
    targets: Array.from(targets.values()),
    protectedInfrastructure,
  };
};

const collectTestResearchers = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}) => {
  const researchers = await findAll({ payload, req, collection: 'researchers' });

  return researchers
    .filter((researcher) => {
      const slug = getString(researcher.slug) || '';
      const name = getString(researcher.name) || '';
      return slug.endsWith('-test') || /\(TEST\)/i.test(name);
    })
    .map((researcher) => ({
      id: String(researcher.id),
      slug: getString(researcher.slug) || String(researcher.id),
      name: getString(researcher.name) || 'TEST researcher',
    }));
};

const countByCollection = (targets: ResetTarget[]) => {
  const counts: Record<string, number> = {};
  for (const target of targets) {
    counts[target.collection] = (counts[target.collection] || 0) + 1;
  }
  return counts;
};

const inspectPilotMetricDefinitions = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}) => {
  const definitions = await findAll({
    payload,
    req,
    collection: 'metric-definitions',
    drafts: true,
  });
  const expectedCodes = new Set(PILOT_METRIC_DEFINITIONS.map((metric) => metric.definitionCode));
  const pilotDefinitions = definitions.filter((definition) =>
    expectedCodes.has(getString(definition.definitionCode) || ''),
  );

  const clean =
    pilotDefinitions.length === PILOT_METRIC_DEFINITIONS.length &&
    pilotDefinitions.every((definition) => {
      const review = getRecord(definition.technicalReview);
      const reviewedBy = getRelationshipIDs(review.reviewedBy);
      const independentReviewedBy = getRelationshipIDs(review.independentReviewedBy);
      const validatedBy = getRelationshipIDs(definition.validatedBy);

      return (
        getString(definition.lifecycleStatus) === 'under-review' &&
        !definition.validatedAt &&
        validatedBy.length === 0 &&
        (!getString(review.status) || getString(review.status) === 'pending') &&
        (!getString(review.deterministicValidationStatus) ||
          getString(review.deterministicValidationStatus) === 'not-run') &&
        (!getString(review.independentReviewStatus) ||
          getString(review.independentReviewStatus) === 'pending') &&
        reviewedBy.length === 0 &&
        independentReviewedBy.length === 0
      );
    });

  return { count: pilotDefinitions.length, clean };
};

export const previewDevelopmentReset = async ({
  payload,
  req,
  scope,
}: {
  payload: Payload;
  req: PayloadRequest;
  scope: ResetScope;
}): Promise<ResetPreview> => {
  requireAdmin(req);
  const environment = await getResearchEnvironment({ payload, req });
  const { targets, protectedInfrastructure } = await collectTargets({
    payload,
    req,
    scope,
  });
  const testResearchers = scope === 'final' ? await collectTestResearchers({ payload, req }) : [];
  const metricDefinitions = await inspectPilotMetricDefinitions({ payload, req });
  const blockers: string[] = [];

  if (environment.mode === 'doctoral') {
    blockers.push('Reset actions are permanently disabled in Doctoral Research Mode.');
  }

  return {
    mode: environment.mode,
    scope,
    deletions: countByCollection(targets),
    totalDeletions: targets.length,
    pilotMetricDefinitionsReset: scope === 'final' ? metricDefinitions.count : 0,
    testResearchers,
    preservedInfrastructureArtifacts: protectedInfrastructure.artifactIDs.size,
    preservedInfrastructureExecutions: protectedInfrastructure.executionIDs.size,
    blockers,
  };
};

const deleteTargets = async ({
  payload,
  req,
  targets,
}: {
  payload: Payload;
  req: PayloadRequest;
  targets: ResetTarget[];
}) => {
  let deleted = 0;

  for (const collection of DELETE_ORDER) {
    const collectionTargets = targets.filter((target) => target.collection === collection);
    for (const target of collectionTargets) {
      await payload.delete({
        collection: target.collection,
        id: target.id,
        overrideAccess: true,
        req,
      });
      deleted += 1;
    }
  }

  return deleted;
};

const emptyTechnicalReview = () => ({
  status: 'pending',
  reviewMode: 'author-self-review',
  reviewedAt: null,
  reviewedBy: [],
  deterministicValidationStatus: 'not-run',
  independentReviewStatus: 'pending',
  independentReviewedAt: null,
  independentReviewedBy: [],
  notes: null,
});

const resetPilotMetricDefinitions = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}) => {
  const definitions = await findAll({
    payload,
    req,
    collection: 'metric-definitions',
    drafts: true,
  });

  for (const metric of PILOT_METRIC_DEFINITIONS) {
    const matches = definitions.filter(
      (definition) => getString(definition.definitionCode) === metric.definitionCode,
    );
    if (matches.length > 1) {
      throw new Error(
        `Final development reset found duplicate metric definition ${metric.definitionCode}. Resolve duplicates manually before continuing.`,
      );
    }
    if (matches.length === 0) continue;

    const definition = matches[0];
    const resetData = {
      lifecycleStatus: 'under-review',
      validatedAt: null,
      validatedBy: [],
      technicalReview: emptyTechnicalReview(),
      _status: 'draft',
    };

    await payload.update({
      collection: 'metric-definitions',
      id: definition.id,
      locale: 'en',
      fallbackLocale: false,
      draft: true,
      overrideAccess: true,
      req,
      context: { developmentReset: true },
      data: resetData,
    });
    await payload.update({
      collection: 'metric-definitions',
      id: definition.id,
      locale: 'es',
      fallbackLocale: false,
      draft: true,
      overrideAccess: true,
      req,
      context: { developmentReset: true },
      data: resetData,
    });
  }

  return synchronizePermanentPilotMetricDefinitions({ payload, req });
};

const deleteTestResearchers = async ({
  payload,
  req,
  researchers,
}: {
  payload: Payload;
  req: PayloadRequest;
  researchers: Array<{ id: string; slug: string; name: string }>;
}) => {
  for (const researcher of researchers) {
    await payload.delete({
      collection: 'researchers',
      id: researcher.id,
      overrideAccess: true,
      req,
    });
  }
};

export const executeDevelopmentReset = async ({
  payload,
  req,
  scope,
}: {
  payload: Payload;
  req: PayloadRequest;
  scope: ResetScope;
}) => {
  const adminID = requireAdmin(req);
  await assertDevelopmentMode({ payload, req });

  const { targets, protectedInfrastructure } = await collectTargets({ payload, req, scope });
  const testResearchers = scope === 'final' ? await collectTestResearchers({ payload, req }) : [];
  const deletedRecords = await deleteTargets({ payload, req, targets });

  let resetMetricDefinitions = 0;
  if (scope === 'final') {
    const metricRecords = await resetPilotMetricDefinitions({ payload, req });
    resetMetricDefinitions = metricRecords.length;
    await deleteTestResearchers({ payload, req, researchers: testResearchers });
  }

  const summary = {
    scope,
    deletedRecords,
    deletions: countByCollection(targets),
    resetMetricDefinitions,
    deletedTestResearchers: testResearchers.length,
    preservedInfrastructureArtifacts: protectedInfrastructure.artifactIDs.size,
    preservedInfrastructureExecutions: protectedInfrastructure.executionIDs.size,
  };

  await payload.updateGlobal({
    slug: 'research-environment',
    overrideAccess: true,
    req,
    data: {
      mode: 'development',
      lastResetAt: new Date().toISOString(),
      lastResetBy: adminID,
      lastResetScope: scope,
      lastResetSummary: summary,
    },
  });

  return summary;
};

export const getDoctoralActivationReadiness = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}) => {
  requireAdmin(req);
  const environment = await getResearchEnvironment({ payload, req });
  const { targets, protectedInfrastructure } = await collectTargets({
    payload,
    req,
    scope: 'final',
  });
  const testResearchers = await collectTestResearchers({ payload, req });
  const metricDefinitions = await inspectPilotMetricDefinitions({ payload, req });
  const blockers: string[] = [];

  if (environment.mode === 'doctoral') {
    blockers.push('Doctoral Research Mode is already active.');
  }
  if (targets.length > 0) {
    blockers.push(`${targets.length} development scientific records still require cleanup.`);
  }
  if (testResearchers.length > 0) {
    blockers.push(`${testResearchers.length} TEST researcher profiles still require cleanup.`);
  }
  if (!metricDefinitions.clean) {
    blockers.push(
      'AIR, CR, MCP and RCR must be restored to clean Under review definitions with no development review or validation attribution.',
    );
  }

  return {
    mode: environment.mode,
    ready: blockers.length === 0,
    blockers,
    preservedInfrastructureArtifacts: protectedInfrastructure.artifactIDs.size,
    preservedInfrastructureExecutions: protectedInfrastructure.executionIDs.size,
  };
};

export const activateDoctoralResearchMode = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}) => {
  const adminID = requireAdmin(req);
  await assertDevelopmentMode({ payload, req });
  const readiness = await getDoctoralActivationReadiness({ payload, req });

  if (!readiness.ready) {
    throw new Error(
      `Doctoral Research Mode activation is blocked:\n- ${readiness.blockers.join('\n- ')}`,
    );
  }

  const activatedAt = new Date().toISOString();
  await payload.updateGlobal({
    slug: 'research-environment',
    overrideAccess: true,
    req,
    data: {
      mode: 'doctoral',
      doctoralModeActivatedAt: activatedAt,
      doctoralModeActivatedBy: adminID,
    },
  });

  return { mode: 'doctoral' as const, activatedAt };
};
