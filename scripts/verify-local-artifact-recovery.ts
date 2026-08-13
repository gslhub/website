import { createHash, randomUUID } from 'node:crypto';
import { access, copyFile, mkdir, readFile, readdir, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';

const ARTIFACT_DIRECTORY = path.resolve(process.cwd(), 'research-artifacts');
const RECOVERY_DIRECTORY = path.resolve(process.cwd(), '.gslhub-local-recovery-drill');
const TEST_FILENAME_TOKEN = 'test-gsl-td-';

const sha256File = async (filePath: string): Promise<string> => {
  const content = await readFile(filePath);
  return createHash('sha256').update(content).digest('hex');
};

const findLatestTestArtifact = async (): Promise<string> => {
  const requested = process.env.GSLHUB_RECOVERY_TEST_FILE?.trim();

  if (requested) {
    const safeName = path.basename(requested);
    if (safeName !== requested || !safeName.toLowerCase().includes(TEST_FILENAME_TOKEN)) {
      throw new Error(
        'GSLHUB_RECOVERY_TEST_FILE must be a plain disposable TEST artifact filename containing test-gsl-td-.',
      );
    }
    return safeName;
  }

  const entries = await readdir(ARTIFACT_DIRECTORY, { withFileTypes: true });
  const candidates = await Promise.all(
    entries
      .filter(
        (entry) =>
          entry.isFile() && entry.name.toLowerCase().includes(TEST_FILENAME_TOKEN),
      )
      .map(async (entry) => {
        const filePath = path.join(ARTIFACT_DIRECTORY, entry.name);
        const metadata = await stat(filePath);
        return { name: entry.name, mtimeMs: metadata.mtimeMs };
      }),
  );

  candidates.sort((left, right) => right.mtimeMs - left.mtimeMs);
  const latest = candidates[0];

  if (!latest) {
    throw new Error(
      'No disposable TEST artifact file was found in research-artifacts/. Generate the full research pipeline first.',
    );
  }

  return latest.name;
};

const main = async () => {
  await access(ARTIFACT_DIRECTORY);

  const filename = await findLatestTestArtifact();
  const sourcePath = path.resolve(ARTIFACT_DIRECTORY, filename);

  if (!sourcePath.startsWith(`${ARTIFACT_DIRECTORY}${path.sep}`)) {
    throw new Error('Unsafe artifact path refused.');
  }

  const originalStat = await stat(sourcePath);
  const originalHash = await sha256File(sourcePath);
  const originalSize = originalStat.size;

  await mkdir(RECOVERY_DIRECTORY, { recursive: true });

  const token = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  const backupPath = path.join(RECOVERY_DIRECTORY, `${filename}.${token}.backup`);
  const quarantinePath = path.join(RECOVERY_DIRECTORY, `${filename}.${token}.original`);

  let originalMoved = false;

  try {
    await copyFile(sourcePath, backupPath);

    const backupHash = await sha256File(backupPath);
    const backupStat = await stat(backupPath);
    if (backupHash !== originalHash || backupStat.size !== originalSize) {
      throw new Error('Backup copy verification failed.');
    }

    await rename(sourcePath, quarantinePath);
    originalMoved = true;

    await copyFile(backupPath, sourcePath);

    const restoredHash = await sha256File(sourcePath);
    const restoredStat = await stat(sourcePath);
    if (restoredHash !== originalHash || restoredStat.size !== originalSize) {
      throw new Error('Restored artifact differs from the original file.');
    }

    await rm(quarantinePath, { force: true });
    originalMoved = false;
    await rm(backupPath, { force: true });

    console.log(
      JSON.stringify(
        {
          ok: true,
          testType: 'local-artifact-backup-recovery-drill',
          filename,
          bytes: originalSize,
          sha256: originalHash,
          backupCopyVerified: true,
          originalTemporarilyRemoved: true,
          restoredCopyVerified: true,
          verifiedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    );
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

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
