const getString = (value: string | undefined): string | null => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

const normalizeFilesystemPath = (value: string): string => {
  const normalized = value
    .replace(/\\/g, '/')
    .replace(/\/{2,}/g, '/')
    .trim();

  if (normalized === '/') return normalized;
  return normalized.replace(/\/+$/, '');
};

const joinFilesystemPath = (...parts: string[]): string =>
  normalizeFilesystemPath(parts.filter(Boolean).join('/'));

const getVerifiedAt = (value: string | undefined): string | null => {
  const normalized = getString(value);
  if (!normalized) return null;

  const timestamp = Date.parse(normalized);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
};

const getSiteHost = (): string | null => {
  const siteURL = getString(process.env.NEXT_PUBLIC_SITE_URL);
  if (!siteURL) return null;

  try {
    return new URL(siteURL).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

const prefix = 'research-artifacts';
const configuredLocalDirectory = getString(process.env.RESEARCH_ARTIFACT_LOCAL_DIR);
const deploymentRootValue = getString(process.env.PWD);
const deploymentRoot = deploymentRootValue
  ? normalizeFilesystemPath(deploymentRootValue)
  : null;
const homeDirectoryValue = getString(process.env.HOME);
const homeDirectory = homeDirectoryValue
  ? normalizeFilesystemPath(homeDirectoryValue)
  : null;
const siteHost = getSiteHost();

// Hostinger managed Node deployments rebuild the application directory on redeploy.
// When HOME and NEXT_PUBLIC_SITE_URL are available, keep research uploads in a
// sibling data directory outside the release tree. An explicit env value still
// overrides this automatic location for other production environments.
const automaticPersistentDirectory =
  homeDirectory && siteHost
    ? joinFilesystemPath(
        homeDirectory,
        'domains',
        siteHost,
        'gslhub-data',
        prefix,
      )
    : null;

const localDirectory = configuredLocalDirectory
  ? normalizeFilesystemPath(configuredLocalDirectory)
  : automaticPersistentDirectory || prefix;

const localDirectoryConfigured = Boolean(
  configuredLocalDirectory || automaticPersistentDirectory,
);
const localDirectoryIsAbsolute = localDirectory.startsWith('/');
const localDirectoryInsideDeploymentRoot = deploymentRoot
  ? localDirectory === deploymentRoot ||
    localDirectory.startsWith(`${deploymentRoot}/`)
  : !localDirectoryIsAbsolute;

const artifactRoundtripVerifiedAt = getVerifiedAt(
  process.env.PILOT_ARTIFACT_ROUNDTRIP_VERIFIED_AT,
);
const artifactRoundtripVerifiedPath = getString(
  process.env.PILOT_ARTIFACT_ROUNDTRIP_VERIFIED_PATH,
);
const backupRecoveryVerifiedAt = getVerifiedAt(
  process.env.PILOT_BACKUP_RECOVERY_VERIFIED_AT,
);
const backupRecoveryVerifiedPath = getString(
  process.env.PILOT_BACKUP_RECOVERY_VERIFIED_PATH,
);

const pathMatches = (candidate: string | null): boolean =>
  Boolean(
    candidate && normalizeFilesystemPath(candidate) === localDirectory,
  );

export const researchArtifactStorageSettings = {
  enabled: true,
  provider: 'local' as const,
  bucket: null,
  region: null,
  endpoint: null,
  prefix,
  forcePathStyle: false,
  deploymentRoot,
  homeDirectory,
  siteHost,
  configuredLocalDirectory,
  automaticPersistentDirectory,
  localDirectory,
  localDirectoryConfigured,
  localDirectoryIsAbsolute,
  localDirectoryInsideDeploymentRoot,
  artifactRoundtripVerifiedAt,
  artifactRoundtripVerifiedPath,
  backupRecoveryVerifiedAt,
  backupRecoveryVerifiedPath,
};

export const getResearchArtifactStorageReadiness = () => {
  const artifactRoundtripVerified = Boolean(
    researchArtifactStorageSettings.artifactRoundtripVerifiedAt &&
      pathMatches(researchArtifactStorageSettings.artifactRoundtripVerifiedPath),
  );
  const backupRecoveryVerified = Boolean(
    researchArtifactStorageSettings.backupRecoveryVerifiedAt &&
      pathMatches(researchArtifactStorageSettings.backupRecoveryVerifiedPath),
  );

  return {
    enabled: true,
    provider: researchArtifactStorageSettings.provider,
    prefix: researchArtifactStorageSettings.prefix,
    deploymentRoot: researchArtifactStorageSettings.deploymentRoot,
    localDirectory: researchArtifactStorageSettings.localDirectory,
    localDirectoryConfigured:
      researchArtifactStorageSettings.localDirectoryConfigured,
    localDirectoryIsAbsolute:
      researchArtifactStorageSettings.localDirectoryIsAbsolute,
    localDirectoryInsideDeploymentRoot:
      researchArtifactStorageSettings.localDirectoryInsideDeploymentRoot,
    forcePathStyle: false,
    credentialsConfigured: false,
    accessControlMode: 'payload-local-upload',
    artifactRoundtripVerifiedAt:
      researchArtifactStorageSettings.artifactRoundtripVerifiedAt,
    artifactRoundtripVerifiedPath:
      researchArtifactStorageSettings.artifactRoundtripVerifiedPath,
    artifactRoundtripVerified,
    backupRecoveryVerifiedAt:
      researchArtifactStorageSettings.backupRecoveryVerifiedAt,
    backupRecoveryVerifiedPath:
      researchArtifactStorageSettings.backupRecoveryVerifiedPath,
    backupRecoveryVerified,
  };
};
