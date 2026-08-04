import type { Payload, PayloadRequest } from 'payload';

import {
  PILOT_METRIC_CONTEXT,
  PILOT_METRIC_DEFINITIONS,
  type PilotMetricDefinitionSeed,
} from './pilotMetricDefinitionRegistry';

type RecordID = string | number;
type ContextCollection =
  | 'projects'
  | 'benchmarks'
  | 'researchers'
  | 'research-areas'
  | 'resources'
  | 'software';

type DocumentWithID = Record<string, unknown> & {
  id: RecordID;
  definitionCode?: unknown;
  metricCode?: unknown;
  version?: unknown;
  lifecycleStatus?: unknown;
};

type MetricContext = {
  project: DocumentWithID;
  benchmark: DocumentWithID;
  researcher: DocumentWithID;
  researchArea: DocumentWithID;
  resource: DocumentWithID | null;
  software: DocumentWithID | null;
};

type ExistingResolution = {
  metric: PilotMetricDefinitionSeed;
  existing: DocumentWithID | null;
};

export type GeneratedMetricDefinitionRecord = {
  collectionSlug: 'metric-definitions';
  recordId: string;
  recordCode: string;
  label: string;
};

const mutableLifecycleStatuses = new Set(['planned', 'under-review']);

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

export const requirePilotMetricAdmin = (req: PayloadRequest) => {
  const user = req.user as { role?: unknown } | null | undefined;

  if (!user || user.role !== 'admin') {
    throw new Error('Only an administrator can manage pilot metric definitions.');
  }
};

const findContextDocument = async ({
  payload,
  req,
  collection,
  field,
  value,
  required,
}: {
  payload: Payload;
  req: PayloadRequest;
  collection: ContextCollection;
  field: string;
  value: string;
  required: boolean;
}): Promise<DocumentWithID | null> => {
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

  if (result.docs.length > 1) {
    throw new Error(
      `Expected at most one ${collection} record but found ${result.docs.length}: ${field} = ${value}`,
    );
  }

  if (result.docs.length === 0) {
    if (required) {
      throw new Error(`Required ${collection} record not found: ${field} = ${value}`);
    }
    return null;
  }

  return result.docs[0] as DocumentWithID;
};

const requireDocument = (
  document: DocumentWithID | null,
  label: string,
): DocumentWithID => {
  if (!document) throw new Error(`Required pilot context is missing: ${label}.`);
  return document;
};

const resolveMetricContext = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<MetricContext> => {
  const [project, benchmark, researcher, researchArea, resource, software] =
    await Promise.all([
      findContextDocument({
        payload,
        req,
        collection: 'projects',
        field: 'projectCode',
        value: PILOT_METRIC_CONTEXT.projectCode,
        required: true,
      }),
      findContextDocument({
        payload,
        req,
        collection: 'benchmarks',
        field: 'benchmarkCode',
        value: PILOT_METRIC_CONTEXT.benchmarkCode,
        required: true,
      }),
      findContextDocument({
        payload,
        req,
        collection: 'researchers',
        field: 'slug',
        value: PILOT_METRIC_CONTEXT.researcherSlug,
        required: true,
      }),
      findContextDocument({
        payload,
        req,
        collection: 'research-areas',
        field: 'code',
        value: PILOT_METRIC_CONTEXT.researchAreaCode,
        required: true,
      }),
      findContextDocument({
        payload,
        req,
        collection: 'resources',
        field: 'slug',
        value: PILOT_METRIC_CONTEXT.resourceSlug,
        required: false,
      }),
      findContextDocument({
        payload,
        req,
        collection: 'software',
        field: 'slug',
        value: PILOT_METRIC_CONTEXT.softwareSlug,
        required: false,
      }),
    ]);

  return {
    project: requireDocument(project, 'project'),
    benchmark: requireDocument(benchmark, 'benchmark'),
    researcher: requireDocument(researcher, 'researcher'),
    researchArea: requireDocument(researchArea, 'research area'),
    resource,
    software,
  };
};

