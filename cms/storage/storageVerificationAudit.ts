import { createHash, randomUUID } from 'node:crypto';
import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import type {
  CollectionBeforeValidateHook,
  Payload,
  PayloadRequest,
} from 'payload';

import packageJson from '../../package.json';
import {
  getResearchArtifactStorageReadiness,
  researchArtifactStorageSettings,
} from './researchArtifactStorage';

type RecordID = string | number;
type ArtifactDocument = Record<string, unknown> & {
  id: RecordID;
  artifactCode?: unknown;
  filename?: unknown;
  filesize?: unknown;
  integrity?: unknown;
};

type VerificationType = 'roundtrip' | 'recovery';

type VerificationDocument = Record<string, unknown> & {
  id: RecordID;
};

export type PersistedVerificationState = {
  verified: boolean;
  verifiedAt: string | null;
  verifiedPath: string | null;
  auditId: string | null;
  verificationCode: string | null;
  artifactCode: string | null;
  sha256: string | null;
  testedAppVersion: string | null;
  recordedByAppVersion: string | null;
  source: 'database' | 'environment' | null;
};

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const getRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const getRelationshipID = (value: unknown): RecordID | null => {
  if (typeof value === 'string' || typeof value === 'number') return value;
  const record = getRecord(value);
  const id = record.id;
  return typeof id === 'string' || typeof id === 'number' ? id : null;
};

const requireAdmin = (req: PayloadRequest) => {
  const user = req.user as { id?: unknown; role?: unknown } | null | undefined;
  if (!user || user.role !== 'admin') {
    throw new Error('Only an administrator can record storage verification audits.');
  }
  return user;
};

const requireTrueChecks = ({
  data,
  keys,
  label,
}: {
  data: unknown;
  keys: string[];
  label: string;
}) => {
  const checks = getRecord(data);
  const missing = keys.filter((key) => checks[key] !== true);
  if (missing.length > 0) {
    throw new Error(
      `${label} cannot be verified until every required check is confirmed: ${missing.join(', ')}.`,
    );
  }
};

const sha256File = async (filePath: string): Promise<string> => {
  const content = await readFile(filePath);
  return createHash('sha256').update(content).digest('hex');
};

const inspectArtifact = async ({
  payload,
  req,
  artifactID,
}: {
  payload: Payload;
  req: PayloadRequest;
  artifactID: RecordID;
}) => {
  const artifact = (await payload.findByID({
    collection: 'research-artifacts',
    id: artifactID,
    depth: 0,
    overrideAccess: true,
    req,
  })) as ArtifactDocument;

  const artifactCode = getString(artifact.artifactCode);
  const filename = getString(artifact.filename);

  if (!artifactCode || !artifactCode.startsWith('TEST-')) {
    throw new Error(
      'Storage verification audits are restricted to disposable TEST research artifacts.',
    );
  }
  if (!filename) {
    throw new Error(`${artifactCode} does not expose a stored filename.`);
  }

  const safeFilename = path.basename(filename);
  if (safeFilename !== filename) {
    throw new Error('Storage verification refused an unsafe artifact filename.');
  }

  const artifactRoot = path.resolve(researchArtifactStorageSettings.localDirectory);
  const sourcePath = path.resolve(artifactRoot, safeFilename);
  if (!sourcePath.startsWith(`${artifactRoot}${path.sep}`)) {
    throw new Error(
      'Storage verification refused an artifact path outside the configured persistent directory.',
    );
  }

  await access(sourcePath);
  const fileStat = await stat(sourcePath);
  const sha256 = await sha256File(sourcePath);
  const payloadSize = getNumber(artifact.filesize);
  const storedHash = getString(getRecord(artifact.integrity).checksum);

  if (payloadSize !== null && payloadSize !== fileStat.size) {
    throw new Error(
      `${artifactCode} filesize mismatch: Payload=${payloadSize}, filesystem=${fileStat.size}.`,
    );
  }
  if (storedHash && storedHash !== sha256) {
    throw new Error(`${artifactCode} SHA-256 mismatch. Storage audit refused.`);
  }

  return {
    artifact,
    artifactCode,
    filename: safeFilename,
    filesize: fileStat.size,
    sha256,
  };
};

const makeVerificationCode = (type: VerificationType): string => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
  const token = randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `GSL-STORAGE-${type === 'roundtrip' ? 'RT' : 'REC'}-${timestamp}-${token}`;
};

