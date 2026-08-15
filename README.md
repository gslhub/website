<p align="center">
  <img src="./public/brand/gslhub-logo.svg" alt="GSLHub — Generative Search Lab Hub" width="520" />
</p>

<p align="center">
  <strong>Scientific infrastructure for Generative Search, GEO, evidence, governed metrics and reproducible AI research.</strong>
</p>

<p align="center">
  <strong>English</strong> · <a href="./README.es.md">Español</a> · <a href="./docs/ESTADO_PROYECTO_ES.md">Current project status</a>
</p>

<p align="center">
  <a href="https://gslhub.com">Website</a> ·
  <a href="https://gslhub.com/research">Research</a> ·
  <a href="https://gslhub.com/research-infrastructure">Research Infrastructure</a> ·
  <a href="https://gslhub.com/dashboard">Scientific Dashboard</a> ·
  <a href="https://github.com/gslhub">GitHub</a>
</p>

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-doctoral--ready%20UI-2563EB" />
  <img alt="Version" src="https://img.shields.io/badge/platform-0.6.0-7C3AED" />
  <img alt="Payload CMS" src="https://img.shields.io/badge/Payload%20CMS-3.75.0-0B132B" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16.2.10-0B132B" />
  <img alt="Storage" src="https://img.shields.io/badge/artifacts-persistent%20local-16A34A" />
</p>

---

# GSLHub

**GSLHub — Generative Search Lab Hub** is an independent applied-research platform for studying how generative AI systems discover, select, cite, summarize and recommend digital information.

The platform is being developed as research infrastructure for the doctoral line:

> **From SEO to GEO (Generative Engine Optimization): development and validation of a scientific model to optimize organizational visibility in AI-based generative search engines.**

GSLHub connects controlled experiments, prompt executions, observations, research artifacts, evidence, citations and governed metrics inside one auditable workflow.

## Current release — 0.6.0

Version `0.6.0` closes the **Doctoral-ready UI** milestone.

### Product layer

- responsive public frontend for mobile, tablet, laptop and desktop;
- responsive Payload administrator with safe horizontal handling for scientific tables;
- dedicated Research Operations dashboard after CMS login;
- bilingual EN/ES Research Operations dashboard;
- public bilingual research-infrastructure demonstrator;
- direct private Research CMS access from the public frontend;
- public scientific dashboard separated from private governed operations;
- mobile navigation and CTA contrast reviewed.

### Research workflow layer

The development regression has been completed successfully:

```text
Full research pipeline TEST   PASS
├── 5 Prompt Executions
├── 5 Observations
├── 5 Research Artifacts
├── 5 Evidence records
├── 3 Citations
└── 4 synthetic metric records

Deterministic calculators
├── AIR = 3/4 = 0.75   PASS
├── CR  = 2/4 = 0.50   PASS
├── MCP = 6/3 = 2.00   PASS
└── RCR = 3/4 = 0.75   PASS

TEST cleanup                PASS
```

After cleanup, no disposable TEST batches or TEST metric records remain.

## Governed development pilot

The first complete development execution remains preserved as a non-doctoral validation record:

```text
GSL-EXEC-GEO-0001                  Completed / Published
├── GSL-ART-GEO-0001               Raw response / SHA-256 verified
├── GSL-ART-GEO-0002               Screenshot / SHA-256 verified
├── GSL-EVD-GEO-0001               Validated evidence
├── GSL-EVD-GEO-0002               Validated evidence
└── GSL-OBS-GEO-0001               Validated / Published observation
```

Reserved executions remain untouched:

```text
GSL-EXEC-GEO-0002   Planned
GSL-EXEC-GEO-0003   Planned
GSL-EXEC-GEO-0004   Planned
GSL-EXEC-GEO-0005   Planned
```

These records are **development validation**, not doctoral findings.

## Core scientific metrics

| Code | Metric | Version | Unit |
| --- | --- | --- | --- |
| AIR | Answer Inclusion Rate | 0.1.0 | proportion |
| CR | Citation Rate | 0.1.0 | proportion |
| MCP | Mean Citation Position | 0.1.0 | position |
| RCR | Response Consistency Rate | 0.1.0 | proportion |

