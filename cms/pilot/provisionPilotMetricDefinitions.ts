import type { Payload, PayloadRequest } from 'payload';

import {
  synchronizePermanentPilotMetricDefinitions,
  type GeneratedMetricDefinitionRecord,
} from '../metrics/pilotMetricDefinitionService';

export const provisionPermanentPilotMetricDefinitions = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<GeneratedMetricDefinitionRecord[]> =>
  synchronizePermanentPilotMetricDefinitions({ payload, req });
