import type { Payload, PayloadRequest } from 'payload';

import {
  PILOT_METRIC_CONTEXT,
  PILOT_METRIC_DEFINITIONS,
} from './pilotMetricDefinitionRegistry';
import { requirePilotMetricAdmin } from './pilotMetricDefinitionService';

type RecordID = string | number;
type RelationshipValue =
  | string
  | number
  | { id?: string | number | null }
  | null
  | undefined;

type MetricDefinitionDocument = Record<string, unknown> & {
  id: RecordID;
  definitionCode?: unknown;
  metricCode?: unknown;
  version?: unknown;
  lifecycleStatus?: unknown;
  technicalReview?: unknown;
};

type ResearcherDocument = Record<string, unknown> & {
  id: RecordID;
  slug?: unknown;
};

export type TechnicalReviewRecord = {
  collectionSlug: 'metric-definitions';
  recordId: string;
  recordCode: string;
  label: string;
};

const expectedResults: Record<
  'AIR' | 'CR' | 'MCP' | 'RCR',
  { en: string; es: string }
> = {
  AIR: {
    en: 'AIR deterministic validation passed with 3 included targets among 4 eligible observations (0.7500) and 1 reported exclusion.',
    es: 'La validación determinista de AIR fue superada con 3 objetivos incluidos entre 4 observaciones elegibles (0,7500) y 1 exclusión informada.',
  },
  CR: {
    en: 'CR deterministic validation passed with 2 cited executions among 4 eligible observations (0.5000) and 1 reported exclusion.',
    es: 'La validación determinista de CR fue superada con 2 ejecuciones citadas entre 4 observaciones elegibles (0,5000) y 1 exclusión informada.',
  },
  MCP: {
    en: 'MCP deterministic validation passed with eligible positions 1, 2 and 3, producing a mean citation position of 2.00; uncited and excluded observations were reported separately.',
    es: 'La validación determinista de MCP fue superada con las posiciones elegibles 1, 2 y 3, que produjeron una posición media de citación de 2,00; las observaciones sin cita y excluidas se informaron por separado.',
  },
  RCR: {
    en: 'RCR deterministic validation passed with one frozen baseline and comparison levels none, low, low and high, producing 3 consistent comparisons among 4 evaluated comparisons (0.7500).',
    es: 'La validación determinista de RCR fue superada con una base congelada y los niveles de comparación none, low, low y high, que produjeron 3 comparaciones consistentes entre 4 comparaciones evaluadas (0,7500).',
  },
};

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const getRelationshipID = (value: RelationshipValue): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    const id = value.id;
    return typeof id === 'string' || typeof id === 'number' ? String(id) : null;
  }
  return null;
};

const getRelationshipIDs = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.flatMap((item) => {
        const id = getRelationshipID(item as RelationshipValue);
        return id ? [id] : [];
      })
    : [];

const findResearcher = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<ResearcherDocument> => {
  const result = await payload.find({
    collection: 'researchers',
    where: { slug: { equals: PILOT_METRIC_CONTEXT.researcherSlug } },
    limit: 2,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  });

  if (result.docs.length !== 1) {
    throw new Error(
      `Expected exactly one researcher with slug ${PILOT_METRIC_CONTEXT.researcherSlug}; found ${result.docs.length}.`,
    );
  }

  return result.docs[0] as ResearcherDocument;
};

const findDefinition = async ({
  payload,
  req,
  definitionCode,
}: {
  payload: Payload;
  req: PayloadRequest;
  definitionCode: string;
}): Promise<MetricDefinitionDocument> => {
  const result = await payload.find({
    collection: 'metric-definitions',
    where: { definitionCode: { equals: definitionCode } },
    limit: 2,
    depth: 0,
    pagination: false,
    draft: true,
    locale: 'en',
    fallbackLocale: false,
    overrideAccess: true,
    req,
  });

  if (result.docs.length !== 1) {
    throw new Error(
      `Expected exactly one permanent metric definition ${definitionCode}; found ${result.docs.length}.`,
    );
  }

  return result.docs[0] as MetricDefinitionDocument;
};

const buildTechnicalReview = ({
  existing,
  researcherID,
  reviewedAt,
  notes,
}: {
  existing: MetricDefinitionDocument;
  researcherID: RecordID;
  reviewedAt: string;
  notes: string;
}) => {
  const previous = getRecord(existing.technicalReview);
  const previousIndependentStatus =
    getString(previous.independentReviewStatus) || 'pending';
  const priorReviewedBy = getRelationshipIDs(previous.reviewedBy);
  const reviewerIDs = Array.from(
    new Set([...priorReviewedBy, String(researcherID)]),
  );

  return {
    status: 'completed',
    reviewMode:
      previousIndependentStatus === 'completed'
        ? 'mixed-review'
        : 'author-self-review',
    reviewedAt: previous.reviewedAt || reviewedAt,
    reviewedBy: reviewerIDs,
    deterministicValidationStatus: 'passed',
    independentReviewStatus: previousIndependentStatus,
    independentReviewedAt: previous.independentReviewedAt || null,
    independentReviewedBy: getRelationshipIDs(previous.independentReviewedBy),
    notes,
  };
};

export const recordPilotMetricTechnicalReview = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<TechnicalReviewRecord[]> => {
  requirePilotMetricAdmin(req);

  const researcher = await findResearcher({ payload, req });
  const reviewedAt = new Date().toISOString();
  const records: TechnicalReviewRecord[] = [];

  for (const metric of PILOT_METRIC_DEFINITIONS) {
    const definition = await findDefinition({
      payload,
      req,
      definitionCode: metric.definitionCode,
    });

    const lifecycleStatus = getString(definition.lifecycleStatus);
    const metricCode = getString(definition.metricCode);
    const version = getString(definition.version);

    if (
      lifecycleStatus !== 'under-review' ||
      metricCode !== metric.metricCode ||
      version !== PILOT_METRIC_CONTEXT.version
    ) {
      throw new Error(
        `${metric.definitionCode} must be ${metric.metricCode} v${PILOT_METRIC_CONTEXT.version} in Under review before recording the author technical review.`,
      );
    }

    const EnglishReview = buildTechnicalReview({
      existing: definition,
      researcherID: researcher.id,
      reviewedAt,
      notes: `${expectedResults[metric.metricCode].en} Author technical self-review completed by Eduardo José Yauri Luna. Metric definition remains Under review until an independent researcher completes the external review. Synthetic TEST records were removed after verification; permanent definitions were preserved.`,
    });

    await payload.update({
      collection: 'metric-definitions',
      id: definition.id,
      locale: 'en',
      fallbackLocale: false,
      draft: true,
      overrideAccess: true,
      req,
      data: {
        technicalReview: EnglishReview,
        _status: 'draft',
      },
    });

    await payload.update({
      collection: 'metric-definitions',
      id: definition.id,
      locale: 'es',
      fallbackLocale: false,
      draft: true,
      overrideAccess: true,
      req,
      data: {
        technicalReview: {
          ...EnglishReview,
          notes: `${expectedResults[metric.metricCode].es} La autorrevisión técnica fue completada por Eduardo José Yauri Luna. La definición permanece en Under review hasta que una persona investigadora independiente complete la revisión externa. Los registros sintéticos TEST fueron eliminados después de la comprobación y las definiciones permanentes se conservaron.`,
        },
        _status: 'draft',
      },
    });

    records.push({
      collectionSlug: 'metric-definitions',
      recordId: String(definition.id),
      recordCode: metric.definitionCode,
      label: `${metric.metricCode} author technical self-review recorded`,
    });
  }

  return records;
};
