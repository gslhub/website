import type { Endpoint, PayloadRequest } from 'payload';

import { getResearchArtifactStorageReadiness } from '../storage/researchArtifactStorage';

type AdminUser = {
  role?: unknown;
};

const isConfigured = (value: string | undefined): boolean =>
  typeof value === 'string' && value.trim().length > 0;

export const getStorageReadinessEndpoint: Endpoint = {
  path: '/storage-readiness',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    const user = req.user as AdminUser | null | undefined;

    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Only an administrator can inspect storage readiness.' },
        { status: 403 },
      );
    }

    const storage = getResearchArtifactStorageReadiness();
    const checks = {
      databaseConfigured: isConfigured(process.env.DATABASE_URL),
      payloadSecretConfigured: isConfigured(process.env.PAYLOAD_SECRET),
      durableArtifactStorageEnabled: storage.enabled,
      bucketConfigured: Boolean(storage.bucket),
      regionConfigured: Boolean(storage.region),
      endpointValid: storage.endpointHost !== 'invalid-url',
      artifactRoundtripVerified: storage.artifactRoundtripVerified,
      backupRecoveryVerified: storage.backupRecoveryVerified,
    };
    const readyForPilot = Object.values(checks).every(Boolean);
    const verificationStillRequired: string[] = [];

    if (!storage.artifactRoundtripVerified) {
      verificationStillRequired.push(
        'Upload one restricted research artifact, download it through authenticated Payload access and confirm that both SHA-256 values match. Then set PILOT_ARTIFACT_ROUNDTRIP_VERIFIED_AT to the ISO-8601 verification timestamp.',
      );
    }

    if (!storage.backupRecoveryVerified) {
      verificationStillRequired.push(
        'Create a MongoDB and object-storage backup, restore it into an isolated environment and verify record and file checksums. Then set PILOT_BACKUP_RECOVERY_VERIFIED_AT to the ISO-8601 verification timestamp.',
      );
    }

    return Response.json({
      readyForPilot,
      storage,
      checks,
      verificationStillRequired,
    });
  },
};