const resolveExistingDefinitions = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<ExistingResolution[]> => {
  const resolutions: ExistingResolution[] = [];

  for (const metric of PILOT_METRIC_DEFINITIONS) {
    const result = await payload.find({
      collection: 'metric-definitions',
      where: {
        or: [
          { definitionCode: { equals: metric.definitionCode } },
          {
            and: [
              { metricCode: { equals: metric.metricCode } },
              { version: { equals: PILOT_METRIC_CONTEXT.version } },
            ],
          },
        ],
      },
      limit: 3,
      depth: 0,
      pagination: false,
      draft: true,
      overrideAccess: true,
      req,
    });

    if (result.docs.length > 1) {
      throw new Error(
        `Pilot metric synchronization found ${result.docs.length} conflicting records for ${metric.definitionCode}. Resolve duplicates before continuing.`,
      );
    }

    const existing =
      result.docs.length === 1 ? (result.docs[0] as DocumentWithID) : null;

    if (existing) {
      const identityMatches =
        getString(existing.definitionCode) === metric.definitionCode &&
        getString(existing.metricCode) === metric.metricCode &&
        getString(existing.version) === PILOT_METRIC_CONTEXT.version;

      if (!identityMatches) {
        throw new Error(
          `Existing metric identity conflicts with ${metric.definitionCode} ${PILOT_METRIC_CONTEXT.version}. Resolve the record before synchronization.`,
        );
      }

      const lifecycleStatus = getString(existing.lifecycleStatus) || 'planned';
      if (!mutableLifecycleStatuses.has(lifecycleStatus)) {
        throw new Error(
          `${metric.definitionCode} is ${lifecycleStatus} and is scientifically frozen. Create a new semantic version instead of overwriting v${PILOT_METRIC_CONTEXT.version}.`,
        );
      }
    }

    resolutions.push({ metric, existing });
  }

  return resolutions;
};

const mapRequiredInputs = (
  metric: PilotMetricDefinitionSeed,
  locale: 'en' | 'es',
) =>
  metric.requiredInputs.map((input) => ({
    sourceCollection: input.sourceCollection,
    fieldName: input.fieldName,
    required: input.required,
    description: locale === 'en' ? input.descriptionEn : input.descriptionEs,
  }));

const buildSharedData = (
  metric: PilotMetricDefinitionSeed,
  context: MetricContext,
) => ({
  slug: metric.slug,
  definitionCode: metric.definitionCode,
  metricCode: metric.metricCode,
  version: PILOT_METRIC_CONTEXT.version,
  lifecycleStatus: 'under-review' as const,
  category: metric.category,
  direction: metric.direction,
  unitOfAnalysis: 'experiment' as const,
  valueType: 'number' as const,
  unit: metric.unit,
  formula: metric.formula,
  aggregationMethod: metric.aggregationMethod,
  missingDataPolicy: metric.missingDataPolicy,
  roundingPrecision: metric.roundingPrecision,
  validRange: metric.validRange,
  project: context.project.id,
  benchmarks: [context.benchmark.id],
  researchAreas: [context.researchArea.id],
  researchers: [context.researcher.id],
  resources: context.resource ? [context.resource.id] : [],
  software: context.software ? [context.software.id] : [],
  openMethodology: true,
  featured: true,
  _status: 'draft' as const,
});

const applySpanishLocale = async ({
  payload,
  req,
  id,
  metric,
}: {
  payload: Payload;
  req: PayloadRequest;
  id: RecordID;
  metric: PilotMetricDefinitionSeed;
}) => {
  await payload.update({
    collection: 'metric-definitions',
    id,
    locale: 'es',
    fallbackLocale: false,
    draft: true,
    overrideAccess: true,
    req,
    data: {
      title: metric.es.title,
      description: metric.es.description,
      interpretation: metric.es.interpretation,
      pseudocode: metric.es.pseudocode,
      numeratorDefinition: metric.es.numeratorDefinition,
      denominatorDefinition: metric.es.denominatorDefinition,
      assumptions: metric.es.assumptions,
      limitations: metric.es.limitations,
      validationProcedure: metric.es.validationProcedure,
      requiredInputs: mapRequiredInputs(metric, 'es'),
      _status: 'draft',
    },
  });
};

