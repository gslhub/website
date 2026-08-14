import { createHash, randomUUID } from 'node:crypto';
import { access, copyFile, mkdir, readFile, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';

import type { Payload, PayloadRequest } from 'payload';

import { researchArtifactStorageSettings } from './researchArtifactStorage';

type RecordID = string | number;
type ArtifactDocument = Record<string, unknown> & {
  id: RecordID;
  artifactCode?: unknown;
  filename?: unknown;
  filesize?: unknown;
  integrity?: unknown;
};

type VerificationDocument = Record<string, unknown> & {
  id: RecordID;
  verificationCode?: unknown;
};

export type LocalRecoveryDrillRecord = {
  collectionSlug: 'research-artifacts';
  recordId: string;
  recordCode: string;
  label: string;
};

const RECOVERY_DIRECTORY = '.gslhub-local-recovery-drill';

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const getRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const requireAdmin = (req: PayloadRequest) => {
  const user = req.user as { role?: unknown } | null | undefined;
  if (!user || user.role !== 'admin') {
    throw new Error('Only an administrator can run the local artifact recovery drill.');
  }
};

const sha256File = async (filePath: string): Promise<string> => {
  const content = await readFile(filePath);
  return createHash('sha256').update(content).digest('hex');
};

const findLatestTestArtifact = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<ArtifactDocument> => {
  const result = await payload.find({
    collection: 'research-artifacts',
    limit: 100,
    depth: 0,
    pagination: false,
    sort: '-createdAt',
    overrideAccess: true,
    req,
  });

  const artifact = result.docs.find((document) => {
    const code = getString((document as Record<string, unknown>).artifactCode);
    return code?.startsWith('TEST-');
  });

  if (!artifact) {
    throw new Error(
      'No TEST research artifact is available. Create a disposable TEST artifact before running the recovery drill.',
    );
  }

  return artifact as ArtifactDocument;
};

export const runLocalArtifactRecoveryDrill = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<LocalRecoveryDrillRecord[]> => {
  requireAdmin(req);

  const artifact = await findLatestTestArtifact({ payload, req });
  const artifactCode = getString(artifact.artifactCode);
  const filename = getString(artifact.filename);

  if (!artifactCode || !artifactCode.startsWith('TEST-')) {
    throw new Error('Recovery drill refused because the selected artifact is not disposable TEST data.');
  }

  if (!filename) {
    throw new Error(`${artifactCode} does not expose a stored filename.`);
  }

  const safeFilename = path.basename(filename);
  if (safeFilename !== filename) {
    throw new Error('Recovery drill refused an unsafe artifact filename.');
  }

  const artifactRoot = path.resolve(researchArtifactStorageSettings.localDirectory);
  const sourcePath = path.resolve(artifactRoot, safeFilename);
  if (!sourcePath.startsWith(`${artifactRoot}${path.sep}`)) {
    throw new Error('Recovery drill refused an artifact path outside the configured persistent directory.');
  }

  await access(sourcePath);

  const originalStat = await stat(sourcePath);
  const originalSize = originalStat.size;
  const payloadSize = getNumber(artifact.filesize);
  const originalHash = await sha256File(sourcePath);
  const storedHash = getString(getRecord(artifact.integrity).checksum);

  if (payloadSize !== null && payloadSize !== originalSize) {
    throw new Error(
      `${artifactCode} filesize mismatch before backup: Payload=${payloadSize}, filesystem=${originalSize}.`,
    );
  }

  if (storedHash && storedHash !== originalHash) {
    throw new Error(
      `${artifactCode} SHA-256 mismatch before backup. Refusing to alter the original file.`,
    );
  }

  const recoveryRoot = path.join(artifactRoot, RECOVERY_DIRECTORY);
  await mkdir(recoveryRoot, { recursive: true });

  const token = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  const backupPath = path.join(recoveryRoot, `${safeFilename}.${token}.backup`);
  const quarantinePath = path.join(recoveryRoot, `${safeFilename}.${token}.original`);

  let originalMoved = false;

  try {
    await copyFile(sourcePath, backupPath);

    const backupHash = await sha256File(backupPath);
    const backupStat = await stat(backupPath);
    if (backupHash !== originalHash || backupStat.size !== originalSize) {
      throw new Error('Backup copy verification failed before the recovery phase.');
    }

    await rename(sourcePath, quarantinePath);
    originalMoved = true;

    await copyFile(backupPath, sourcePath);

    const restoredHash = await sha256File(sourcePath);
    const restoredStat = await stat(sourcePath);
    if (restoredHash !== originalHash || restoredStat.size !== originalSize) {
      throw new Error('Restored artifact does not match the original SHA-256 and filesize.');
    }

    await rm(quarantinePath, { force: true });
    originalMoved = false;
    await rm(backupPath, { force: true });

    const audit = (await payload.create({
      collection: 'storage-verifications',
      overrideAccess: true,
      req,
      data: {
        verificationType: 'recovery',
        artifact: artifact.id,
        recoveryEvidence: {
          backupCopyVerified: true,
          originalQuarantined: true,
          restoredFromBackup: true,
          restoredHashMatched: true,
          restoredSizeMatched: true,
        },
        notes:
          'Automated local artifact backup/recovery drill. The verified backup copy replaced a temporarily quarantined original and the restored SHA-256 and filesize matched the pre-drill values.',
      },
    })) as VerificationDocument;

    const verificationCode = getString(audit.verificationCode) || String(audit.id);

    payload.logger.info(
      `Local artifact recovery drill passed for ${artifactCode}: ${originalSize} bytes, SHA-256 ${originalHash}. Audit ${verificationCode}.`,
    );

    return [
      {
        collectionSlug: 'research-artifacts',
        recordId: String(artifact.id),
        recordCode: artifactCode,
        label: `Local recovery drill passed — ${originalSize} bytes — SHA-256 ${originalHash} — audit ${verificationCode}`,
      },
    ];
  } catch (error) {
    if (originalMoved) {
      await rm(sourcePath, { force: true }).catch(() => undefined);
      await rename(quarantinePath, sourcePath).catch(async () => {
        await copyFile(backupPath, sourcePath).catch(() => undefined);
      });
    }

    await rm(backupPath, { force: true }).catch(() => undefined);
    await rm(quarantinePath, { force: true }).catch(() => undefined);

    throw error;
  }
};
