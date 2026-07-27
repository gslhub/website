import type { Payload, PayloadRequest } from 'payload';

import { calculateResponseConsistencyRate } from '../metrics/calculateResponseConsistencyRate';

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
  promptLanguage?: unknown;
};

type ContextCollection =
  | 'projects'
  | 'benchmarks'
  | 'experiments'
  | 'prompts'
  | 'ai-systems'
  | 'researchers'
  | 'metric-definitions';

const PILOT = {
  projectCode: 'GSL-GEO-BENCH-01',
  benchmarkCode: 'GSL-BENCH-GEO-01',
  experimentCode: 'GSL-EXP-GEO-001',
  promptCode: 'GSL-PROMPT-GEO-001',
  aiSystemCode: 'GSL-AISYS-001',
  researcherSlug: 'eduardo-yauri',
  definitionCode: 'GSL-MDEF-RCR-0001',
  targetType: 'domain',
  targetValue: 'gslhub.com',
} as const;

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const requireAdmin = (req: PayloadRequest) => {
  const user = req.user as { role?: unknown } | null | undefined;

  if (!user || user.role !== 'admin') {
    throw new Error('Only an administrator can generate the RCR validation scenario.');
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
    where: { [field]: { equals: value } },
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

export const generateRCRMetricValidationRecords = async ({
  payload,
  req,
  batchCode,
}: {
  payload: Payload;
  req: PayloadRequest;
  batchCode: string;
}): Promise<GeneratedRecord[]> => {
  requireAdmin(req);

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

  const promptText =
    getString(prompt.promptText) ||
    'What factors determine whether a website is selected, cited or recommended by generative search systems?';
  const promptVersion = getString(prompt.version) || '0.1.0';
  const promptLanguage = getString(prompt.promptLanguage) || 'en';
  const calculatedAt = new Date().toISOString();
  const records: GeneratedRecord[] = [];
  const executionIds: RecordID[] = [];
  const observationIds: RecordID[] = [];
  const variationLevels = ['not-assessed', 'none', 'low', 'low', 'high'] as const;
  const semanticOverlaps = [1, 1, 0.9, 0.85, 0.4] as const;
  let baselineObservationId: RecordID | null = null;

  try {
    for (let index = 1; index <= 5; index += 1) {
      const suffix = String(index).padStart(4, '0');
      const repetitionNumber = 300 + index;
      const executionCode = `TEST-${batchCode}-EXEC-${suffix}`;
      const observationCode = `TEST-${batchCode}-OBS-${suffix}`;
      const executedAt = new Date(
        new Date(calculatedAt).getTime() - (6 - index) * 60_000,
      ).toISOString();
      const variationLevel = variationLevels[index - 1];
      const isBaseline = index === 1;
      const isConsistent = variationLevel === 'none' || variationLevel === 'low';
      const responseText = isBaseline
        ? `TEST DATA — frozen baseline response for ${PILOT.targetValue}.`
        : `TEST DATA — comparison response classified as ${variationLevel} variation relative to the frozen baseline.`;

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
          runLabel: `RCR deterministic validation — ${batchCode}`,
          prompt: prompt.id,
          promptVersion,
          promptLanguage,
          promptSnapshot: promptText,
          project: project.id,
          benchmark: benchmark.id,
          experiment: experiment.id,
          aiSystem: aiSystem.id,
          executedBy: researcher.id,
          executionEnvironment: {
            accessMode: 'authenticated-web',
            accountTier: 'Synthetic validation',
            interfaceVersion: 'GSLHub RCR calculator test fixture 0.1.0',
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
              'Synthetic execution created only to validate deterministic RCR calculation.',
          },
          qualityControl: {
            reviewStatus: 'accepted',
            reviewers: [researcher.id],
            validationNotes: 'Synthetic execution accepted for RCR validation.',
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
        label: isBaseline
          ? 'RCR frozen baseline execution'
          : `RCR comparison execution ${index - 1}`,
      });

      const observation = await payload.create({
        collection: 'observations',
        draft: true,
        overrideAccess: true,
        req,
        data: {
          observationCode,
          lifecycleStatus: 'validated',
          observationType: 'response-level',
          codedAt: executedAt,
          promptExecution: execution.id,
          project: project.id,
          benchmark: benchmark.id,
          experiment: experiment.id,
          prompt: prompt.id,
          aiSystem: aiSystem.id,
          codedBy: researcher.id,
          responseAssessment: {
            relevanceLevel: 'high',
            completeness: 'complete',
            refusalObserved: false,
            errorObserved: false,
            languageDetected: 'en',
            wordCount: responseText.split(/\s+/).length,
            notes: 'Synthetic response-level coding for deterministic RCR validation.',
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
            mentioned: true,
            cited: false,
            recommended: false,
            mentionPosition: 1,
            recommendationStrength: 'none',
          },
          semanticCoding: {
            themes: [{ label: 'RCR validation' }],
            claimsCount: variationLevel === 'high' ? 2 : 1,
            evidenceGrounding: 'none',
          },
          comparison: {
            baselineObservation: isBaseline ? undefined : baselineObservationId,
            variationLevel,
            inclusionChanged: variationLevel === 'high',
            citationChanged: false,
            positionChanged: false,
            semanticOverlap: semanticOverlaps[index - 1],
            notes: isBaseline
              ? 'Frozen baseline; excluded from the assessed-comparison denominator.'
              : isConsistent
                ? 'Protocol-coded as consistent relative to baseline.'
                : 'Protocol-coded as materially inconsistent relative to baseline.',
          },
          qualityControl: {
            reviewStatus: 'accepted',
            codingConfidence: 'high',
            reviewers: [researcher.id],
            validationNotes: isBaseline
              ? 'Synthetic baseline observation frozen before comparison coding.'
              : `Synthetic accepted comparison coded ${variationLevel} relative to the frozen baseline.`,
            validatedAt: executedAt,
          },
          notes: `TEST DATA — batch ${batchCode}.`,
          _status: 'draft',
        },
      });

      if (isBaseline) baselineObservationId = observation.id;
      observationIds.push(observation.id);
      records.push({
        collectionSlug: 'observations',
        recordId: String(observation.id),
        recordCode: observationCode,
        label: isBaseline
          ? 'RCR frozen baseline observation'
          : `RCR ${variationLevel} comparison observation`,
      });
    }

    const result = await calculateResponseConsistencyRate({
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
        `RCR deterministic validation failed. Expected 3/4 = 0.75 with one baseline exclusion; received ${result.numerator}/${result.denominator} = ${result.numericValue} with ${result.excludedCount} exclusions.`,
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
        metricDefinition: metricDefinition.id,
        lifecycleStatus: 'calculated',
        scopeLabel: 'RCR deterministic validation sample',
        calculatedAt,
        numericValue: result.numericValue,
        numerator: result.numerator,
        denominator: result.denominator,
        sampleSize: result.denominator,
        resultSummary:
          'Deterministic RCR validation passed: three consistent comparisons among four assessed comparisons; the frozen baseline was reported but not counted.',
        calculationMethod:
          'GSLHub RCR calculator v0.1.0 selected completed executions with validated, accepted and target-matched observations, required one frozen baseline, excluded not-assessed observations, and classified none or low variation as consistent.',
        project: project.id,
        benchmark: benchmark.id,
        experiment: experiment.id,
        prompt: prompt.id,
        aiSystem: aiSystem.id,
        promptExecutions: executionIds,
        observations: observationIds,
        calculatedBy: researcher.id,
        reproducibility: {
          engineVersion: 'gslhub-rcr-calculator-0.1.0',
          querySnapshot: result.querySnapshot,
          environmentSnapshot:
            'Administrator Test Data Batches deterministic RCR validation scenario.',
          inputChecksum: result.inputChecksum,
          outputChecksum: result.outputChecksum,
        },
        qualityControl: {
          reviewStatus: 'pending',
          reviewers: [],
          validationNotes:
            'Synthetic result. Confirm inherited definition metadata, numerator 3, denominator 4, value 0.75, one frozen baseline exclusion and stable SHA-256 checksums.',
        },
        notes: `TEST DATA — batch ${batchCode}.`,
        _status: 'draft',
      },
    });

    records.push({
      collectionSlug: 'metrics',
      recordId: String(metric.id),
      recordCode: metricRecordCode,
      label: 'RCR deterministic result — 3 / 4 = 0.75',
    });

    return records;
  } catch (error) {
    await rollback({ payload, req, records });
    throw error;
  }
};
