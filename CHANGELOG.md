# Changelog

All notable GSLHub platform changes are recorded here. Scientific result records and formal dataset releases retain their own governed version history in Payload.

## 0.4.1 — 2026-08-04

### Added

- Central bilingual registry for AIR, CR, MCP and RCR v0.1.0.
- Idempotent permanent Metric Definition synchronization service.
- English and Spanish synchronization and deterministic-validation runbooks.
- Reviewed required-input registries for all four pilot metrics.

### Changed

- Permanent metric provisioning now creates missing definitions and synchronizes existing `planned` or `under-review` records.
- Missing-data policy for all four reviewed definitions is now `report-separately`.
- Disposable metric-definition generation uses the same scientific registry as permanent provisioning.
- Package version increased from 0.4.0 to 0.4.1.

### Safety

- Definitions in `validated`, `active`, `deprecated` or `archived` state cannot be overwritten by synchronization.
- Duplicate identity or code/version records stop the operation before writes.
- A failed Spanish localization after creating an English definition removes the incomplete new record.
- `Validated At` and `Validated By` remain untouched during synchronization.

### Operational sequence

1. Deploy and compile.
2. Run the permanent pilot metric-definition synchronization batch.
3. Verify both locales and `Under review` state.
4. Run AIR, CR, MCP and RCR deterministic scenarios separately.
5. Review and clean their disposable `TEST-` records.

## 0.4.0 — 2026-07-31

### Changed

- Restored the validated Payload 3.75.0, Next.js 16.2.10 and React 19.2.7 compatibility set.
- Removed the S3 runtime dependency for the current doctoral phase.
- Selected local Payload uploads for research artifacts.
- Restored the native Payload administrator in production.
