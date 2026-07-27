import { createHash } from 'node:crypto';

import type { Payload, PayloadRequest } from 'payload';

import { calculateCitationRate } from '../metrics/calculateCitationRate';

type RecordID = string | number;
type GeneratedRecord = {
  collectionSlug: 'prompt-executions' | 'observations' | 'citations' | 'metrics';
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
  definitionCode: 'GSL-MDEF-CR-0001',
  targetType: 'domain',
  targetValue: 'gslhub.com',
} as const;

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const requireAdmin = (req: PayloadRequest) => {
  const user = req.user as { role?: unknown } | null | undefined;
  if (!user || user.role !== 'admin') {
    throw new Error('Only an administrator can generate the CR validation scenario.');
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
    throw new Error(`Expected one ${collection} record but found ${result.docs.length}: ${field} = ${value}`);
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

export const generateCRMetricValidationRecords = async ({
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
      findRequiredDocument({ payload, req, collection: 'projects', field: 'projectCode', value: PILOT.projectCode }),
      findRequiredDocument({ payload, req, collection: 'benchmarks', field: 'benchmarkCode', value: PILOT.benchmarkCode }),
      findRequiredDocument({ payload, req, collection: 'experiments', field: 'experimentCode', value: PILOT.experimentCode }),
      findRequiredDocument({ payload, req, collection: 'prompts', field: 'promptCode', value: PILOT.promptCode }),
      findRequiredDocument({ payload, req, collection: 'ai-systems', field: 'systemCode', value: PILOT.aiSystemCode }),
      findRequiredDocument({ payload, req, collection: 'researchers', field: 'slug', value: PILOT.researcherSlug }),
      findRequiredDocument({ payload, req, collection: 'metric-definitions', field: 'definitionCode', value: PILOT.definitionCode }),
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
  const citationIds: RecordID[] = [];

  try {
    for (let index = 1; index <= 5; index += 1) {
      const suffix = String(index).padStart(4, '0');
      const repetitionNumber = 100 + index;
      const executionCode = `TEST-${batchCode}-EXEC-${suffix}`;
      const observationCode = `TEST-${batchCode}-OBS-${suffix}`;
      const executedAt = new Date(
        new Date(calculatedAt).getTime() - (6 - index) * 60_000,
      ).toISOString();
      const accepted = index <= 4;
      const cited = index <= 2;
      const responseText = cited
        ? `TEST DATA — ${PILOT.targetValue} is explicitly cited in this controlled response.`
        : accepted
          ? 'TEST DATA — the response is valid but the evaluated target is not cited.'
          : 'TEST DATA — this response is intentionally excluded from the CR denominator.';

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
          runLabel: `CR deterministic validation — ${batchCode}`,
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
            interfaceVersion: 'GSLHub CR calculator test fixture 0.1.0',
            releaseChannel: 'Test',
            locale: 'en-US',
            timezone: 'Europe/Madrid',
            location: 'Barcelona, Spain',
            webAccessEnabled: true,
            searchModeSelection: 'enabled',
            newSessionConfirmed: true,
            memoryEnabled: false,
            customInstructionsEnabled: false,
          },
          response: {
            status: 'success',
            text: responseText,
            format: 'plain-text',
            sourcesPanelShown: cited,
            explicitCitationsShown: cited,
            sourceLinksShown: cited,
            visibleCitationCount: cited ? 1 : 0,
          },
          timing: {
            startedAt: executedAt,
            completedAt: new Date(new Date(executedAt).getTime() + 1_000).toISOString(),
            durationMilliseconds: 1_000,
          },
          integrity: {
            evidenceNotes: 'Synthetic execution created only to validate deterministic CR calculation.',
          },
          qualityControl: {
            reviewStatus: 'accepted',
            reviewers: [researcher.id],
            validationNotes: 'Synthetic execution accepted for CR validation.',
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
        label: `CR candidate execution ${index}`,
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
            notes: 'Synthetic response-level coding for deterministic CR validation.',
          },
          citationAssessment: {
            explicitCitationsPresent: cited,
            sourceLinksPresent: cited,
            sourcesPanelPresent: cited,
            visibleCitationCount: cited ? 1 : 0,
            uniqueDomainCount: cited ? 1 : 0,
            citationStyle: cited ? 'source-cards' : 'none',
          },
          sourceObservations: cited
            ? [{
                position: 1,
                sourceTitle: 'GSLHub research platform',
                sourceUrl: 'https://gslhub.com/research',
                sourceDomain: PILOT.targetValue,
                sourceType: 'corporate',
                cited: true,
                linked: true,
                usedInAnswer: true,
              }]
            : [],
          visibilityCoding: {
            targetType: PILOT.targetType,
            targetValue: PILOT.targetValue,
            mentioned: cited,
            cited,
            recommended: false,
            citationPosition: cited ? 1 : undefined,
            recommendationStrength: 'none',
          },
          semanticCoding: {
            themes: [{ label: 'CR validation' }],
            claimsCount: cited ? 1 : 0,
            evidenceGrounding: cited ? 'explicit' : 'none',
          },
          comparison: { variationLevel: 'not-assessed' },
          qualityControl: {
            reviewStatus: accepted ? 'accepted' : 'excluded',
            codingConfidence: 'high',
            reviewers: [researcher.id],
            validationNotes: accepted
              ? 'Synthetic accepted observation used by the CR analytical denominator.'
              : 'Synthetic exclusion used to verify that excluded observations do not enter the denominator.',
            exclusionReason: accepted
              ? undefined
              : 'Predeclared synthetic exclusion for CR denominator validation.',
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
        label: accepted ? `CR accepted observation ${index}` : 'CR excluded denominator-control observation',
      });

      if (cited) {
        const citationCode = `TEST-${batchCode}-CIT-${suffix}`;
        const rawCitationText = `[${index}] GSLHub research platform — https://gslhub.com/research`;
        const citation = await payload.create({
          collection: 'citations',
          draft: true,
          overrideAccess: true,
          req,
          data: {
            citationCode,
            lifecycleStatus: 'validated',
            citationType: 'source-card',
            citationFunction: 'support',
            citationPosition: 1,
            capturedAt: executedAt,
            promptExecution: execution.id,
            observation: observation.id,
            project: project.id,
            benchmark: benchmark.id,
            experiment: experiment.id,
            prompt: prompt.id,
            aiSystem: aiSystem.id,
            extractedBy: researcher.id,
            sourceTitle: 'GSLHub research platform',
            sourceUrl: 'https://gslhub.com/research',
            normalizedUrl: 'https://gslhub.com/research',
            sourceDomain: PILOT.targetValue,
            sourcePublisher: 'GSLHub',
            sourceType: 'corporate',
            sourceLanguage: 'en',
            sourceAccessedAt: executedAt,
            citationContext: {
              displayText: rawCitationText,
              anchorText: 'GSLHub research platform',
              surroundingText: responseText,
              claimSupported: 'The evaluated target is explicitly attributed as a source.',
              location: 'sources-panel',
              prominence: 'standard',
            },
            targetCoding: {
              targetType: PILOT.targetType,
              targetValue: PILOT.targetValue,
              isEvaluatedTarget: true,
              targetMatchType: 'domain',
            },
            verification: {
              urlResolved: true,
              httpStatus: 200,
              finalUrl: 'https://gslhub.com/research',
              contentAvailable: true,
              titleMatches: true,
              supportsClaim: 'yes',
              isPrimarySource: true,
              isOfficialSource: true,
              verifiedAt: executedAt,
              verifiedBy: [researcher.id],
              verificationNotes: 'Synthetic verified citation used for deterministic CR validation.',
            },
            integrity: {
              rawCitationText,
              checksumAlgorithm: 'sha256',
              checksum: createHash('sha256').update(rawCitationText).digest('hex'),
              normalizationNotes: 'Synthetic canonical URL and domain normalization.',
            },
            qualityControl: {
              reviewStatus: 'accepted',
              codingConfidence: 'high',
              reviewers: [researcher.id],
              validationNotes: 'Synthetic citation accepted for CR validation.',
              validatedAt: executedAt,
            },
            notes: `TEST DATA — batch ${batchCode}.`,
            _status: 'draft',
          },
        });

        citationIds.push(citation.id);
        records.push({
          collectionSlug: 'citations',
          recordId: String(citation.id),
          recordCode: citationCode,
          label: `CR verified target citation ${index}`,
        });
      }
    }

    const result = await calculateCitationRate({
      payload,
      req,
      observationIds,
      targetType: PILOT.targetType,
      targetValue: PILOT.targetValue,
      precision: 4,
    });

    if (
      result.numerator !== 2 ||
      result.denominator !== 4 ||
      result.excludedCount !== 1 ||
      result.numericValue !== 0.5 ||
      citationIds.length !== 2
    ) {
      throw new Error(
        `CR deterministic validation failed. Expected 2/4 = 0.5, one exclusion and two citation records; received ${result.numerator}/${result.denominator} = ${result.numericValue}, ${result.excludedCount} exclusions and ${citationIds.length} citations.`,
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
        scopeLabel: 'CR deterministic validation sample',
        calculatedAt,
        numericValue: result.numericValue,
        numerator: result.numerator,
        denominator: result.denominator,
        sampleSize: result.denominator,
        resultSummary:
          'Deterministic CR validation passed: two cited targets among four valid observations; one excluded observation was reported but not counted.',
        calculationMethod:
          'GSLHub CR calculator v0.1.0 selected completed executions with exactly one validated, accepted and target-matched observation, then counted visibilityCoding.cited. Two source-level Citation records were created for audit.',
        project: project.id,
        benchmark: benchmark.id,
        experiment: experiment.id,
        prompt: prompt.id,
        aiSystem: aiSystem.id,
        promptExecutions: executionIds,
        observations: observationIds,
        citations: citationIds,
        calculatedBy: researcher.id,
        reproducibility: {
          engineVersion: 'gslhub-cr-calculator-0.1.0',
          querySnapshot: result.querySnapshot,
          environmentSnapshot: 'Administrator Test Data Batches deterministic CR validation scenario.',
          inputChecksum: result.inputChecksum,
          outputChecksum: result.outputChecksum,
        },
        qualityControl: {
          reviewStatus: 'pending',
          reviewers: [],
          validationNotes:
            'Synthetic result. Confirm inherited CR definition metadata, numerator 2, denominator 4, value 0.5, one exclusion, two Citation records and stable SHA-256 checksums.',
        },
        notes: `TEST DATA — batch ${batchCode}.`,
        _status: 'draft',
      },
    });

    records.push({
      collectionSlug: 'metrics',
      recordId: String(metric.id),
      recordCode: metricRecordCode,
      label: 'CR deterministic result — 2 / 4 = 0.5',
    });

    return records;
  } catch (error) {
    await rollback({ payload, req, records });
    throw error;
  }
};
