# Local artifact recovery drill

Status: operational test for the doctoral pre-pilot phase.

## Purpose

Verify that a disposable file stored in `research-artifacts/` can be copied, temporarily removed, restored and recovered with exactly the same filesize and SHA-256 checksum.

The drill only accepts files whose name contains `test-gsl-td-`. It must not be run against real doctoral evidence.

## Command

```bash
npm run verify:local-artifact-recovery
```

By default, the most recently modified TEST file is selected.

To select a specific file:

```bash
GSLHUB_RECOVERY_TEST_FILE="test-artifact-filename.txt" npm run verify:local-artifact-recovery
```

## Operations performed

1. Calculate the original filesize and SHA-256.
2. Create a temporary backup copy.
3. Verify the backup filesize and SHA-256.
4. Temporarily move the original into quarantine.
5. Restore the file from the backup copy.
6. Verify that the restored file exactly matches the original.
7. Remove temporary copies after success.
8. On failure, first attempt to restore the untouched quarantined original.

## Expected result

```json
{
  "ok": true,
  "testType": "local-artifact-backup-recovery-drill",
  "filename": "...test-gsl-td-....txt",
  "bytes": 349,
  "sha256": "...",
  "backupCopyVerified": true,
  "originalTemporarilyRemoved": true,
  "restoredCopyVerified": true,
  "verifiedAt": "YYYY-MM-DDTHH:MM:SSZ"
}
```

Retain the JSON output as operational evidence.

## Scope

This drill demonstrates local-file recovery inside the deployed environment. It is not, by itself, an external backup or a full MongoDB Atlas restoration. The pilot backup strategy must also preserve the `gslhub` database, required environment configuration and an external artifact copy.

Do not populate `PILOT_BACKUP_RECOVERY_VERIFIED_AT` until the recovery procedure required for the phase has actually been executed and documented.