The calculators enforce eligibility and provenance rules. Target-specific metrics are not created when the required target or evidence does not exist.

## Reproducibility controls

GSLHub currently supports:

- versioned prompts, experiments and metric definitions;
- controlled repeated executions;
- immutable scientific snapshots after governed lifecycle transitions;
- direct Evidence ↔ Research Artifact provenance;
- persistent research-artifact storage outside deployment releases;
- SHA-256 verification;
- quality-control and independent-review workflows;
- Development / Doctoral Research separation;
- controlled Final Development Reset;
- permanent storage-verification audits.

## Research Infrastructure demonstrator

A five-minute public explanation of the system is available in both languages:

- English: `https://gslhub.com/research-infrastructure`
- Español: `https://gslhub.com/es/research-infrastructure`

The demonstrator explains:

```text
Scientific problem
→ Hypothesis
→ Experiment
→ Execution
→ Evidence
→ Metrics
→ Reproducibility
```

It is designed for academic presentation without exposing private research records or restricted artifacts.

## Research CMS

Authorized researchers use the private Payload CMS for governed operations. The custom Research Operations dashboard provides direct access to:

- Research Environment;
- Prompt Executions;
- Evidence;
- Metrics;
- the public Research Infrastructure demonstrator;
- the public scientific dashboard.

The dashboard follows the selected Payload locale in English or Spanish.

## Persistent research artifacts

Production research artifacts are stored outside the Node.js deployment tree:

```text
/home/<hostinger-user>/domains/gslhub.com/gslhub-data/research-artifacts
```

Verified sequence:

```text
Upload → HTTP 200
Restart → same SHA-256 / HTTP 200
Redeploy → same SHA-256 / HTTP 200
Recovery drill → restored file / same SHA-256
```

## Current research boundary

```text
Research Environment       Development Mode
Final Development Reset    Not executed
Doctoral Research Mode     Not activated
Real doctoral data         0
```

GSLHub must remain in Development Mode until the doctoral protocol is frozen and the Final Development Reset has produced a clean baseline.

## Next phase

The product-development focus now moves from functional validation to doctoral preparation:

1. prepare the doctoral proposal and research dossier;
2. use the bilingual Research Infrastructure view as the academic demonstrator;
3. freeze the scientific protocol, target dictionary, prompts, AI-system profiles and codebooks;
4. preview and execute Final Development Reset when the protocol is ready;
5. verify a clean baseline;
6. activate Doctoral Research Mode;
7. begin real doctoral data collection.

## Validated production stack

```text
GSLHub platform    0.6.0
Payload CMS        3.75.0
Next.js            16.2.10
React              19.2.7
MongoDB driver     6.21.0
Database           MongoDB Atlas
Hosting            Hostinger
Artifact storage   Persistent local storage outside deployment releases
```

Framework versions remain intentionally pinned until upgrades pass the complete administrator and scientific workflow on an isolated branch.

## Local development

```bash
git clone https://github.com/gslhub/website.git
cd website
npm install
cp .env.example .env.local
npm run dev
```

Quality gate:

```bash
npm run lint
npm run typecheck
npm run build
```

## Documentation

- [Current operational project status — Spanish](./docs/ESTADO_PROYECTO_ES.md)
- [Spanish user manual](./docs/MANUAL_USUARIO_ES.md)
- [First pilot protocol — Spanish](./docs/PROTOCOLO_PRIMER_PILOTO_ES.md)
- [Observation and citation codebook — Spanish](./docs/CODEBOOK_OBSERVACIONES_CITAS_ES.md)
- [Storage, backup and recovery procedure — Spanish](./docs/PROCEDIMIENTO_ALMACENAMIENTO_BACKUP_RECUPERACION_ES.md)
- [English changelog](./CHANGELOG.md)
- [Spanish changelog](./CHANGELOG.es.md)

## Contact

- Website: [gslhub.com](https://gslhub.com)
- GitHub: [github.com/gslhub](https://github.com/gslhub)
- Research email: [research@gslhub.com](mailto:research@gslhub.com)

---

<p align="center"><strong>Research · GEO · Evidence · Metrics · Reproducibility · Open Science</strong></p>
<p align="center">Last updated: 15 August 2026</p>