const createDefinition = async ({
  payload,
  req,
  metric,
  context,
}: {
  payload: Payload;
  req: PayloadRequest;
  metric: PilotMetricDefinitionSeed;
  context: MetricContext;
}): Promise<DocumentWithID> => {
  const created = (await payload.create({
    collection: 'metric-definitions',
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    overrideAccess: true,
    req,
    data: {
      ...buildSharedData(metric, context),
      ...metric.en,
      requiredInputs: mapRequiredInputs(metric, 'en'),
    },
  })) as DocumentWithID;

  try {
    await applySpanishLocale({ payload, req, id: created.id, metric });
    return created;
  } catch (error) {
    await payload
      .delete({
        collection: 'metric-definitions',
        id: created.id,
        overrideAccess: true,
        req,
      })
      .catch(() => undefined);
    throw error;
  }
};

const updateDefinition = async ({
  payload,
  req,
  existing,
  metric,
  context,
}: {
  payload: Payload;
  req: PayloadRequest;
  existing: DocumentWithID;
  metric: PilotMetricDefinitionSeed;
  context: MetricContext;
}): Promise<DocumentWithID> => {
  const updated = (await payload.update({
    collection: 'metric-definitions',
    id: existing.id,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    overrideAccess: true,
    req,
    data: {
      ...buildSharedData(metric, context),
      ...metric.en,
      requiredInputs: mapRequiredInputs(metric, 'en'),
    },
  })) as DocumentWithID;

  await applySpanishLocale({ payload, req, id: existing.id, metric });
  return updated;
};

const toGeneratedRecord = (
  metric: PilotMetricDefinitionSeed,
  document: DocumentWithID,
  action: 'created' | 'synchronized',
): GeneratedMetricDefinitionRecord => ({
  collectionSlug: 'metric-definitions',
  recordId: String(document.id),
  recordCode: metric.definitionCode,
  label: `${metric.metricCode} ${PILOT_METRIC_CONTEXT.version} ${action} metric definition`,
});

const rollbackCreatedDefinitions = async ({
  payload,
  req,
  records,
}: {
  payload: Payload;
  req: PayloadRequest;
  records: GeneratedMetricDefinitionRecord[];
}) => {
  for (const record of [...records].reverse()) {
    await payload
      .delete({
        collection: 'metric-definitions',
        id: record.recordId,
        overrideAccess: true,
        req,
      })
      .catch(() => undefined);
  }
};

export const createNewPilotMetricDefinitions = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<GeneratedMetricDefinitionRecord[]> => {
  requirePilotMetricAdmin(req);

  const [context, resolutions] = await Promise.all([
    resolveMetricContext({ payload, req }),
    resolveExistingDefinitions({ payload, req }),
  ]);

  const existingCodes = resolutions
    .filter(({ existing }) => Boolean(existing))
    .map(({ metric }) => metric.metricCode);

  if (existingCodes.length > 0) {
    throw new Error(
      `${existingCodes.join(', ')} ${PILOT_METRIC_CONTEXT.version} already exist. Use permanent synchronization instead of creating duplicate review records.`,
    );
  }

  const createdRecords: GeneratedMetricDefinitionRecord[] = [];

  try {
    for (const { metric } of resolutions) {
      const document = await createDefinition({ payload, req, metric, context });
      createdRecords.push(toGeneratedRecord(metric, document, 'created'));
    }
    return createdRecords;
  } catch (error) {
    await rollbackCreatedDefinitions({ payload, req, records: createdRecords });
    throw error;
  }
};

export const synchronizePermanentPilotMetricDefinitions = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<GeneratedMetricDefinitionRecord[]> => {
  requirePilotMetricAdmin(req);

  const [context, resolutions] = await Promise.all([
    resolveMetricContext({ payload, req }),
    resolveExistingDefinitions({ payload, req }),
  ]);

  const createdRecords: GeneratedMetricDefinitionRecord[] = [];
  const resolvedRecords: GeneratedMetricDefinitionRecord[] = [];

  try {
    for (const { metric, existing } of resolutions) {
      if (existing) {
        const document = await updateDefinition({
          payload,
          req,
          existing,
          metric,
          context,
        });
        resolvedRecords.push(toGeneratedRecord(metric, document, 'synchronized'));
        continue;
      }

      const document = await createDefinition({ payload, req, metric, context });
      const record = toGeneratedRecord(metric, document, 'created');
      createdRecords.push(record);
      resolvedRecords.push(record);
    }

    return resolvedRecords;
  } catch (error) {
    await rollbackCreatedDefinitions({ payload, req, records: createdRecords });
    throw error;
  }
};
