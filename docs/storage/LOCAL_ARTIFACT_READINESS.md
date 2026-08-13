# Local artifact storage verification for the doctoral pilot

Status: required before the first five real pilot executions.

## Goal

Verify that Payload artifacts stored in `research-artifacts/` remain available after normal application operations and can be recovered together with MongoDB from backup. S3 is not required in the current phase.

## A. Persistence roundtrip

1. Upload a test artifact named `TEST-STORAGE-ROUNDTRIP`.
2. Record filename, size, date and SHA-256 checksum when available.
3. Open the file from Payload and confirm its contents.
4. Restart the Hostinger Node.js application and verify the same file again.
5. Redeploy the same application version and verify the file again.
6. Only after the file remains available and intact, set:

```text
PILOT_ARTIFACT_ROUNDTRIP_VERIFIED_AT=YYYY-MM-DDTHH:MM:SSZ
```

If the file is not present after redeployment, leave the variable empty and change the artifact-storage strategy before the real pilot.

## B. Backup and recovery

The backup must include MongoDB `gslhub`, the complete `research-artifacts/` directory and the required environment configuration.

1. Create the MongoDB backup.
2. Copy `research-artifacts/` to the backup location.
3. Record date, file count and checksums when practical.
4. Restore the backup in a controlled test environment.
5. Confirm that the restored Payload record still opens the corresponding artifact and that its contents are intact.
6. Only after successful recovery, set:

```text
PILOT_BACKUP_RECOVERY_VERIFIED_AT=YYYY-MM-DDTHH:MM:SSZ
```

## Acceptance criterion

Local storage is pilot-ready only when both verification timestamps are present. The timestamps document the verification; they do not replace the backup itself.

Use test artifacts only until restart, redeploy and recovery behavior has been confirmed.
