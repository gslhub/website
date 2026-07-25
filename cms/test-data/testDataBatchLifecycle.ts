import { randomUUID } from 'node:crypto';
import { unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type {
  CollectionAfterChangeHook,
  CollectionBeforeDeleteHook,
  CollectionBeforeValidateHook,
  Payload,
  PayloadRequest,
} from 'payload';

type RecordID = string | number;

type GeneratedCollectionSlug =
  | 'prompt-executions'
  | 'observations'
  | 'research-artifacts'
  | 'evidence'
  | 'citations'
  | 'metrics';

type GeneratedRecord = {
  collectionSlug: GeneratedCollectionSlug;
  recordId: string;
  recordCode: string;
  label: string;
};

type TestDataBatchDocument = {
  id: RecordID;
  batchCode?: unknown;
  scenario?: unknown;
  status?: unknown;
  records?: unknown;
};

type DocumentWithID = {
  id: RecordID;
  version?: unknown;
  promptLanguage?: unknown;
  promptText?: unknown;
  filename?: unknown;
  mimeType?: unknown;
  filesize?: unknown;
  url?: unknown;
  integrity?: unknown;
};

type AdminUser = {
  id?: unknown;
  role?: unknown;
};

type SupportedContextCollection =
  | 'projects'
  | 'benchmarks'
  | 'experiments'
  | 'prompts'
  | 'ai-systems'
  | 'researchers';

type PilotContext = {
  project: DocumentWithID;
  benchmark: DocumentWithID;
  experiment: DocumentWithID;
  prompt: DocumentWithID;
  aiSystem: DocumentWithID;
  researcher: DocumentWithID;
  promptVersion: string;
  promptLanguage: string;
  promptSnapshot: string;
};

const PILOT_CONTEXT = {
  projectCode: 'GSL-GEO-BENCH-01',
  benchmarkCode: 'GSL-BENCH-GEO-01',
  experimentCode: 'GSL-EXP-GEO-001',
  promptCode: 'GSL-PROMPT-GEO-001',
  aiSystemCode: 'GSL-AISYS-001',
  researcherSlug: 'eduardo-yauri',
  plannedRunLabel: 'GSLHub GEO Pilot Round 0.1 — Test Data',
  completedRunLabel: 'GSLHub GEO Full Pipeline — Test Data',
  fallbackPromptVersion: '0.1.0',
  fallbackPromptLanguage: 'en',
  fallbackPromptSnapshot:
    'What factors determine whether a website is selected, cited or recommended by generative search systems? Provide a concise explanation and cite the most relevant sources you rely on.',
} as const;

const codeFieldByCollection: Record<GeneratedCollectionSlug, string> = {
  'prompt-executions': 'executionCode',
  observations: 'observationCode',
  'research-artifacts': 'artifactCode',
  evidence: 'evidenceCode',
  citations: 'citationCode',
  metrics: 'metricRecordCode',
};

const draftCollections = new Set<GeneratedCollectionSlug>([
  'prompt-executions',
  'observations',
  'evidence',
  'citations',
  'metrics',
]);

const getAdminUserID = (req: PayloadRequest): RecordID => {
  const user = req.user as AdminUser | null | undefined;

  if (!user || user.role !== 'admin') {
    throw new Error('Only an administrator can create or remove test data batches.');
  }

  if (typeof user.id !== 'string' && typeof user.id !== 'number') {
    throw new Error('The administrator account does not expose a valid user ID.');
  }

  return user.id;
};

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const getNestedString = (value: unknown, key: string): string | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  return getString((value as Record<string, unknown>)[key]);
};

const makeBatchCode = () => {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+$/, '');
  const suffix = randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();

  return `GSL-TD-${timestamp}-${suffix}`;
};

