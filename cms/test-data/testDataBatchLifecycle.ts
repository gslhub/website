import { randomUUID } from 'node:crypto';

import type {
  CollectionAfterChangeHook,
  CollectionBeforeDeleteHook,
  CollectionBeforeValidateHook,
  Payload,
  PayloadRequest,
} from 'payload';

type RecordID = string | number;

type GeneratedRecord = {
  collectionSlug: 'prompt-executions';
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

const PILOT_CONTEXT = {
  projectCode: 'GSL-GEO-BENCH-01',
  benchmarkCode: 'GSL-BENCH-GEO-01',
  experimentCode: 'GSL-EXP-GEO-001',
  promptCode: 'GSL-PROMPT-GEO-001',
  aiSystemCode: 'GSL-AISYS-001',
  researcherSlug: 'eduardo-yauri',
  runLabel: 'GSLHub GEO Pilot Round 0.1 — Test Data',
  fallbackPromptVersion: '0.1.0',
  fallbackPromptLanguage: 'en',
  fallbackPromptSnapshot:
    'What factors determine whether a website is selected, cited or recommended by generative search systems? Provide a concise explanation and cite the most relevant sources you rely on.',
} as const;

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
      collectionSlug !== 'prompt-executions' ||
      !recordId ||
      !recordCode ||
      !label
    ) {
      return [];
    }

    return [
      {
        collectionSlug,
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
    draft: true,
    overrideAccess: true,
    req,
  });

  if (existing.docs.length === 0) return;

  const executionCode = getString(
    (existing.docs[0] as Record<string, unknown>).executionCode,
  );

  if (!executionCode || executionCode !== record.recordCode) {
    throw new Error(
      `Cleanup refused for record ${record.recordId}: its execution code no longer matches the tracked test record.`,
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

const generatePilotExecutionRecords = async ({
  payload,
  req,
  batchCode,
}: {
  payload: Payload;
  req: PayloadRequest;
  batchCode: string;
}): Promise<GeneratedRecord[]> => {
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

  const promptVersion =
    getString(prompt.version) || PILOT_CONTEXT.fallbackPromptVersion;
  const promptLanguage =
    getString(prompt.promptLanguage) || PILOT_CONTEXT.fallbackPromptLanguage;
  const promptSnapshot =
    getString(prompt.promptText) || PILOT_CONTEXT.fallbackPromptSnapshot;

  const createdRecords: GeneratedRecord[] = [];

  try {
    for (let repetitionNumber = 1; repetitionNumber <= 5; repetitionNumber += 1) {
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
          runLabel: PILOT_CONTEXT.runLabel,
          prompt: prompt.id,
          promptVersion,
          promptLanguage,
          promptSnapshot,
          project: project.id,
          benchmark: benchmark.id,
          experiment: experiment.id,
          aiSystem: aiSystem.id,
          executedBy: researcher.id,
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

      createdRecords.push({
        collectionSlug: 'prompt-executions',
        recordId: String(created.id),
        recordCode: executionCode,
        label: `Pilot execution repetition ${repetitionNumber}`,
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
    if (scenario !== 'pilot-executions') {
      throw new Error(`Unsupported test data scenario: ${scenario || 'undefined'}`);
    }

    const records = await generatePilotExecutionRecords({
      payload: req.payload,
      req,
      batchCode,
    });

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
