import type {
  CollectionBeforeDeleteHook,
  Payload,
  PayloadRequest,
} from 'payload';

import {
  createNewPilotMetricDefinitions,
  requirePilotMetricAdmin,
  type GeneratedMetricDefinitionRecord,
} from '../metrics/pilotMetricDefinitionService';

type RecordID = string | number;

type BatchDocument = {
  id: RecordID;
  scenario?: unknown;
  records?: unknown;
};

type MetricDefinitionDocument = Record<string, unknown> & {
  id: RecordID;
  definitionCode?: unknown;
  lifecycleStatus?: unknown;
  _status?: unknown;
};

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

export const generatePilotMetricDefinitionRecords = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<GeneratedMetricDefinitionRecord[]> =>
  createNewPilotMetricDefinitions({ payload, req });

const normalizeMetricDefinitionRecords = (
  value: unknown,
): GeneratedMetricDefinitionRecord[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];

    const record = item as Record<string, unknown>;
    const collectionSlug = getString(record.collectionSlug);
    const recordId = getString(record.recordId);
    const recordCode = getString(record.recordCode);
    const label = getString(record.label);

    if (
      collectionSlug !== 'metric-definitions' ||
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

export const cleanupPilotMetricDefinitionBatch: CollectionBeforeDeleteHook = async ({
  id,
  req,
}) => {
  requirePilotMetricAdmin(req);

  const batch = (await req.payload.findByID({
    collection: 'test-data-batches',
    id,
    depth: 0,
    overrideAccess: true,
    req,
  })) as BatchDocument;

  if (getString(batch.scenario) !== 'pilot-metric-definitions') return;

  const records = normalizeMetricDefinitionRecords(batch.records);
  let deleted = 0;
  let preserved = 0;

  for (const record of [...records].reverse()) {
    const existing = await req.payload.find({
      collection: 'metric-definitions',
      where: { id: { equals: record.recordId } },
      limit: 1,
      depth: 0,
      pagination: false,
      draft: true,
      overrideAccess: true,
      req,
    });

    if (existing.docs.length === 0) continue;

    const document = existing.docs[0] as MetricDefinitionDocument;
    const currentCode = getString(document.definitionCode);

    if (currentCode !== record.recordCode) {
      throw new Error(
        `Cleanup refused for metric definition ${record.recordId}: its definitionCode no longer matches the tracked record.`,
      );
    }

    const lifecycleStatus = getString(document.lifecycleStatus);
    const editorialStatus = getString(document._status);

    if (lifecycleStatus !== 'under-review' || editorialStatus !== 'draft') {
      preserved += 1;
      req.payload.logger.info(
        `Metric definition ${record.recordCode} was preserved because it has been promoted beyond Under review / Draft.`,
      );
      continue;
    }

    await req.payload.delete({
      collection: 'metric-definitions',
      id: record.recordId,
      overrideAccess: true,
      req,
    });
    deleted += 1;
  }

  req.payload.logger.info(
    `Pilot metric-definition batch removed ${deleted} review drafts and preserved ${preserved} promoted definitions.`,
  );
};
