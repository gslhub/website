import type { Payload, PayloadRequest } from 'payload';

import { calculateAnswerInclusionRate } from '../metrics/calculateAnswerInclusionRate';

type RecordID = string | number;

type GeneratedRecord = {
  collectionSlug: 'prompt-executions' | 'observations' | 'metrics';
  recordId: string;
  recordCode: string;
  label: string;
};

type DocumentWithID = {
  id: RecordID;
  promptText?: unknown;
  version?: unknown;
  language?: unknown;
};

type ContextCollection =
  | 'projects'
  | 'benchmarks'
  | 'experiments'
  | 'prompts'
  | 'ai-systems'
  | 'researchers'
  | 'metric-definitions';

type AIRValidationContext = {
  project: DocumentWithID;
  benchmark: DocumentWithID;
  experiment: DocumentWithID;
  prompt: DocumentWithID;
  aiSystem: DocumentWithID;
  researcher: DocumentWithID;
  metricDefinition: DocumentWithID;
  promptText: string;
  promptVersion: string;
  promptLanguage: string;
};

const PILOT = {
  projectCode: 'GSL-GEO-BENCH-01',
  benchmarkCode: 'GSL-BENCH-GEO-01',
  experimentCode: 'GSL-EXP-GEO-001',
  promptCode: 'GSL-PROMPT-GEO-001',
  aiSystemCode: 'GSL-AISYS-001',
  researcherSlug: 'eduardo-yauri',
  definitionCode: 'GSL-MDEF-AIR-0001',
  targetType: 'domain',
  targetValue: 'gslhub.com',
} as const;

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const requireAdmin = (req: PayloadRequest) => {
  const user = req.user as { role?: unknown } | null | undefined;

  if (!user || user.role !== 'admin') {
    throw new Error('Only an administrator can generate the AIR validation scenario.');
  }
};

const findRequiredDocument = async ({
  payload,
  req,
  collection,
  field,
  value,
}: {
  payload: Payload;
  req: PayloadRequest;
  collection: ContextCollection;
  field: string;
  value: string;
}): Promise<DocumentWithID> => {
  const result = await payload.find({
    collection,
    where: {
      [field]: {
        equals: value,
      },
    },
    limit: 2,
    depth: 0,
    pagination: false,
    draft: true,
    overrideAccess: true,
    req,
  });

  if (result.docs.length === 0) {
    throw new Error(`Required ${collection} record not found: ${field} = ${value}`);
  }

  if (result.docs.length > 1) {
    throw new Error(
      `Expected one ${collection} record but found ${result.docs.length}: ${field} = ${value}`,
    );
  }

  return result.docs[0] as DocumentWithID;
};

const resolveContext = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<AIRValidationContext> => {
  const [project, benchmark, experiment, prompt, aiSystem, researcher, metricDefinition] =
    await Promise.all([
      findRequiredDocument({
        payload,
        req,
        collection: 'projects',
        field: 'projectCode',
        value: PILOT.projectCode,
      }),
      findRequiredDocument({
        payload,
        req,
        collection: 'benchmarks',
        field: 'benchmarkCode',
        value: PILOT.benchmarkCode,
      }),
      findRequiredDocument({
        payload,
        req,
        collection: 'experiments',
        field: 'experimentCode',
        value: PILOT.experimentCode,
      }),
      findRequiredDocument({
        payload,
        req,
        collection: 'prompts',
        field: 'promptCode',
        value: PILOT.promptCode,
      }),
      findRequiredDocument({
        payload,
        req,
        collection: 'ai-systems',
        field: 'systemCode',
        value: PILOT.aiSystemCode,
      }),
      findRequiredDocument({
        payload,
        req,
        collection: 'researchers',
        field: 'slug',
        value: PILOT.researcherSlug,
      }),
      findRequiredDocument({
        payload,
        req,
        collection: 'metric-definitions',
        field: 'definitionCode',
        value: PILOT.definitionCode,
      }),
    ]);

  return {
    project,
    benchmark,
    experiment,
    prompt,
    aiSystem,
    researcher,
    metricDefinition,
    promptText:
      getString(prompt.promptText) ||
      'What factors determine whether a website is selected, cited or recommended by generative search systems?',
    promptVersion: getString(prompt.version) || '0.1.0',
    promptLanguage: getString(prompt.language) || 'en',
  };
};

