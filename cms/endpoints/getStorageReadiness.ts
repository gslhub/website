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
    };
    const readyForPilot = Object.values(checks).every(Boolean);

    return Response.json({
      readyForPilot,
      storage,
      checks,
      verificationStillRequired: [
        'Upload one restricted research artifact and confirm its SHA-256 checksum.',
        'Download the artifact through authenticated Payload access and compare the checksum.',
        'Create a MongoDB and object-storage backup using the documented procedure.',
        'Restore the backup into an isolated environment and verify record and file checksums.',
      ],
    });
  },
};
