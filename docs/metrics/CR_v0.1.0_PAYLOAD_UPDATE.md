# CR v0.1.0 — Payload update sheet

**Record:** `GSL-MDEF-CR-0001`  
**Status to preserve:** `Under review`  
**Purpose:** align the production record with the scientific review and operational codebook.

## Required changes

### Formula

```text
CR = (Σ C_i) / |E|, for i ∈ E

C_i = 1 when at least one accepted Citation matches the evaluated target
C_i = 0 when no accepted target Citation exists
E = frozen set of eligible executions
```

### Configuration

```text
Category: Citation
Direction: Higher is better
Unit of Analysis: Experiment
Value Type: Number
Unit: Proportion
Aggregation Method: Ratio
Missing Data Policy: Report separately
Rounding Precision: 4
Minimum: 0 inclusive
Maximum: 1 inclusive
Open Methodology: true
Lifecycle Status: Under review
```

### Description EN

```text
Proportion of eligible controlled executions in which the evaluated target is explicitly presented by the system as a source, reference or linked destination.
```

### Interpretation EN

```text
Higher values indicate that the system attributed or presented the target as a source in a larger proportion of eligible executions under the exact condition studied. CR measures visible attribution frequency; it does not establish claim support, accuracy, authority, prominence, favourable position, causal influence, recommendation or answer-body mention. It must be reported with numerator, denominator, exclusions and observed citation types.
```

### Pseudocode EN

```text
Freeze the eligible execution set and target identity dictionary. Review the answer and all preserved source surfaces. Extract one Citation record per distinguishable visible source. For each execution, assign C_i = 1 when at least one accepted Citation has targetCoding.isEvaluatedTarget = true; otherwise assign C_i = 0. Multiple target citations within one execution count once in the numerator. Divide positive executions by eligible executions and report excluded or non-codable cases separately.
```

### Numerator EN

```text
Number of eligible executions with at least one accepted Citation supported by preserved evidence and coded with targetCoding.isEvaluatedTarget = true.
```

### Denominator EN

```text
Total number of eligible executions with one accepted response-level Observation and sufficient evidence to determine the presence or absence of visible citations. Valid executions without target citations remain in the denominator as zero outcomes.
```

### Assumptions EN

```text
Target identity, domains, aliases, redirects and normalization rules are frozen before coding. Each eligible execution contributes one binary outcome. Every source surface required by the protocol is preserved and reviewed. Multiple target citations in one execution do not duplicate the numerator.
```

### Limitations EN

```text
CR reduces all citation activity within an execution to a binary result and does not measure citation count, position, prominence, function, claim support, authority or quality. Dynamic interfaces may hide sources, so observability depends on complete capture. URLs may change after execution. With five executions, CR changes only in increments of 0.20; therefore raw counts must be reported and broad stability claims avoided.
```

### Validation EN

```text
Freeze the sample and target dictionary; verify protocol compliance and one accepted Observation per execution; inspect every source surface; independently extract and review each Citation; resolve ambiguous matches using evidence; verify agreement between visibilityCoding.cited and accepted Citations; reduce each execution to a binary outcome; recount numerator and denominator; independently recalculate CR; compare it with the stored Metric Result; and report counts, citation types, target, exclusions, prompt, system, dates and rounding.
```

## Required inputs

| Source collection | Field name | Required |
| --- | --- | ---: |
| Prompt Executions | `lifecycleStatus` | Yes |
| Observations | `qualityControl.reviewStatus` | Yes |
| Observations | `visibilityCoding.cited` | Yes |
| Citations | `promptExecution` | Yes |
| Citations | `citationType` | Yes |
| Citations | `targetCoding.isEvaluatedTarget` | Yes |
| Citations | `targetCoding.targetMatchType` | Yes |
| Citations | `qualityControl.reviewStatus` | Yes |
| Citations | `sourceDomain` | Yes |
| Citations | `evidence` | Recommended |

Keep `verification.supportsClaim` as an optional audit input rather than a requirement for a citation to count in CR.

## Fields that must not change

```text
definitionCode
metricCode
slug
version
project
benchmarks
researchAreas
researchers
resources
software
```

Keep `Validated At` empty and do not populate `Validated By` until the definition and codebook are formally approved.

## Reference documents

- [`CR_v0.1.0_REVIEW.md`](./CR_v0.1.0_REVIEW.md)
- [`CR_CITATION_CODEBOOK.md`](../codebooks/CR_CITATION_CODEBOOK.md)
