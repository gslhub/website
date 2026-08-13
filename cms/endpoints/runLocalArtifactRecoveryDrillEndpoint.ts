import type { Endpoint, PayloadRequest } from 'payload';

import { runLocalArtifactRecoveryDrill } from '../storage/runLocalArtifactRecoveryDrill';

type AdminUser = { role?: unknown };
type BatchDocument = {
  id: string | number;
  scenario?: unknown;
  status?: unknown;
  errorMessage?: unknown;
  recordCount?: unknown;
};

const getRouteID = (req: PayloadRequest): string | number | null => {
  const value = req.routeParams?.id;
  return typeof value === 'string' || typeof value === 'number' ? value : null;
};

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

export const runLocalArtifactRecoveryDrillEndpoint: Endpoint = {
  path: '/:id/local-artifact-recovery',
  method: 'post',
  handler: async (req) => {
    const user = req.user as AdminUser | null | undefined;
    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Only an administrator can run the local artifact recovery drill.' },
        { status: 403 },
      );
    }

    const id = getRouteID(req);
    if (!id) {
      return Response.json(
        { error: 'A valid administrative batch ID is required.' },
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

      if (getString(batch.scenario) !== 'pilot-local-artifact-recovery-drill') {
        return Response.json(
          { error: 'This endpoint only accepts the local artifact recovery drill scenario.' },
          { status: 400 },
        );
      }

      if (batch.status === 'generated') {
        return Response.json(
          { error: 'This recovery drill batch has already completed.' },
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

      const records = await runLocalArtifactRecoveryDrill({
        payload: req.payload,
        req,
      });

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

      return Response.json({
        message: 'Local artifact backup/recovery drill completed successfully.',
        status: 'generated',
        recordCount: records.length,
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
        `Local artifact recovery drill failed for administrative batch ${id}: ${message}`,
      );

      return Response.json({ error: message }, { status: 500 });
    }
  },
};
