import { s3Storage } from '@payloadcms/storage-s3';

const getString = (value: string | undefined): string | null => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

const getBoolean = (value: string | undefined, fallback = false): boolean => {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) return fallback;
  if (new Set(['1', 'true', 'yes', 'on']).has(normalized)) return true;
  if (new Set(['0', 'false', 'no', 'off']).has(normalized)) return false;

  return fallback;
};

const getVerifiedAt = (value: string | undefined): string | null => {
  const normalized = getString(value);
  if (!normalized) return null;

  const timestamp = Date.parse(normalized);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
};

const enabled = getBoolean(process.env.S3_ENABLED);
const bucket = getString(process.env.S3_BUCKET);
const accessKeyId = getString(process.env.S3_ACCESS_KEY_ID);
const secretAccessKey = getString(process.env.S3_SECRET_ACCESS_KEY);
const region = getString(process.env.S3_REGION) || 'us-east-1';
const endpoint = getString(process.env.S3_ENDPOINT);
const prefix = getString(process.env.S3_PREFIX) || 'research-artifacts';
const forcePathStyle = getBoolean(process.env.S3_FORCE_PATH_STYLE, Boolean(endpoint));
const artifactRoundtripVerifiedAt = getVerifiedAt(
  process.env.PILOT_ARTIFACT_ROUNDTRIP_VERIFIED_AT,
);
const backupRecoveryVerifiedAt = getVerifiedAt(
  process.env.PILOT_BACKUP_RECOVERY_VERIFIED_AT,
);

if (enabled && !bucket) {
  throw new Error('S3_ENABLED=true requires S3_BUCKET.');
}

if (enabled && Boolean(accessKeyId) !== Boolean(secretAccessKey)) {
  throw new Error(
    'S3 storage requires both S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY, or neither when the host provides an IAM-compatible credential chain.',
  );
}

const credentials =
  accessKeyId && secretAccessKey
    ? {
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      }
    : {};

export const researchArtifactStorageSettings = {
  enabled,
  provider: enabled ? ('s3-compatible' as const) : ('local' as const),
  bucket,
  region,
  endpoint,
  prefix,
  forcePathStyle,
  artifactRoundtripVerifiedAt,
  backupRecoveryVerifiedAt,
};

export const getResearchArtifactStorageReadiness = () => ({
  enabled: researchArtifactStorageSettings.enabled,
  provider: researchArtifactStorageSettings.provider,
  bucket: researchArtifactStorageSettings.bucket,
  region: researchArtifactStorageSettings.region,
  endpointConfigured: Boolean(researchArtifactStorageSettings.endpoint),
  endpointHost: (() => {
    if (!researchArtifactStorageSettings.endpoint) return null;

    try {
      return new URL(researchArtifactStorageSettings.endpoint).host;
    } catch {
      return 'invalid-url';
    }
  })(),
  prefix: researchArtifactStorageSettings.prefix,
  forcePathStyle: researchArtifactStorageSettings.forcePathStyle,
  credentialsConfigured: Boolean(accessKeyId && secretAccessKey),
  accessControlMode: 'payload-proxy',
  artifactRoundtripVerifiedAt:
    researchArtifactStorageSettings.artifactRoundtripVerifiedAt,
  artifactRoundtripVerified: Boolean(
    researchArtifactStorageSettings.artifactRoundtripVerifiedAt,
  ),
  backupRecoveryVerifiedAt:
    researchArtifactStorageSettings.backupRecoveryVerifiedAt,
  backupRecoveryVerified: Boolean(
    researchArtifactStorageSettings.backupRecoveryVerifiedAt,
  ),
});

export const researchArtifactStoragePlugin = s3Storage({
  enabled,
  collections: {
    'research-artifacts': {
      prefix,
    },
  },
  bucket: bucket || 'gslhub-storage-disabled',
  config: {
    ...credentials,
    region,
    ...(endpoint ? { endpoint } : {}),
    ...(forcePathStyle ? { forcePathStyle: true } : {}),
  },
});
