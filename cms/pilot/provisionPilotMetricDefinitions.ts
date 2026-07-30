import type { Payload, PayloadRequest } from 'payload';

import { generatePilotMetricDefinitionRecords } from '../test-data/pilotMetricDefinitionBatch';

type GeneratedRecord = {
  collectionSlug: 'metric-definitions';
  recordId: string;
  recordCode: string;
  label: string;
};

type MetricDefinitionDocument = Record<string, unknown> & {
  id: string | number;
  definitionCode?: unknown;
  metricCode?: unknown;
  version?: unknown;
};

const PILOT_METRICS = ['AIR', 'CR', 'MCP', 'RCR'] as const;
const PILOT_VERSION = '0.1.0';

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const requireAdmin = (req: PayloadRequest) => {
  const user = req.user as { role?: unknown } | null | undefined;

  if (!user || user.role !== 'admin') {
    throw new Error('Only an administrator can provision permanent pilot metric definitions.');
  }
};

const findExistingPilotDefinitions = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<Map<string, MetricDefinitionDocument>> => {
  const definitions = new Map<string, MetricDefinitionDocument>();

  for (const metricCode of PILOT_METRICS) {
    const result = await payload.find({
      collection: 'metric-definitions',
      where: {
        and: [
          { metricCode: { equals: metricCode } },
          { version: { equals: PILOT_VERSION } },
        ],
      },
      limit: 2,
      depth: 0,
      pagination: false,
      draft: true,
      overrideAccess: true,
      req,
    });

    if (result.docs.length > 1) {
      throw new Error(
        `Pilot preparation found more than one ${metricCode} ${PILOT_VERSION} definition. Resolve the duplicate scientific definitions before continuing.`,
      );
    }

    if (result.docs.length === 1) {
      definitions.set(metricCode, result.docs[0] as MetricDefinitionDocument);
    }
  }

  return definitions;
};

export const provisionPermanentPilotMetricDefinitions = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<GeneratedRecord[]> => {
  requireAdmin(req);

  const existing = await findExistingPilotDefinitions({ payload, req });

  if (existing.size === 0) {
    return generatePilotMetricDefinitionRecords({ payload, req });
  }

  if (existing.size !== PILOT_METRICS.length) {
    const present = PILOT_METRICS.filter((metricCode) => existing.has(metricCode));
    const missing = PILOT_METRICS.filter((metricCode) => !existing.has(metricCode));

    throw new Error(
      `Pilot metric-definition provisioning stopped because the set is incomplete. Present: ${present.join(', ') || 'none'}. Missing: ${missing.join(', ') || 'none'}. Restore a coherent four-definition set before retrying.`,
    );
  }

  return PILOT_METRICS.map((metricCode) => {
    const definition = existing.get(metricCode);

    if (!definition) {
      throw new Error(`Pilot definition ${metricCode} ${PILOT_VERSION} could not be resolved.`);
    }

    const definitionCode =
      getString(definition.definitionCode) || `GSL-MDEF-${metricCode}-UNKNOWN`;

    return {
      collectionSlug: 'metric-definitions',
      recordId: String(definition.id),
      recordCode: definitionCode,
      label: `${metricCode} ${PILOT_VERSION} permanent pilot metric definition`,
    };
  });
};
