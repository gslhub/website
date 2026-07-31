import type { Payload, PayloadRequest } from 'payload';

import { provisionRealPilotExecutions } from './provisionRealPilotExecutions';

export const provisionVerifiedRealPilotExecutions = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}) => provisionRealPilotExecutions({ payload, req });
