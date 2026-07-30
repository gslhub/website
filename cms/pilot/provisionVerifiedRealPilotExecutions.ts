import type { Payload, PayloadRequest } from 'payload';

import { getResearchArtifactStorageReadiness } from '../storage/researchArtifactStorage';
import { provisionRealPilotExecutions } from './provisionRealPilotExecutions';

export const provisionVerifiedRealPilotExecutions = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}) => {
  const storage = getResearchArtifactStorageReadiness();
  const blockers: string[] = [];

  if (!storage.artifactRoundtripVerified) {
    blockers.push(
      'Restricted artifact upload/download SHA-256 verification is missing. Set PILOT_ARTIFACT_ROUNDTRIP_VERIFIED_AT only after the round-trip check succeeds.',
    );
  }

  if (!storage.backupRecoveryVerified) {
    blockers.push(
      'Isolated MongoDB and object-storage recovery verification is missing. Set PILOT_BACKUP_RECOVERY_VERIFIED_AT only after the restore check succeeds.',
    );
  }

  if (blockers.length > 0) {
    throw new Error(
      `Real pilot execution provisioning is blocked:\n- ${blockers.join('\n- ')}`,
    );
  }

  return provisionRealPilotExecutions({ payload, req });
};