const normalizeGeneratedRecords = (value: unknown): GeneratedRecord[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const record = item as Record<string, unknown>;
    const collectionSlug = getString(record.collectionSlug);
    const recordId = getString(record.recordId);
    const recordCode = getString(record.recordCode);
    const label = getString(record.label);

    if (
      !collectionSlug ||
      !(collectionSlug in codeFieldByCollection) ||
      !recordId ||
      !recordCode ||
      !label
    ) {
      return [];
    }

    return [
      {
        collectionSlug: collectionSlug as GeneratedCollectionSlug,
        recordId,
        recordCode,
        label,
      },
    ];
  });
};

const findRequiredDocument = async ({
  payload,
  req,
  collection,
  field,
  value,
  includeDrafts = false,
}: {
  payload: Payload;
  req: PayloadRequest;
  collection: SupportedContextCollection;
  field: string;
  value: string;
  includeDrafts?: boolean;
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
    overrideAccess: true,
    req,
    ...(includeDrafts ? { draft: true } : {}),
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

const resolvePilotContext = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<PilotContext> => {
  const [project, benchmark, experiment, prompt, aiSystem, researcher] =
    await Promise.all([
      findRequiredDocument({
        payload,
        req,
        collection: 'projects',
        field: 'projectCode',
        value: PILOT_CONTEXT.projectCode,
      }),
      findRequiredDocument({
        payload,
        req,
        collection: 'benchmarks',
        field: 'benchmarkCode',
        value: PILOT_CONTEXT.benchmarkCode,
        includeDrafts: true,
      }),
      findRequiredDocument({
        payload,
        req,
        collection: 'experiments',
        field: 'experimentCode',
        value: PILOT_CONTEXT.experimentCode,
        includeDrafts: true,
      }),
      findRequiredDocument({
        payload,
        req,
        collection: 'prompts',
        field: 'promptCode',
        value: PILOT_CONTEXT.promptCode,
        includeDrafts: true,
      }),
      findRequiredDocument({
        payload,
        req,
        collection: 'ai-systems',
        field: 'systemCode',
        value: PILOT_CONTEXT.aiSystemCode,
        includeDrafts: true,
      }),
      findRequiredDocument({
        payload,
        req,
        collection: 'researchers',
        field: 'slug',
        value: PILOT_CONTEXT.researcherSlug,
      }),
    ]);

  return {
    project,
    benchmark,
    experiment,
    prompt,
    aiSystem,
    researcher,
    promptVersion: getString(prompt.version) || PILOT_CONTEXT.fallbackPromptVersion,
    promptLanguage:
      getString(prompt.promptLanguage) || PILOT_CONTEXT.fallbackPromptLanguage,
    promptSnapshot:
      getString(prompt.promptText) || PILOT_CONTEXT.fallbackPromptSnapshot,
  };
};

const deleteGeneratedRecord = async ({
  payload,
  req,
  batchCode,
  record,
}: {
  payload: Payload;
  req: PayloadRequest;
  batchCode: string;
  record: GeneratedRecord;
}) => {
  const expectedPrefix = `TEST-${batchCode}-`;

  if (!record.recordCode.startsWith(expectedPrefix)) {
    throw new Error(
      `Cleanup refused for ${record.recordCode}: the record is not owned by batch ${batchCode}.`,
    );
  }

  const existing = await payload.find({
    collection: record.collectionSlug,
    where: {
      id: {
        equals: record.recordId,
      },
    },
    limit: 1,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
    ...(draftCollections.has(record.collectionSlug) ? { draft: true } : {}),
  });

  if (existing.docs.length === 0) return;

  const codeField = codeFieldByCollection[record.collectionSlug];
  const currentCode = getString(
    (existing.docs[0] as Record<string, unknown>)[codeField],
  );

  if (!currentCode || currentCode !== record.recordCode) {
    throw new Error(
      `Cleanup refused for record ${record.recordId}: its ${codeField} no longer matches the tracked test record.`,
    );
  }

  await payload.delete({
    collection: record.collectionSlug,
    id: record.recordId,
    overrideAccess: true,
    req,
  });
};

const cleanupGeneratedRecords = async ({
  payload,
  req,
  batchCode,
  records,
}: {
  payload: Payload;
  req: PayloadRequest;
  batchCode: string;
  records: GeneratedRecord[];
}) => {
  for (const record of [...records].reverse()) {
    await deleteGeneratedRecord({ payload, req, batchCode, record });
  }
};

const createPlannedExecution = async ({
  payload,
  req,
  batchCode,
  repetitionNumber,
  context,
}: {
  payload: Payload;
  req: PayloadRequest;
  batchCode: string;
  repetitionNumber: number;
  context: PilotContext;
}): Promise<GeneratedRecord> => {
  const executionCode = `TEST-${batchCode}-EXEC-${String(repetitionNumber).padStart(4, '0')}`;

  const created = await payload.create({
    collection: 'prompt-executions',
    draft: true,
    overrideAccess: true,
    req,
    data: {
      executionCode,
      lifecycleStatus: 'planned',
      repetitionNumber,
      runLabel: PILOT_CONTEXT.plannedRunLabel,
      prompt: context.prompt.id,
      promptVersion: context.promptVersion,
      promptLanguage: context.promptLanguage,
      promptSnapshot: context.promptSnapshot,
      project: context.project.id,
      benchmark: context.benchmark.id,
      experiment: context.experiment.id,
      aiSystem: context.aiSystem.id,
      executedBy: context.researcher.id,
      executionEnvironment: {
        accessMode: 'authenticated-web',
        accountTier: 'Paid individual',
        interfaceVersion: 'ChatGPT web — Search mode',
        releaseChannel: 'Production',
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
        evidenceNotes: `Administrator-generated test record owned by batch ${batchCode}. No real execution or evidence has been collected.`,
      },
      qualityControl: {
        reviewStatus: 'pending',
        reviewers: [],
      },
      notes: `TEST DATA — batch ${batchCode}. Safe to remove through the Test Data Batches administration collection.`,
      _status: 'draft',
    },
  });

  return {
    collectionSlug: 'prompt-executions',
    recordId: String(created.id),
    recordCode: executionCode,
    label: `Pilot execution repetition ${repetitionNumber}`,
  };
};

const generatePilotExecutionRecords = async ({
  payload,
  req,
  batchCode,
}: {
  payload: Payload;
  req: PayloadRequest;
  batchCode: string;
}): Promise<GeneratedRecord[]> => {
  const context = await resolvePilotContext({ payload, req });
  const createdRecords: GeneratedRecord[] = [];

  try {
    for (let repetitionNumber = 1; repetitionNumber <= 5; repetitionNumber += 1) {
      createdRecords.push(
        await createPlannedExecution({
          payload,
          req,
          batchCode,
          repetitionNumber,
          context,
        }),
      );
    }

    return createdRecords;
  } catch (error) {
    await cleanupGeneratedRecords({
      payload,
      req,
      batchCode,
      records: createdRecords,
    });

    throw error;
  }
};

const createResponseArtifact = async ({
  payload,
  req,
  batchCode,
  repetitionNumber,
  executionId,
  responseText,
  capturedAt,
}: {
  payload: Payload;
  req: PayloadRequest;
  batchCode: string;
  repetitionNumber: number;
  executionId: RecordID;
  responseText: string;
  capturedAt: string;
}): Promise<{ record: GeneratedRecord; document: DocumentWithID }> => {
  const artifactCode = `TEST-${batchCode}-ART-${String(repetitionNumber).padStart(4, '0')}`;
  const filename = `${artifactCode.toLowerCase()}.txt`;
  const filePath = join(tmpdir(), `${randomUUID()}-${filename}`);

  await writeFile(filePath, responseText, 'utf8');

  try {
    const created = (await payload.create({
      collection: 'research-artifacts',
      overrideAccess: true,
      req,
      filePath,
      data: {
        artifactCode,
        title: `Test response export — repetition ${repetitionNumber}`,
        description:
          'Administrator-generated text export used to test artifact upload, SHA-256 integrity and evidence relationships.',
        artifactType: 'response-export',
        capturedAt,
        accessLevel: 'restricted',
        promptExecution: executionId,
        captureMethod: 'automated',
        captureEnvironment: {
          browserName: 'Test environment',
          deviceType: 'server',
          locale: 'en-US',
          timezone: 'Europe/Madrid',
          location: 'Barcelona, Spain',
          interfaceState: 'Synthetic response export created by the administrator test-data workflow.',
        },
        notes: `TEST DATA — batch ${batchCode}.`,
      },
    })) as DocumentWithID;

    return {
      record: {
        collectionSlug: 'research-artifacts',
        recordId: String(created.id),
        recordCode: artifactCode,
        label: `Response artifact repetition ${repetitionNumber}`,
      },
      document: created,
    };
  } finally {
    await unlink(filePath).catch(() => undefined);
  }
};

const generateFullResearchPipelineRecords = async ({
  payload,
  req,
  batchCode,
}: {
  payload: Payload;
  req: PayloadRequest;
  batchCode: string;
}): Promise<GeneratedRecord[]> => {
  const context = await resolvePilotContext({ payload, req });
  const createdRecords: GeneratedRecord[] = [];
  const executionIds: RecordID[] = [];
  const observationIds: RecordID[] = [];
  const evidenceIds: RecordID[] = [];
  const citationIds: RecordID[] = [];

  try {
    for (let repetitionNumber = 1; repetitionNumber <= 5; repetitionNumber += 1) {
      const suffix = String(repetitionNumber).padStart(4, '0');
      const executionCode = `TEST-${batchCode}-EXEC-${suffix}`;
      const observationCode = `TEST-${batchCode}-OBS-${suffix}`;
      const evidenceCode = `TEST-${batchCode}-EVD-${suffix}`;
      const citationCode = `TEST-${batchCode}-CIT-${suffix}`;
      const executedAt = new Date(Date.now() - (6 - repetitionNumber) * 60_000).toISOString();
      const hasCitation = repetitionNumber <= 3;
      const targetIncluded = repetitionNumber <= 4;
      const citationPosition = repetitionNumber;
      const sourceUrl = `https://example.com/generative-search/source-selection-${repetitionNumber}`;
      const sourceDomain = 'example.com';
      const responseText = [
        'TEST DATA — synthetic response for GSLHub pipeline validation.',
        '',
        'Generative search systems tend to select sources that combine topical relevance, clear structure, retrievability, authority signals and current information.',
        targetIncluded
          ? 'The synthetic target gslhub.com is included in this test response.'
          : 'The synthetic target is intentionally absent from this repetition.',
        hasCitation
          ? `A synthetic supporting source is shown at ${sourceUrl}.`
          : 'This repetition intentionally contains no visible citation.',
      ].join('\n');

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
          runLabel: PILOT_CONTEXT.completedRunLabel,
          prompt: context.prompt.id,
          promptVersion: context.promptVersion,
          promptLanguage: context.promptLanguage,
          promptSnapshot: context.promptSnapshot,
          project: context.project.id,
          benchmark: context.benchmark.id,
          experiment: context.experiment.id,
          aiSystem: context.aiSystem.id,
          executedBy: context.researcher.id,
          executionEnvironment: {
            accessMode: 'authenticated-web',
            accountTier: 'Paid individual',
            interfaceVersion: 'ChatGPT web — Search mode',
            releaseChannel: 'Production',
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
            sourcesPanelShown: hasCitation,
            explicitCitationsShown: hasCitation,
            sourceLinksShown: hasCitation,
            visibleCitationCount: hasCitation ? 1 : 0,
          },
          timing: {
            startedAt: executedAt,
            completedAt: new Date(new Date(executedAt).getTime() + 12_000).toISOString(),
            durationMilliseconds: 12_000,
          },
          integrity: {
            evidenceNotes: `Synthetic completed execution owned by test batch ${batchCode}.`,
          },
          qualityControl: {
            reviewStatus: 'accepted',
            reviewers: [context.researcher.id],
            validationNotes: 'Synthetic test execution accepted for CMS workflow validation only.',
            validatedAt: executedAt,
          },
          notes: `TEST DATA — batch ${batchCode}.`,
          _status: 'draft',
        },
      });

      executionIds.push(execution.id);
      createdRecords.push({
        collectionSlug: 'prompt-executions',
        recordId: String(execution.id),
        recordCode: executionCode,
        label: `Completed execution repetition ${repetitionNumber}`,
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
            notes: 'Synthetic response-level coding generated for test-data validation.',
          },
          citationAssessment: {
            explicitCitationsPresent: hasCitation,
            sourceLinksPresent: hasCitation,
            sourcesPanelPresent: hasCitation,
            visibleCitationCount: hasCitation ? 1 : 0,
            uniqueDomainCount: hasCitation ? 1 : 0,
            citationStyle: hasCitation ? 'source-cards' : 'none',
          },
          sourceObservations: hasCitation
            ? [
                {
                  position: citationPosition,
                  title: `Synthetic source ${repetitionNumber}`,
                  url: sourceUrl,
                  domain: sourceDomain,
                  sourceType: 'documentation',
                  citedExplicitly: true,
                  linked: true,
                  usedInAnswer: true,
                  notes: 'Synthetic source observation.',
                },
              ]
            : [],
          visibilityCoding: {
            targetType: 'domain',
            targetValue: 'gslhub.com',
            mentioned: targetIncluded,
            cited: repetitionNumber <= 3,
            recommended: repetitionNumber <= 2,
            mentionPosition: targetIncluded ? 1 : undefined,
            citationPosition: repetitionNumber <= 3 ? citationPosition : undefined,
            recommendationStrength: repetitionNumber <= 2 ? 'moderate' : 'none',
          },
          semanticCoding: {
            themes: [
              { label: 'Source selection' },
              { label: 'Generative search visibility' },
            ],
            claimsCount: 2,
            evidenceGrounding: hasCitation ? 'medium' : 'low',
            semanticCoverageScore: 80 - repetitionNumber,
          },
          comparison: {
            variationLevel: repetitionNumber === 5 ? 'medium' : 'low',
            comparisonNotes: 'Synthetic variation coding for repeated test executions.',
          },
          qualityControl: {
            reviewStatus: 'accepted',
            codingConfidence: 'high',
            reviewers: [context.researcher.id],
            validationNotes: 'Synthetic observation accepted for workflow testing only.',
            validatedAt: executedAt,
          },
          notes: `TEST DATA — batch ${batchCode}.`,
          _status: 'draft',
        },
      });

      observationIds.push(observation.id);
      createdRecords.push({
        collectionSlug: 'observations',
        recordId: String(observation.id),
        recordCode: observationCode,
        label: `Observation repetition ${repetitionNumber}`,
      });

      const { record: artifactRecord, document: artifact } =
        await createResponseArtifact({
          payload,
          req,
          batchCode,
          repetitionNumber,
          executionId: execution.id,
          responseText,
          capturedAt: executedAt,
        });

      createdRecords.push(artifactRecord);

      const artifactFilename = getString(artifact.filename) || `${artifactRecord.recordCode}.txt`;
      const artifactMimeType = getString(artifact.mimeType) || 'text/plain';
      const artifactFileSize = getNumber(artifact.filesize) || Buffer.byteLength(responseText, 'utf8');
      const artifactChecksum = getNestedString(artifact.integrity, 'checksum');

      const evidence = await payload.create({
        collection: 'evidence',
        draft: true,
        overrideAccess: true,
        req,
        data: {
          evidenceCode,
          title: `Synthetic response evidence — repetition ${repetitionNumber}`,
          description:
            'Evidence metadata connected to the generated response-export artifact for end-to-end workflow testing.',
          evidenceType: 'response-export',
          lifecycleStatus: 'validated',
          capturedAt: executedAt,
          promptExecution: execution.id,
          observation: observation.id,
          project: context.project.id,
          benchmark: context.benchmark.id,
          experiment: context.experiment.id,
          prompt: context.prompt.id,
          aiSystem: context.aiSystem.id,
          collectedBy: context.researcher.id,
          artifact: {
            artifactUrl: getString(artifact.url),
            originalUrl: 'https://chatgpt.com/',
            fileName: artifactFilename,
            mimeType: artifactMimeType,
            fileSizeBytes: artifactFileSize,
            storageProvider: 'private-archive',
            accessLevel: 'restricted',
          },
          captureContext: {
            captureMethod: 'automated',
            browserName: 'Test environment',
            deviceType: 'server',
            locale: 'en-US',
            timezone: 'Europe/Madrid',
            location: 'Barcelona, Spain',
            interfaceState: 'Synthetic test-data generation workflow.',
          },
          preservedContent: {
            textSnapshot: responseText,
            metadataSnapshot: JSON.stringify({
              batchCode,
              repetitionNumber,
              synthetic: true,
            }),
            visibleElements: [
              { elementType: 'prompt', label: 'Controlled test prompt', position: 1 },
              { elementType: 'response', label: 'Synthetic response', position: 2 },
            ],
          },
          integrity: {
            checksumAlgorithm: 'sha256',
            checksum: artifactChecksum,
            contentUnmodified: true,
            verified: true,
            verifiedAt: executedAt,
            verifiedBy: [context.researcher.id],
            verificationNotes: 'Checksum inherited from the generated research artifact.',
          },
          chainOfCustody: [
            {
              eventType: 'captured',
              eventAt: executedAt,
              actor: context.researcher.id,
              notes: 'Synthetic response export generated by administrator test workflow.',
            },
            {
              eventType: 'hashed',
              eventAt: executedAt,
              actor: context.researcher.id,
              notes: 'SHA-256 calculated automatically during upload.',
            },
          ],
          qualityControl: {
            reviewStatus: 'accepted',
            reviewers: [context.researcher.id],
            validationNotes: 'Synthetic evidence accepted for workflow testing only.',
            validatedAt: executedAt,
          },
          ethicalAndLegalNotes: 'Synthetic content. No personal or third-party research data.',
          notes: `TEST DATA — batch ${batchCode}.`,
          _status: 'draft',
        },
      });

      evidenceIds.push(evidence.id);
      createdRecords.push({
        collectionSlug: 'evidence',
        recordId: String(evidence.id),
        recordCode: evidenceCode,
        label: `Evidence repetition ${repetitionNumber}`,
      });

      await payload.update({
        collection: 'research-artifacts',
        id: artifact.id,
        overrideAccess: true,
        req,
        data: {
          evidenceRecords: [evidence.id],
        },
      });

      if (hasCitation) {
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
            evidence: [evidence.id],
            project: context.project.id,
            benchmark: context.benchmark.id,
            experiment: context.experiment.id,
            prompt: context.prompt.id,
            aiSystem: context.aiSystem.id,
            extractedBy: context.researcher.id,
            sourceTitle: `Synthetic source ${repetitionNumber}`,
            sourceUrl,
            normalizedUrl: sourceUrl,
            sourceDomain,
            sourcePublisher: 'Example Test Publisher',
            sourceType: 'documentation',
            sourceLanguage: 'en',
            sourceAccessedAt: executedAt,
            citationContext: {
              displayText: `Synthetic source ${repetitionNumber}`,
              anchorText: 'synthetic supporting source',
              surroundingText: responseText,
              claimSupported:
                'Source selection is associated with relevance, structure, retrievability and authority signals.',
              location: 'body',
              prominence: 'standard',
            },
            targetCoding: {
              targetType: 'domain',
              targetValue: 'gslhub.com',
              isEvaluatedTarget: true,
              targetMatchType: 'domain',
            },
            verification: {
              urlResolved: true,
              httpStatus: 200,
              finalUrl: sourceUrl,
              contentAvailable: true,
              titleMatches: true,
              supportsClaim: 'yes',
              isPrimarySource: false,
              isOfficialSource: false,
              verifiedAt: executedAt,
              verifiedBy: [context.researcher.id],
              verificationNotes: 'Synthetic verification result for workflow testing.',
            },
            integrity: {
              rawCitationText: `Synthetic source ${repetitionNumber} — ${sourceUrl}`,
              checksumAlgorithm: 'none',
              normalizationNotes: 'Synthetic URL retained without modification.',
            },
            qualityControl: {
              reviewStatus: 'accepted',
              codingConfidence: 'high',
              reviewers: [context.researcher.id],
              validationNotes: 'Synthetic citation accepted for workflow testing only.',
              validatedAt: executedAt,
            },
            notes: `TEST DATA — batch ${batchCode}.`,
            _status: 'draft',
          },
        });

        citationIds.push(citation.id);
        createdRecords.push({
          collectionSlug: 'citations',
          recordId: String(citation.id),
          recordCode: citationCode,
          label: `Citation repetition ${repetitionNumber}`,
        });
      }
    }

    const calculatedAt = new Date().toISOString();
    const metricDefinitions = [
      {
        code: 'AIR',
        name: 'Answer Inclusion Rate',
        category: 'visibility',
        direction: 'higher',
        value: 80,
        unit: 'percentage',
        numerator: 4,
        denominator: 5,
        aggregation: 'ratio',
        formula: '(executions with target included / valid executions) * 100',
        summary: 'The synthetic target appears in four of five test responses.',
      },
      {
        code: 'CR',
        name: 'Citation Rate',
        category: 'citation',
        direction: 'higher',
        value: 60,
        unit: 'percentage',
        numerator: 3,
        denominator: 5,
        aggregation: 'ratio',
        formula: '(executions with at least one visible citation / valid executions) * 100',
        summary: 'Three of five synthetic responses contain a visible citation.',
      },
      {
        code: 'MCP',
        name: 'Mean Citation Position',
        category: 'citation',
        direction: 'lower',
        value: 2,
        unit: 'position',
        numerator: 6,
        denominator: 3,
        aggregation: 'mean',
        formula: 'sum(citation position) / cited executions',
        summary: 'The mean synthetic citation position is 2.0.',
      },
      {
        code: 'RCR',
        name: 'Response Consistency Rate',
        category: 'consistency',
        direction: 'higher',
        value: 80,
        unit: 'percentage',
        numerator: 4,
        denominator: 5,
        aggregation: 'ratio',
        formula: '(executions within the accepted variation threshold / valid executions) * 100',
        summary: 'Four of five synthetic responses remain within the accepted variation threshold.',
      },
    ] as const;

    for (const [index, metric] of metricDefinitions.entries()) {
      const metricRecordCode = `TEST-${batchCode}-MET-${String(index + 1).padStart(4, '0')}`;
      const created = await payload.create({
        collection: 'metrics',
        draft: true,
        overrideAccess: true,
        req,
        data: {
          metricRecordCode,
          lifecycleStatus: 'validated',
          metricCode: metric.code,
          metricName: metric.name,
          metricVersion: '0.1.0',
          metricCategory: metric.category,
          direction: metric.direction,
          scopeType: 'experiment',
          scopeLabel: 'Synthetic full-pipeline test batch',
          calculatedAt,
          valueType: 'number',
          numericValue: metric.value,
          unit: metric.unit,
          precision: 2,
          numerator: metric.numerator,
          denominator: metric.denominator,
          sampleSize: 5,
          resultSummary: metric.summary,
          calculationMethod:
            'Synthetic deterministic calculation over the five administrator-generated test executions.',
          formulaSnapshot: metric.formula,
          aggregationMethod: metric.aggregation,
          missingDataPolicy: 'exclude',
          project: context.project.id,
          benchmark: context.benchmark.id,
          experiment: context.experiment.id,
          prompt: context.prompt.id,
          aiSystem: context.aiSystem.id,
          promptExecutions: executionIds,
          observations: observationIds,
          citations: citationIds,
          evidence: evidenceIds,
          calculatedBy: context.researcher.id,
          reproducibility: {
            engineVersion: 'test-data-generator-0.1.0',
            querySnapshot: `batchCode = ${batchCode}`,
            environmentSnapshot: 'GSLHub administrator test-data workflow',
          },
          qualityControl: {
            reviewStatus: 'accepted',
            reviewers: [context.researcher.id],
            validationNotes: 'Synthetic metric accepted for dashboard and CMS workflow testing only.',
            validatedAt: calculatedAt,
          },
          notes: `TEST DATA — batch ${batchCode}.`,
          _status: 'draft',
        },
      });

      createdRecords.push({
        collectionSlug: 'metrics',
        recordId: String(created.id),
        recordCode: metricRecordCode,
        label: `${metric.code} synthetic metric result`,
      });
    }

    return createdRecords;
  } catch (error) {
    await cleanupGeneratedRecords({
      payload,
      req,
      batchCode,
      records: createdRecords,
    });

    throw error;
  }
};

