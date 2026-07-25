import { getPayload } from 'payload';

import config from '@payload-config';

const PILOT = {
  projectCode: 'GSL-GEO-BENCH-01',
  benchmarkCode: 'GSL-BENCH-GEO-01',
  experimentCode: 'GSL-EXP-GEO-001',
  promptCode: 'GSL-PROMPT-GEO-001',
  aiSystemCode: 'GSL-AISYS-001',
  researcherSlug: 'eduardo-yauri',
  runLabel: 'GSLHub GEO Pilot Round 0.1',
  promptVersion: '0.1.0',
  promptLanguage: 'en' as const,
  promptSnapshot:
    'What factors determine whether a website is selected, cited or recommended by generative search systems? Provide a concise explanation and cite the most relevant sources you rely on.',
};

type CollectionSlug =
  | 'projects'
  | 'benchmarks'
  | 'experiments'
  | 'prompts'
  | 'ai-systems'
  | 'researchers'
  | 'prompt-executions';

type DocumentWithID = {
  id: string | number;
};

const findRequiredDocument = async ({
  payload,
  collection,
  field,
  value,
  includeDrafts = false,
}: {
  payload: Awaited<ReturnType<typeof getPayload>>;
  collection: CollectionSlug;
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
    ...(includeDrafts ? { draft: true } : {}),
  });

  if (result.docs.length === 0) {
    throw new Error(
      `Required ${collection} record not found: ${field} = ${value}`,
    );
  }

  if (result.docs.length > 1) {
    throw new Error(
      `Expected one ${collection} record but found ${result.docs.length}: ${field} = ${value}`,
    );
  }

  return result.docs[0] as DocumentWithID;
};

const seedPilotExecutions = async () => {
  const payload = await getPayload({ config });

  payload.logger.info('Resolving GSLHub pilot scientific context...');

  const [project, benchmark, experiment, prompt, aiSystem, researcher] =
    await Promise.all([
      findRequiredDocument({
        payload,
        collection: 'projects',
        field: 'projectCode',
        value: PILOT.projectCode,
      }),
      findRequiredDocument({
        payload,
        collection: 'benchmarks',
        field: 'benchmarkCode',
        value: PILOT.benchmarkCode,
        includeDrafts: true,
      }),
      findRequiredDocument({
        payload,
        collection: 'experiments',
        field: 'experimentCode',
        value: PILOT.experimentCode,
        includeDrafts: true,
      }),
      findRequiredDocument({
        payload,
        collection: 'prompts',
        field: 'promptCode',
        value: PILOT.promptCode,
        includeDrafts: true,
      }),
      findRequiredDocument({
        payload,
        collection: 'ai-systems',
        field: 'systemCode',
        value: PILOT.aiSystemCode,
        includeDrafts: true,
      }),
      findRequiredDocument({
        payload,
        collection: 'researchers',
        field: 'slug',
        value: PILOT.researcherSlug,
      }),
    ]);

  let created = 0;
  let skipped = 0;

  for (let repetitionNumber = 1; repetitionNumber <= 5; repetitionNumber += 1) {
    const executionCode = `GSL-EXEC-GEO-${String(repetitionNumber).padStart(4, '0')}`;

    const existing = await payload.find({
      collection: 'prompt-executions',
      where: {
        executionCode: {
          equals: executionCode,
        },
      },
      limit: 1,
      depth: 0,
      pagination: false,
      draft: true,
      overrideAccess: true,
    });

    if (existing.docs.length > 0) {
      skipped += 1;
      payload.logger.info(`${executionCode} already exists — skipped.`);
      continue;
    }

    await payload.create({
      collection: 'prompt-executions',
      overrideAccess: true,
      draft: false,
      data: {
        executionCode,
        lifecycleStatus: 'planned',
        repetitionNumber,
        runLabel: PILOT.runLabel,
        prompt: prompt.id,
        promptVersion: PILOT.promptVersion,
        promptLanguage: PILOT.promptLanguage,
        promptSnapshot: PILOT.promptSnapshot,
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
          evidenceNotes:
            'Planned execution record. No response or research artifact has been collected yet.',
        },
        qualityControl: {
          reviewStatus: 'pending',
          reviewers: [],
        },
        notes:
          'This record represents one planned repetition of the controlled pilot condition. Execution metadata will be completed immediately after the isolated session is performed.',
        _status: 'draft',
      },
    });

    created += 1;
    payload.logger.info(`${executionCode} created as a draft.`);
  }

  payload.logger.info(
    `Pilot execution seed complete: ${created} created, ${skipped} already present.`,
  );
};

try {
  await seedPilotExecutions();
  process.exit(0);
} catch (error) {
  console.error('Unable to seed pilot prompt executions.', error);
  process.exit(1);
}
