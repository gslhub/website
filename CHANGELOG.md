# Changelog

All notable GSLHub platform changes are recorded here. Scientific result records and formal dataset releases retain their own governed version history in Payload.

## 0.6.2 — 2026-08-16

### Fixed

- Research Operations dashboard now uses Payload-native `--theme-*` color tokens instead of static `--color-*` values.
- Hero, workflow steps, shortcut cards, borders and secondary text now adapt automatically to Payload light and dark modes with readable contrast.
- No scientific schemas, lifecycle hooks, metric calculators or research records were changed.

## 0.6.1 — 2026-08-15

### Fixed

- Prevented stale HTML from referencing CSS/JS assets from an older self-hosted deployment.
- Added a Next.js `deploymentId` derived from `NEXT_DEPLOYMENT_ID`, the current Git commit, or a safe version fallback.
- Forced the public site document layer to render dynamically so page HTML is not reused across redeploys while hashed static assets keep their normal immutable caching.
- No scientific schemas, lifecycle hooks, metric calculators or research records were changed.

## 0.6.0 — 2026-08-15

### Added

- Responsive Doctoral-ready UI across the public frontend, CMS login and Payload administrator.
- Custom Research Operations dashboard after CMS login.
- English/Spanish localization for the custom Research Operations dashboard.
- Public bilingual Research Infrastructure demonstrator:
  - `/research-infrastructure`
  - `/es/research-infrastructure`
- Direct private Research CMS access from the public header.
- Public/private presentation model separating scientific dissemination from governed research operations.

### Changed

- Public navigation, page spacing, cards, long metadata, CTA groups and dashboard layouts now adapt across mobile, tablet, laptop and desktop.
- Payload scientific tables retain native behavior with safe horizontal panning on smaller screens.
- Admin brand icon now fits the native Payload breadcrumb slot without clipping.
- Mobile GitHub control moved into the menu to prevent overflow.
- Light CTA buttons now enforce dark foreground contrast inside dark sections.
- Package version increased to `0.6.0`.

### Development regression completed

- Full connected research pipeline generated and verified with 27 disposable TEST records.
- Evidence ↔ Research Artifact auto-link verified in the current model.
- Deterministic calculators passed:
  - AIR = `3 / 4 = 0.75`
  - CR = `2 / 4 = 0.50`
  - MCP = `6 / 3 = 2.00`
  - RCR = `3 / 4 = 0.75`
- TEST batches and synthetic metric records were removed successfully.
- Real development reservations remained intact:
  - `GSL-EXEC-GEO-0001` Completed
  - `GSL-EXEC-GEO-0002`–`0005` Planned

### Research boundary

- The platform remains in Development Mode.
- Final Development Reset has not been executed.
- Doctoral Research Mode has not been activated.
- No real doctoral data has been collected.

## 0.5.0–0.5.6 — 2026-08-13 to 2026-08-15

### Added and hardened

- Persistent local research-artifact storage outside deployment releases.
- Restart, redeploy and recovery verification with SHA-256.
- Research Environment controls for Development Mode, TEST cleanup, Final Development Reset and doctoral activation gate.
- Governed Prompt Execution snapshot protection and safe new-session confirmation.
- Semantic environment comparison to avoid false snapshot changes caused by optional empty values.
- Direct Evidence ↔ Research Artifact relationships constrained to the same Prompt Execution.
- Auto-link of Evidence to the unique Research Artifact of the same execution when safe.
- First complete governed development execution `GSL-EXEC-GEO-0001`.
- Validated raw-response and screenshot evidence chain.

## 0.4.2 — 2026-08-04

### Added

- Dedicated `Technical Review` block for Metric Definitions.
- Separate author self-review and independent-review fields.
- Deterministic validation status, review dates, reviewers and bilingual review notes.
- Permanent Administrative Batch action to record the AIR, CR, MCP and RCR author technical review.

### Changed

- AIR, CR, MCP and RCR can document successful deterministic testing without using `Validated At` or `Validated By` prematurely.
- Package version increased from 0.4.1 to 0.4.2.

### Governance and safety

- `Validated At` and `Validated By` must remain empty while a definition is `planned` or `under-review`.
- Formal `Validated` status requires completed technical review and passed deterministic validation.
- Formal validation also requires a completed independent review by a researcher different from the author self-reviewer.
- Technical-review fields become frozen with the rest of the scientific definition after validation.

## 0.4.1 — 2026-08-04

### Added

- Central bilingual registry for AIR, CR, MCP and RCR v0.1.0.
- Idempotent permanent Metric Definition synchronization service.
- English and Spanish synchronization and deterministic-validation runbooks.

### Safety

- Validated or archived definitions cannot be overwritten by synchronization.
- Duplicate identity or code/version records stop the operation before writes.

## 0.4.0 — 2026-07-31

### Changed

- Restored the validated Payload 3.75.0, Next.js 16.2.10 and React 19.2.7 compatibility set.
- Removed the S3 runtime dependency for the current phase.
- Selected local Payload uploads for research artifacts.
- Restored the native Payload administrator in production.
