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
      localArtifactStorageEnabled:
        storage.enabled && storage.provider === 'local',
      localDirectoryConfigured: Boolean(storage.localDirectory),
    };
    const readyForPilot = Object.values(checks).every(Boolean);

    return Response.json({
      readyForPilot,
      storage,
      checks,
      storagePolicy: {
        currentPhase: 'local',
        directory: storage.localDirectory,
        rationale:
          'Local Payload storage is accepted for the current doctoral research phase. S3-compatible storage will be reassessed when scale, collaboration or preservation requirements increase.',
      },
      recommendations: [
        'Include the local research-artifacts directory in the regular project backup.',
        'Keep MongoDB backups synchronized with file backups so records and evidence remain recoverable together.',
      ],
    });
  },
};
