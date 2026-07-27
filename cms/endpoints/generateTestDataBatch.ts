import type { Endpoint, PayloadRequest } from 'payload';

import { generateAIRMetricValidationRecords } from '../test-data/airMetricValidationBatch';
import { synchronizePilotBenchmarkMetricRegistry } from '../test-data/benchmarkMetricRegistryBatch';
import { generatePilotMetricDefinitionRecords } from '../test-data/pilotMetricDefinitionBatch';
import { generatePilotMetricResultRecords } from '../test-data/pilotMetricResultBatch';
import { generateTestDataBatch } from '../test-data/testDataBatchLifecycle';

type AdminUser = {
  role?: unknown;
};

type BatchDocument = {
  id: string | number;
  batchCode?: unknown;
  status?: unknown;
  scenario?: unknown;
  errorMessage?: unknown;
  recordCount?: unknown;
};

const getRouteID = (req: PayloadRequest): string | number | null => {
  const value = req.routeParams?.id;

  return typeof value === 'string' || typeof value === 'number' ? value : null;
};

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const persistGeneratedRecords = async ({
  req,
  id,
  records,
}: {
  req: PayloadRequest;
  id: string | number;
  records: Array<Record<string, unknown>>;
}) => {
  await req.payload.update({
    collection: 'test-data-batches',
    id,
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
};

export const generateTestDataBatchEndpoint: Endpoint = {
  path: '/:id/generate',
  method: 'post',
  handler: async (req) => {
    const user = req.user as AdminUser | null | undefined;

    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Only an administrator can generate test data.' },
        { status: 403 },
      );
    }

    const id = getRouteID(req);

    if (!id) {
      return Response.json(
        { error: 'A valid test-data batch ID is required.' },
        { status: 400 },
      );
    }

    try {
      const batch = (await req.payload.findByID({
        collection: 'test-data-batches',
        id,
        depth: 0,
        overrideAccess: true,
        req,
      })) as BatchDocument;

      if (batch.status === 'generated') {
        return Response.json(
          {
            error:
              'This test-data batch has already been generated. Delete it before creating another batch.',
          },
          { status: 409 },
        );
      }

      await req.payload.update({
        collection: 'test-data-batches',
        id,
        overrideAccess: true,
        req,
        data: {
          status: 'generating',
          generatedAt: null,
          recordCount: 0,
          records: [],
          errorMessage: null,
        },
      });

      const scenario = getString(batch.scenario);

      if (scenario === 'pilot-metric-definitions') {
        const records = await generatePilotMetricDefinitionRecords({
          payload: req.payload,
          req,
        });

        await persistGeneratedRecords({ req, id, records });
        req.payload.logger.info(
          `Pilot metric-definition batch generated ${records.length} reviewable records.`,
        );
      } else if (scenario === 'pilot-metric-results') {
        const batchCode = getString(batch.batchCode);

        if (!batchCode) {
          throw new Error('The metric-result batch has no valid ownership code.');
        }

        const records = await generatePilotMetricResultRecords({
          payload: req.payload,
          req,
          batchCode,
        });

        await persistGeneratedRecords({ req, id, records });
        req.payload.logger.info(
          `Definition-linked metric-result batch generated ${records.length} calculated test records.`,
        );
      } else if (scenario === 'benchmark-metric-registry-sync') {
        const records = await synchronizePilotBenchmarkMetricRegistry({
          payload: req.payload,
          req,
        });

        await persistGeneratedRecords({ req, id, records });
        req.payload.logger.info(
          `Benchmark metric registry synchronized ${records.length} versioned definitions.`,
        );
      } else if (scenario === 'air-deterministic-validation') {
        const batchCode = getString(batch.batchCode);

        if (!batchCode) {
          throw new Error('The AIR validation batch has no valid ownership code.');
        }

        const records = await generateAIRMetricValidationRecords({
          payload: req.payload,
          req,
          batchCode,
        });

        await persistGeneratedRecords({ req, id, records });
        req.payload.logger.info(
          `AIR deterministic validation generated ${records.length} connected test records.`,
        );
      } else {
        await generateTestDataBatch({
          doc: batch,
          operation: 'create',
          req,
        } as Parameters<typeof generateTestDataBatch>[0]);
      }

      const result = (await req.payload.findByID({
        collection: 'test-data-batches',
        id,
        depth: 0,
        overrideAccess: true,
        req,
      })) as BatchDocument;

      if (result.status === 'failed') {
        return Response.json(
          {
            error:
              getString(result.errorMessage) || 'Test-data generation failed.',
            status: result.status,
          },
          { status: 422 },
        );
      }

      return Response.json({
        message: 'Test data generated successfully.',
        status: result.status,
        recordCount: result.recordCount,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      await req.payload
        .update({
          collection: 'test-data-batches',
          id,
          overrideAccess: true,
          req,
          data: {
            status: 'failed',
            errorMessage: message,
          },
        })
        .catch(() => undefined);

      req.payload.logger.error(
        `Explicit test-data generation failed for batch ${id}: ${message}`,
      );

      return Response.json({ error: message }, { status: 500 });
    }
  },
};
