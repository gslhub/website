import type { Endpoint, PayloadRequest } from 'payload';

import { getResearchArtifactStorageReadiness } from '../storage/researchArtifactStorage';
import { getPersistedStorageVerificationReadiness } from '../storage/storageVerificationAudit';

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
    const verification = await getPersistedStorageVerificationReadiness({
      payload: req.payload,
      req,
    });
    const effectiveStorage = {
      ...storage,
      artifactRoundtripVerified: verification.roundtrip.verified,
      artifactRoundtripVerifiedAt: verification.roundtrip.verifiedAt,
      artifactRoundtripVerifiedPath: verification.roundtrip.verifiedPath,
      artifactRoundtripVerificationSource: verification.roundtrip.source,
      backupRecoveryVerified: verification.recovery.verified,
      backupRecoveryVerifiedAt: verification.recovery.verifiedAt,
      backupRecoveryVerifiedPath: verification.recovery.verifiedPath,
      backupRecoveryVerificationSource: verification.recovery.source,
    };
    const checks = {
      databaseConfigured: isConfigured(process.env.DATABASE_URL),
      payloadSecretConfigured: isConfigured(process.env.PAYLOAD_SECRET),
      localArtifactStorageEnabled:
        storage.enabled && storage.provider === 'local',
      localDirectoryConfigured:
        storage.localDirectoryConfigured &&
        storage.localDirectoryIsAbsolute &&
        !storage.localDirectoryInsideDeploymentRoot,
      artifactRoundtripVerified: verification.roundtrip.verified,
      backupRecoveryVerified: verification.recovery.verified,
    };
    const readyForPilot = Object.values(checks).every(Boolean);

    return Response.json({
      readyForPilot,
      storage: effectiveStorage,
      verification,
      checks,
      storagePolicy: {
        currentPhase: 'local',
        directory: storage.localDirectory,
        rationale:
          'Local Payload storage is accepted for the current doctoral research phase when restart/redeploy persistence and backup/recovery are both documented by immutable audits.',
      },
      recommendations: [
        'Include the persistent research-artifacts directory in the regular project backup.',
        'Keep MongoDB backups synchronized with file backups so records and evidence remain recoverable together.',
      ],
    });
  },
};
