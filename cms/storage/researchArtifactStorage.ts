const getString = (value: string | undefined): string | null => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

const getVerifiedAt = (value: string | undefined): string | null => {
  const normalized = getString(value);
  if (!normalized) return null;

  const timestamp = Date.parse(normalized);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
};

const prefix = 'research-artifacts';
const artifactRoundtripVerifiedAt = getVerifiedAt(
  process.env.PILOT_ARTIFACT_ROUNDTRIP_VERIFIED_AT,
);
const backupRecoveryVerifiedAt = getVerifiedAt(
  process.env.PILOT_BACKUP_RECOVERY_VERIFIED_AT,
);

export const researchArtifactStorageSettings = {
  enabled: true,
  provider: 'local' as const,
  bucket: null,
  region: null,
  endpoint: null,
  prefix,
  forcePathStyle: false,
  localDirectory: prefix,
  artifactRoundtripVerifiedAt,
  backupRecoveryVerifiedAt,
};

export const getResearchArtifactStorageReadiness = () => ({
  enabled: true,
  provider: researchArtifactStorageSettings.provider,
  bucket: null,
  region: null,
  endpointConfigured: false,
  endpointHost: null,
  prefix: researchArtifactStorageSettings.prefix,
  localDirectory: researchArtifactStorageSettings.localDirectory,
  forcePathStyle: false,
  credentialsConfigured: false,
  accessControlMode: 'payload-local-upload',
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
