import type { Payload, PayloadRequest } from 'payload';

type RecordID = string | number;

type GeneratedRecord = {
  collectionSlug: 'metrics';
  recordId: string;
  recordCode: string;
  label: string;
};

type DocumentWithID = {
  id: RecordID;
};

type ContextCollection =
  | 'projects'
  | 'benchmarks'
  | 'experiments'
  | 'prompts'
  | 'ai-systems'
  | 'researchers'
  | 'metric-definitions';

type MetricFixture = {
  definitionCode: string;
  metricCode: string;
  numericValue: number;
  numerator: number;
  denominator: number;
  sampleSize: number;
  summary: string;
};

const PILOT = {
  projectCode: 'GSL-GEO-BENCH-01',
  benchmarkCode: 'GSL-BENCH-GEO-01',
  experimentCode: 'GSL-EXP-GEO-001',
  promptCode: 'GSL-PROMPT-GEO-001',
  aiSystemCode: 'GSL-AISYS-001',
  researcherSlug: 'eduardo-yauri',
} as const;

const METRICS: MetricFixture[] = [
  {
    definitionCode: 'GSL-MDEF-AIR-0001',
    metricCode: 'AIR',
    numericValue: 0.8,
    numerator: 4,
    denominator: 5,
    sampleSize: 5,
    summary: 'Synthetic definition-linkage result: the target is included in four of five valid responses.',
  },
  {
    definitionCode: 'GSL-MDEF-CR-0001',
    metricCode: 'CR',
    numericValue: 0.6,
    numerator: 3,
    denominator: 5,
    sampleSize: 5,
    summary: 'Synthetic definition-linkage result: the target is cited in three of five valid responses.',
  },
  {
    definitionCode: 'GSL-MDEF-MCP-0001',
    metricCode: 'MCP',
    numericValue: 2,
    numerator: 6,
    denominator: 3,
    sampleSize: 3,
    summary: 'Synthetic definition-linkage result: the mean visible target citation position is 2.0.',
  },
  {
    definitionCode: 'GSL-MDEF-RCR-0001',
    metricCode: 'RCR',
    numericValue: 0.75,
    numerator: 3,
    denominator: 4,
    sampleSize: 4,
    summary: 'Synthetic definition-linkage result: three of four assessed repetition comparisons meet the consistency threshold.',
  },
];

const requireAdmin = (req: PayloadRequest) => {
  const user = req.user as { role?: unknown } | null | undefined;

  if (!user || user.role !== 'admin') {
    throw new Error('Only an administrator can generate definition-linked metric test results.');
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

const rollbackMetricResults = async ({
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
        collection: 'metrics',
        id: record.recordId,
        overrideAccess: true,
        req,
      })
      .catch(() => undefined);
  }
};

export const generatePilotMetricResultRecords = async ({
  payload,
  req,
  batchCode,
}: {
  payload: Payload;
  req: PayloadRequest;
  batchCode: string;
}): Promise<GeneratedRecord[]> => {
  requireAdmin(req);

  const [project, benchmark, experiment, prompt, aiSystem, researcher] =
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
    ]);

  const definitions = new Map<string, DocumentWithID>();

  for (const metric of METRICS) {
    const definition = await findRequiredDocument({
      payload,
      req,
      collection: 'metric-definitions',
      field: 'definitionCode',
      value: metric.definitionCode,
    });

    definitions.set(metric.definitionCode, definition);
  }

  const createdRecords: GeneratedRecord[] = [];
  const calculatedAt = new Date().toISOString();

  try {
    for (const [index, metric] of METRICS.entries()) {
      const definition = definitions.get(metric.definitionCode);

      if (!definition) {
        throw new Error(`Metric Definition not resolved: ${metric.definitionCode}`);
      }

      const metricRecordCode = `TEST-${batchCode}-MET-${String(index + 1).padStart(4, '0')}`;
      const created = await payload.create({
        collection: 'metrics',
        draft: true,
        overrideAccess: true,
        req,
        data: {
          metricRecordCode,
          metricDefinition: definition.id,
          lifecycleStatus: 'calculated',
          scopeLabel: 'Synthetic metric-definition linkage validation',
          calculatedAt,
          numericValue: metric.numericValue,
          numerator: metric.numerator,
          denominator: metric.denominator,
          sampleSize: metric.sampleSize,
          resultSummary: metric.summary,
          calculationMethod:
            'Deterministic synthetic calculation created by the administrator Test Data Batches workflow to validate definition inheritance.',
          project: project.id,
          benchmark: benchmark.id,
          experiment: experiment.id,
          prompt: prompt.id,
          aiSystem: aiSystem.id,
          calculatedBy: researcher.id,
          reproducibility: {
            engineVersion: 'test-data-generator-0.2.0',
            querySnapshot: `scenario = pilot-metric-results; batchCode = ${batchCode}`,
            environmentSnapshot: 'GSLHub administrator Test Data Batches workflow',
          },
          qualityControl: {
            reviewStatus: 'pending',
            reviewers: [],
          },
          notes: `TEST DATA — definition-linked metric result owned by batch ${batchCode}.`,
          _status: 'draft',
        },
      });

      createdRecords.push({
        collectionSlug: 'metrics',
        recordId: String(created.id),
        recordCode: metricRecordCode,
        label: `${metric.metricCode} definition-linked synthetic result`,
      });
    }

    return createdRecords;
  } catch (error) {
    await rollbackMetricResults({ payload, req, records: createdRecords });
    throw error;
  }
};
