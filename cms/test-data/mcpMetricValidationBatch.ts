import { createHash } from 'node:crypto';

import type { Payload, PayloadRequest } from 'payload';

import { calculateMeanCitationPosition } from '../metrics/calculateMeanCitationPosition';

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
  definitionCode: 'GSL-MDEF-MCP-0001',
  targetType: 'domain',
  targetValue: 'gslhub.com',
} as const;

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const requireAdmin = (req: PayloadRequest) => {
  const user = req.user as { role?: unknown } | null | undefined;

  if (!user || user.role !== 'admin') {
    throw new Error('Only an administrator can generate the MCP validation scenario.');
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

export const generateMCPMetricValidationRecords = async ({
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
  const citationIds: RecordID[] = [];
  const positions = [1, 2, 3] as const;

  try {
    for (let index = 1; index <= 5; index += 1) {
      const suffix = String(index).padStart(4, '0');
      const repetitionNumber = 200 + index;
      const executionCode = `TEST-${batchCode}-EXEC-${suffix}`;
      const observationCode = `TEST-${batchCode}-OBS-${suffix}`;
      const executedAt = new Date(
        new Date(calculatedAt).getTime() - (6 - index) * 60_000,
      ).toISOString();
      const accepted = index <= 4;
      const cited = index <= 3;
      const citationPosition = cited ? positions[index - 1] : undefined;
      const responseText = cited
        ? `TEST DATA — ${PILOT.targetValue} appears as citation position ${citationPosition}.`
        : accepted
          ? 'TEST DATA — this valid response does not cite the evaluated target.'
          : 'TEST DATA — this response is intentionally excluded from MCP analysis.';

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
          runLabel: `MCP deterministic validation — ${batchCode}`,
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
            interfaceVersion: 'GSLHub MCP calculator test fixture 0.1.0',
            releaseChannel: 'Test',
            locale: 'en-US',
            timezone: 'Europe/Madrid',
            location: 'Barcelona, Spain',
            webAccessEnabled: true,
            searchModeSelection: 'manual',
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
            evidenceNotes:
              'Synthetic execution created only to validate deterministic MCP calculation.',
          },
          qualityControl: {
            reviewStatus: 'accepted',
            reviewers: [researcher.id],
            validationNotes: 'Synthetic execution accepted for MCP validation.',
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
        label: `MCP candidate execution ${index}`,
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
            notes: 'Synthetic response-level coding for deterministic MCP validation.',
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
            ? [
                {
                  position: citationPosition,
                  title: 'GSLHub research platform',
                  url: 'https://gslhub.com/research',
                  domain: PILOT.targetValue,
                  sourceType: 'corporate',
                  citedExplicitly: true,
                  linked: true,
                  usedInAnswer: true,
                },
              ]
            : [],
          visibilityCoding: {
            targetType: PILOT.targetType,
            targetValue: PILOT.targetValue,
            mentioned: cited,
            cited,
            recommended: false,
            citationPosition,
            recommendationStrength: 'none',
          },
          semanticCoding: {
            themes: [{ label: 'MCP validation' }],
            claimsCount: cited ? 1 : 0,
            evidenceGrounding: cited ? 'high' : 'none',
          },
          comparison: { variationLevel: 'not-assessed' },
          qualityControl: {
            reviewStatus: accepted ? 'accepted' : 'excluded',
            codingConfidence: 'high',
            reviewers: [researcher.id],
            validationNotes: accepted
              ? cited
                ? `Synthetic accepted observation with citation position ${citationPosition}.`
                : 'Synthetic accepted non-cited observation used to verify MCP eligibility filtering.'
              : 'Synthetic exclusion used to verify lifecycle filtering before MCP calculation.',
            exclusionReason: accepted
              ? undefined
              : 'Predeclared synthetic exclusion for MCP validation.',
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
          ? cited
            ? `MCP eligible observation at position ${citationPosition}`
            : 'MCP accepted non-cited observation'
          : 'MCP excluded lifecycle-control observation',
      });

      if (cited && citationPosition !== undefined) {
        const citationCode = `TEST-${batchCode}-CIT-${suffix}`;
        const rawCitationText = `[${citationPosition}] GSLHub research platform — https://gslhub.com/research`;
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
            citationPosition,
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
              claimSupported:
                'The evaluated target is represented at a controlled visible citation position.',
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
              verificationNotes:
                'Synthetic verified citation used for deterministic MCP validation.',
            },
            integrity: {
              rawCitationText,
              checksumAlgorithm: 'sha256',
              checksum: createHash('sha256').update(rawCitationText).digest('hex'),
              normalizationNotes:
                'Synthetic canonical URL and one-based visible position.',
            },
            qualityControl: {
              reviewStatus: 'accepted',
              codingConfidence: 'high',
              reviewers: [researcher.id],
              validationNotes: `Synthetic citation accepted at visible position ${citationPosition}.`,
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
          label: `MCP verified citation position ${citationPosition}`,
        });
      }
    }

    const result = await calculateMeanCitationPosition({
      payload,
      req,
      observationIds,
      targetType: PILOT.targetType,
      targetValue: PILOT.targetValue,
      precision: 2,
    });

    if (
      result.positionSum !== 6 ||
      result.denominator !== 3 ||
      result.excludedCount !== 2 ||
      result.numericValue !== 2 ||
      citationIds.length !== 3
    ) {
      throw new Error(
        `MCP deterministic validation failed. Expected positions [1,2,3], sum 6, denominator 3, mean 2.0, two exclusions and three Citation records; received positions [${result.eligiblePositions.join(',')}], sum ${result.positionSum}, denominator ${result.denominator}, mean ${result.numericValue}, ${result.excludedCount} exclusions and ${citationIds.length} citations.`,
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
        scopeLabel: 'MCP deterministic validation sample',
        calculatedAt,
        numericValue: result.numericValue,
        numerator: result.positionSum,
        denominator: result.denominator,
        sampleSize: result.denominator,
        resultSummary:
          'Deterministic MCP validation passed: eligible target citation positions 1, 2 and 3 produced a mean position of 2.0. One accepted non-cited observation and one excluded observation were reported but not counted.',
        calculationMethod:
          'GSLHub MCP calculator v0.1.0 selected completed executions with one validated, accepted and target-matched observation, retained only observations where the target was cited with a valid one-based citation position, and calculated the arithmetic mean.',
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
          engineVersion: 'gslhub-mcp-calculator-0.1.0',
          querySnapshot: result.querySnapshot,
          environmentSnapshot:
            'Administrator Test Data Batches deterministic MCP validation scenario.',
          inputChecksum: result.inputChecksum,
          outputChecksum: result.outputChecksum,
        },
        qualityControl: {
          reviewStatus: 'pending',
          reviewers: [],
          validationNotes:
            'Synthetic result. Confirm inherited MCP definition metadata, position sum 6, denominator 3, numeric value 2.0, positions [1,2,3], two reported exclusions and stable SHA-256 checksums.',
        },
        notes: `TEST DATA — batch ${batchCode}.`,
        _status: 'draft',
      },
    });

    records.push({
      collectionSlug: 'metrics',
      recordId: String(metric.id),
      recordCode: metricRecordCode,
      label: 'MCP deterministic result — mean position 2.0',
    });

    return records;
  } catch (error) {
    await rollback({ payload, req, records });
    throw error;
  }
};