const rollback = async ({
  payload,
  req,
  records,
}: {
  payload: Payload;
  req: PayloadRequest;
  records: GeneratedRecord[];
}) => {
  for (const record of [...records].reverse()) {
    await payload
      .delete({
        collection: record.collectionSlug,
        id: record.recordId,
        overrideAccess: true,
        req,
      })
      .catch(() => undefined);
  }
};

export const generateAIRMetricValidationRecords = async ({
  payload,
  req,
  batchCode,
}: {
  payload: Payload;
  req: PayloadRequest;
  batchCode: string;
}): Promise<GeneratedRecord[]> => {
  requireAdmin(req);

  const context = await resolveContext({ payload, req });
  const records: GeneratedRecord[] = [];
  const executionIds: RecordID[] = [];
  const observationIds: RecordID[] = [];
  const calculatedAt = new Date().toISOString();

  try {
    for (let repetitionNumber = 1; repetitionNumber <= 5; repetitionNumber += 1) {
      const suffix = String(repetitionNumber).padStart(4, '0');
      const executionCode = `TEST-${batchCode}-EXEC-${suffix}`;
      const observationCode = `TEST-${batchCode}-OBS-${suffix}`;
      const executedAt = new Date(
        new Date(calculatedAt).getTime() - (6 - repetitionNumber) * 60_000,
      ).toISOString();
      const accepted = repetitionNumber <= 4;
      const mentioned = repetitionNumber <= 3;
      const responseText = accepted
        ? mentioned
          ? `TEST DATA — ${PILOT.targetValue} is included in this controlled response.`
          : 'TEST DATA — the evaluated target is intentionally absent from this controlled response.'
        : 'TEST DATA — this response is intentionally excluded from the AIR analytical denominator.';

      const execution = await payload.create({
        collection: 'prompt-executions',
        draft: true,
        overrideAccess: true,
        req,
        data: {
          executionCode,
          lifecycleStatus: 'completed',
          executionDate: executedAt,
          repetitionNumber,
          runLabel: `AIR deterministic validation — ${batchCode}`,
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
            accountTier: 'Synthetic validation',
            interfaceVersion: 'GSLHub AIR calculator test fixture 0.1.0',
            releaseChannel: 'Test',
            locale: 'en-US',
            timezone: 'Europe/Madrid',
            location: 'Barcelona, Spain',
            webAccessEnabled: false,
            searchModeSelection: 'not-applicable',
            newSessionConfirmed: true,
            memoryEnabled: false,
            customInstructionsEnabled: false,
          },
          response: {
            status: 'success',
            text: responseText,
            format: 'plain-text',
            sourcesPanelShown: false,
            explicitCitationsShown: false,
            sourceLinksShown: false,
            visibleCitationCount: 0,
          },
          timing: {
            startedAt: executedAt,
            completedAt: new Date(new Date(executedAt).getTime() + 1_000).toISOString(),
            durationMilliseconds: 1_000,
          },
          integrity: {
            evidenceNotes:
              'Synthetic execution created only to verify deterministic AIR denominator and numerator rules.',
          },
          qualityControl: {
            reviewStatus: 'accepted',
            reviewers: [context.researcher.id],
            validationNotes: 'Synthetic execution accepted for AIR calculator validation.',
            validatedAt: executedAt,
          },
          notes: `TEST DATA — batch ${batchCode}.`,
          _status: 'draft',
        },
      });

      executionIds.push(execution.id);
      records.push({
        collectionSlug: 'prompt-executions',
        recordId: String(execution.id),
        recordCode: executionCode,
        label: `AIR candidate execution ${repetitionNumber}`,
      });

      const observation = await payload.create({
        collection: 'observations',
        draft: true,
        overrideAccess: true,
        req,
        data: {
          observationCode,
          lifecycleStatus: accepted ? 'validated' : 'excluded',
          observationType: 'response-level',
          codedAt: executedAt,
          promptExecution: execution.id,
          project: context.project.id,
          benchmark: context.benchmark.id,
          experiment: context.experiment.id,
          prompt: context.prompt.id,
          aiSystem: context.aiSystem.id,
          codedBy: context.researcher.id,
          responseAssessment: {
            relevanceLevel: 'high',
            completeness: 'complete',
            refusalObserved: false,
            errorObserved: false,
            languageDetected: 'en',
            wordCount: responseText.split(/\s+/).length,
            notes: 'Synthetic response-level coding for deterministic AIR validation.',
          },
          citationAssessment: {
            explicitCitationsPresent: false,
            sourceLinksPresent: false,
            sourcesPanelPresent: false,
            visibleCitationCount: 0,
            uniqueDomainCount: 0,
            citationStyle: 'none',
          },
          sourceObservations: [],
          visibilityCoding: {
            targetType: PILOT.targetType,
            targetValue: PILOT.targetValue,
            mentioned,
            cited: false,
            recommended: false,
            mentionPosition: mentioned ? 1 : undefined,
            recommendationStrength: 'none',
          },
          semanticCoding: {
            themes: [{ label: 'AIR validation' }],
            claimsCount: mentioned ? 1 : 0,
            evidenceGrounding: 'none',
          },
          comparison: {
            variationLevel: 'not-assessed',
          },
          qualityControl: {
            reviewStatus: accepted ? 'accepted' : 'excluded',
            codingConfidence: 'high',
            reviewers: [context.researcher.id],
            validationNotes: accepted
              ? 'Synthetic accepted observation used by the AIR analytical denominator.'
              : 'Synthetic exclusion used to verify that excluded observations do not enter the denominator.',
            exclusionReason: accepted
              ? undefined
              : 'Predeclared synthetic exclusion for AIR denominator validation.',
            validatedAt: accepted ? executedAt : undefined,
          },
          notes: `TEST DATA — batch ${batchCode}.`,
          _status: 'draft',
        },
      });

      observationIds.push(observation.id);
      records.push({
        collectionSlug: 'observations',
        recordId: String(observation.id),
        recordCode: observationCode,
        label: accepted
          ? `AIR accepted observation ${repetitionNumber}`
          : 'AIR excluded denominator-control observation',
      });
    }

    const result = await calculateAnswerInclusionRate({
      payload,
      req,
      observationIds,
      targetType: PILOT.targetType,
      targetValue: PILOT.targetValue,
      precision: 4,
    });

    if (
      result.numerator !== 3 ||
      result.denominator !== 4 ||
      result.excludedCount !== 1 ||
      result.numericValue !== 0.75
    ) {
      throw new Error(
        `AIR deterministic validation failed. Expected 3/4 = 0.75 with one exclusion; received ${result.numerator}/${result.denominator} = ${result.numericValue} with ${result.excludedCount} exclusions.`,
      );
    }

    const metricRecordCode = `TEST-${batchCode}-MET-0001`;
    const metric = await payload.create({
      collection: 'metrics',
      draft: true,
      overrideAccess: true,
      req,
      data: {
        metricRecordCode,
        metricDefinition: context.metricDefinition.id,
        lifecycleStatus: 'calculated',
        scopeLabel: 'AIR deterministic validation sample',
        calculatedAt,
        numericValue: result.numericValue,
        numerator: result.numerator,
        denominator: result.denominator,
        sampleSize: result.denominator,
        resultSummary:
          'Deterministic AIR validation passed: three included targets among four valid observations; one excluded observation was reported but not counted.',
        calculationMethod:
          'GSLHub AIR calculator v0.1.0 selected completed executions with exactly one validated, accepted and target-matched observation. Excluded candidates were reported separately and removed from the analytical denominator.',
        project: context.project.id,
        benchmark: context.benchmark.id,
        experiment: context.experiment.id,
        prompt: context.prompt.id,
        aiSystem: context.aiSystem.id,
        promptExecutions: executionIds,
        observations: observationIds,
        calculatedBy: context.researcher.id,
        reproducibility: {
          engineVersion: 'gslhub-air-calculator-0.1.0',
          querySnapshot: result.querySnapshot,
          environmentSnapshot:
            'Administrator Test Data Batches deterministic AIR validation scenario.',
          inputChecksum: result.inputChecksum,
          outputChecksum: result.outputChecksum,
        },
        qualityControl: {
          reviewStatus: 'pending',
          reviewers: [],
          validationNotes:
            'Synthetic result. Confirm inherited definition metadata, numerator 3, denominator 4, value 0.75, one reported exclusion and stable SHA-256 checksums.',
        },
        notes: `TEST DATA — batch ${batchCode}.`,
        _status: 'draft',
      },
    });

    records.push({
      collectionSlug: 'metrics',
      recordId: String(metric.id),
      recordCode: metricRecordCode,
      label: 'AIR deterministic result — 3 / 4 = 0.75',
    });

    return records;
  } catch (error) {
    await rollback({ payload, req, records });
    throw error;
  }
};