export const prepareTestDataBatch: CollectionBeforeValidateHook = ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create') return data;

  const adminUserID = getAdminUserID(req);
  const batchCode = makeBatchCode();

  return {
    ...(data || {}),
    batchCode,
    status: 'generating',
    createdBy: adminUserID,
    generatedAt: null,
    recordCount: 0,
    records: [],
    errorMessage: null,
  };
};

export const generateTestDataBatch: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc;

  getAdminUserID(req);

  const batch = doc as TestDataBatchDocument;
  const batchCode = getString(batch.batchCode);
  const scenario = getString(batch.scenario);

  if (!batchCode) {
    throw new Error('The test data batch was created without a valid batch code.');
  }

  try {
    let records: GeneratedRecord[];

    if (scenario === 'pilot-executions') {
      records = await generatePilotExecutionRecords({
        payload: req.payload,
        req,
        batchCode,
      });
    } else if (scenario === 'full-research-pipeline') {
      records = await generateFullResearchPipelineRecords({
        payload: req.payload,
        req,
        batchCode,
      });
    } else {
      throw new Error(`Unsupported test data scenario: ${scenario || 'undefined'}`);
    }

    await req.payload.update({
      collection: 'test-data-batches',
      id: batch.id,
      overrideAccess: true,
      req,
      data: {
        status: 'generated',
        generatedAt: new Date().toISOString(),
        recordCount: records.length,
        records,
        errorMessage: null,
      },
    });

    req.payload.logger.info(
      `Test data batch ${batchCode} generated ${records.length} records.`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    await req.payload.update({
      collection: 'test-data-batches',
      id: batch.id,
      overrideAccess: true,
      req,
      data: {
        status: 'failed',
        recordCount: 0,
        records: [],
        errorMessage: message,
      },
    });

    req.payload.logger.error(
      `Test data batch ${batchCode} failed: ${message}`,
    );
  }

  return doc;
};

export const cleanupTestDataBatch: CollectionBeforeDeleteHook = async ({
  id,
  req,
}) => {
  getAdminUserID(req);

  const batch = (await req.payload.findByID({
    collection: 'test-data-batches',
    id,
    depth: 0,
    overrideAccess: true,
    req,
  })) as TestDataBatchDocument;

  const batchCode = getString(batch.batchCode);

  if (!batchCode) {
    throw new Error('Cleanup refused because the test data batch has no valid batch code.');
  }

  const records = normalizeGeneratedRecords(batch.records);

  await cleanupGeneratedRecords({
    payload: req.payload,
    req,
    batchCode,
    records,
  });

  req.payload.logger.info(
    `Test data batch ${batchCode} removed ${records.length} tracked records.`,
  );
};
