import type { Endpoint, PayloadRequest } from 'payload';

import {
  activateDoctoralResearchMode,
  executeDevelopmentReset,
  getDoctoralActivationReadiness,
  previewDevelopmentReset,
} from '../research/developmentResetService';

type RequestBody = {
  scope?: unknown;
  confirmation?: unknown;
};

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const readBody = async (req: PayloadRequest): Promise<RequestBody> => {
  if (typeof req.json !== 'function') return {};

  try {
    return (await req.json()) as RequestBody;
  } catch {
    return {};
  }
};

const errorResponse = (error: unknown, status = 400) =>
  Response.json(
    { error: error instanceof Error ? error.message : String(error) },
    { status },
  );

const previewEndpoint: Endpoint = {
  path: '/development-reset/preview',
  method: 'post',
  handler: async (req) => {
    try {
      const body = await readBody(req);
      const scope = getString(body.scope);
      if (scope !== 'test' && scope !== 'final') {
        return Response.json({ error: 'Reset scope must be test or final.' }, { status: 400 });
      }

      const preview = await previewDevelopmentReset({
        payload: req.payload,
        req,
        scope,
      });
      return Response.json(preview);
    } catch (error) {
      return errorResponse(error, 403);
    }
  },
};

const executeEndpoint: Endpoint = {
  path: '/development-reset/execute',
  method: 'post',
  handler: async (req) => {
    try {
      const body = await readBody(req);
      const scope = getString(body.scope);
      const confirmation = getString(body.confirmation);

      if (scope !== 'test' && scope !== 'final') {
        return Response.json({ error: 'Reset scope must be test or final.' }, { status: 400 });
      }

      const expectedConfirmation =
        scope === 'final' ? 'FINAL DEVELOPMENT RESET' : 'RESET TEST DATA';
      if (confirmation !== expectedConfirmation) {
        return Response.json(
          { error: `Type exactly ${expectedConfirmation} to authorize this reset.` },
          { status: 409 },
        );
      }

      const summary = await executeDevelopmentReset({
        payload: req.payload,
        req,
        scope,
      });
      return Response.json({
        message:
          scope === 'final'
            ? 'Final development reset completed. GSLHub remains in Development mode until Doctoral Research Mode is explicitly activated.'
            : 'Disposable TEST data reset completed.',
        summary,
      });
    } catch (error) {
      return errorResponse(error, 409);
    }
  },
};

const doctoralReadinessEndpoint: Endpoint = {
  path: '/development-reset/doctoral-readiness',
  method: 'get',
  handler: async (req) => {
    try {
      const readiness = await getDoctoralActivationReadiness({
        payload: req.payload,
        req,
      });
      return Response.json(readiness);
    } catch (error) {
      return errorResponse(error, 403);
    }
  },
};

const activateDoctoralEndpoint: Endpoint = {
  path: '/development-reset/activate-doctoral',
  method: 'post',
  handler: async (req) => {
    try {
      const body = await readBody(req);
      const confirmation = getString(body.confirmation);
      const expectedConfirmation = 'ACTIVATE DOCTORAL RESEARCH MODE';

      if (confirmation !== expectedConfirmation) {
        return Response.json(
          { error: `Type exactly ${expectedConfirmation} to activate the irreversible research mode boundary.` },
          { status: 409 },
        );
      }

      const result = await activateDoctoralResearchMode({
        payload: req.payload,
        req,
      });
      return Response.json({
        message:
          'Doctoral Research Mode activated. Synthetic TEST generation and application-level reset actions are now disabled.',
        ...result,
      });
    } catch (error) {
      return errorResponse(error, 409);
    }
  },
};

export const developmentResetEndpoints: Endpoint[] = [
  previewEndpoint,
  executeEndpoint,
  doctoralReadinessEndpoint,
  activateDoctoralEndpoint,
];
