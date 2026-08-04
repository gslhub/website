import type { CollectionBeforeDeleteHook } from 'payload';

import { cleanupTestDataBatch } from '../test-data/testDataBatchLifecycle';

const permanentScenarios = new Set([
  'pilot-permanent-metric-definitions',
  'pilot-metric-technical-review',
  'pilot-real-executions',
]);

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

export const cleanupAdministrativeBatch: CollectionBeforeDeleteHook = async (args) => {
  const batch = (await args.req.payload.findByID({
    collection: 'test-data-batches',
    id: args.id,
    depth: 0,
    overrideAccess: true,
    req: args.req,
  })) as Record<string, unknown>;

  const scenario = getString(batch.scenario);

  if (scenario && permanentScenarios.has(scenario)) {
    args.req.payload.logger.info(
      `Administrative batch ${String(args.id)} was removed without deleting permanent scientific records from scenario ${scenario}.`,
    );
    return;
  }

  await cleanupTestDataBatch(args);
};
