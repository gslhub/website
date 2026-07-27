import type { CollectionBeforeDeleteHook, PayloadRequest } from 'payload';

type BatchDocument = {
  scenario?: unknown;
  records?: unknown;
};

type TrackedDefinition = {
  recordId: string;
  recordCode: string;
};

type MetricDefinitionDocument = {
  definitionCode?: unknown;
  lifecycleStatus?: unknown;
  _status?: unknown;
};

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const requireAdmin = (req: PayloadRequest) => {
  const user = req.user as { role?: unknown } | null | undefined;

  if (!user || user.role !== 'admin') {
    throw new Error(
      'Only an administrator can remove automatically provisioned metric-definition test data.',
    );
  }
};

const normalizeTrackedDefinitions = (value: unknown): TrackedDefinition[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];

    const record = item as Record<string, unknown>;
    const collectionSlug = getString(record.collectionSlug);
    const recordId = getString(record.recordId);
    const recordCode = getString(record.recordCode);

    if (
      collectionSlug !== 'metric-definitions' ||
      !recordId ||
      !recordCode
    ) {
      return [];
    }

    return [{ recordId, recordCode }];
  });
};

export const cleanupPilotMetricResultDefinitions: CollectionBeforeDeleteHook = async ({
  id,
  req,
}) => {
  requireAdmin(req);

  const batch = (await req.payload.findByID({
    collection: 'test-data-batches',
    id,
    depth: 0,
    overrideAccess: true,
    req,
  })) as BatchDocument;

  const scenario = getString(batch.scenario);

  if (
    scenario !== 'pilot-metric-results' &&
    scenario !== 'air-deterministic-validation' &&
    scenario !== 'cr-deterministic-validation' &&
    scenario !== 'mcp-deterministic-validation'
  ) {
    return;
  }

  const definitions = normalizeTrackedDefinitions(batch.records);
  let deleted = 0;
  let preserved = 0;

  for (const tracked of [...definitions].reverse()) {
    const result = await req.payload.find({
      collection: 'metric-definitions',
      where: { id: { equals: tracked.recordId } },
      limit: 1,
      depth: 0,
      pagination: false,
      draft: true,
      overrideAccess: true,
      req,
    });

    if (result.docs.length === 0) continue;

    const definition = result.docs[0] as MetricDefinitionDocument;
    const definitionCode = getString(definition.definitionCode);

    if (definitionCode !== tracked.recordCode) {
      throw new Error(
        `Cleanup refused for metric definition ${tracked.recordId}: its definitionCode no longer matches the tracked batch record.`,
      );
    }

    const lifecycleStatus = getString(definition.lifecycleStatus);
    const editorialStatus = getString(definition._status);

    if (lifecycleStatus !== 'under-review' || editorialStatus !== 'draft') {
      preserved += 1;
      req.payload.logger.info(
        `Metric definition ${tracked.recordCode} was preserved because it has been promoted beyond Under review / Draft.`,
      );
      continue;
    }

    await req.payload.delete({
      collection: 'metric-definitions',
      id: tracked.recordId,
      overrideAccess: true,
      req,
    });
    deleted += 1;
  }

  req.payload.logger.info(
    `Automatic prerequisite cleanup removed ${deleted} Metric Definitions and preserved ${preserved} promoted definitions for scenario ${scenario}.`,
  );
};