export const prepareStorageVerificationAudit: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create') return data;

  const user = requireAdmin(req);
  const input = data || {};
  const verificationType = getString(input.verificationType) as VerificationType | null;

  if (!verificationType || !new Set<VerificationType>(['roundtrip', 'recovery']).has(verificationType)) {
    throw new Error('A valid storage verification type is required.');
  }

  const artifactID = getRelationshipID(input.artifact);
  if (!artifactID) {
    throw new Error('A disposable TEST research artifact must be selected.');
  }

  let testedAppVersion = getString(input.testedAppVersion);

  if (verificationType === 'roundtrip') {
    if (!testedAppVersion) {
      throw new Error(
        'Roundtrip verification requires the exact GSLHub version that was tested.',
      );
    }
    requireTrueChecks({
      data: input.roundtripEvidence,
      keys: [
        'initialHttp200',
        'restartFilePreserved',
        'restartHttp200',
        'redeployFilePreserved',
        'redeployHttp200',
      ],
      label: 'Roundtrip verification',
    });
  } else {
    testedAppVersion = packageJson.version;
    requireTrueChecks({
      data: input.recoveryEvidence,
      keys: [
        'backupCopyVerified',
        'originalQuarantined',
        'restoredFromBackup',
        'restoredHashMatched',
        'restoredSizeMatched',
      ],
      label: 'Recovery verification',
    });
  }

  const snapshot = await inspectArtifact({
    payload: req.payload,
    req,
    artifactID,
  });
  const userID = getRelationshipID(user);

  return {
    ...input,
    verificationCode: makeVerificationCode(verificationType),
    status: 'verified',
    source:
      verificationType === 'roundtrip'
        ? 'manual-roundtrip-attestation'
        : 'automated-recovery-drill',
    storagePath: researchArtifactStorageSettings.localDirectory,
    artifactCode: snapshot.artifactCode,
    filename: snapshot.filename,
    sha256: snapshot.sha256,
    filesize: snapshot.filesize,
    testedAppVersion,
    recordedByAppVersion: packageJson.version,
    verifiedAt: new Date().toISOString(),
    verifiedBy: userID,
  };
};

const findPersistedVerification = async ({
  payload,
  req,
  type,
}: {
  payload: Payload;
  req: PayloadRequest;
  type: VerificationType;
}): Promise<PersistedVerificationState | null> => {
  const result = await payload.find({
    collection: 'storage-verifications',
    where: {
      and: [
        { verificationType: { equals: type } },
        { status: { equals: 'verified' } },
        {
          storagePath: {
            equals: researchArtifactStorageSettings.localDirectory,
          },
        },
      ],
    },
    sort: '-verifiedAt',
    limit: 1,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  });

  const audit = result.docs[0] as VerificationDocument | undefined;
  if (!audit) return null;

  return {
    verified: true,
    verifiedAt: getString(audit.verifiedAt),
    verifiedPath: getString(audit.storagePath),
    auditId: String(audit.id),
    verificationCode: getString(audit.verificationCode),
    artifactCode: getString(audit.artifactCode),
    sha256: getString(audit.sha256),
    testedAppVersion: getString(audit.testedAppVersion),
    recordedByAppVersion: getString(audit.recordedByAppVersion),
    source: 'database',
  };
};

const environmentFallback = ({
  verified,
  verifiedAt,
  verifiedPath,
}: {
  verified: boolean;
  verifiedAt: string | null;
  verifiedPath: string | null;
}): PersistedVerificationState => ({
  verified,
  verifiedAt,
  verifiedPath,
  auditId: null,
  verificationCode: null,
  artifactCode: null,
  sha256: null,
  testedAppVersion: null,
  recordedByAppVersion: null,
  source: verified ? 'environment' : null,
});

export const getPersistedStorageVerificationReadiness = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}) => {
  const storage = getResearchArtifactStorageReadiness();
  const [persistedRoundtrip, persistedRecovery] = await Promise.all([
    findPersistedVerification({ payload, req, type: 'roundtrip' }),
    findPersistedVerification({ payload, req, type: 'recovery' }),
  ]);

  return {
    roundtrip:
      persistedRoundtrip ||
      environmentFallback({
        verified: storage.artifactRoundtripVerified,
        verifiedAt: storage.artifactRoundtripVerifiedAt,
        verifiedPath: storage.artifactRoundtripVerifiedPath,
      }),
    recovery:
      persistedRecovery ||
      environmentFallback({
        verified: storage.backupRecoveryVerified,
        verifiedAt: storage.backupRecoveryVerifiedAt,
        verifiedPath: storage.backupRecoveryVerifiedPath,
      }),
  };
};
