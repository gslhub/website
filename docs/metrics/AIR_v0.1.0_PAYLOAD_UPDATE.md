# AIR v0.1.0 — Payload update sheet

**Record:** `GSL-MDEF-AIR-0001`  
**Status to preserve:** `Under review`  
**Purpose:** align the production record with the scientific review and operational codebook.

## Required changes

### Formula

```text
AIR = (Σ M_i) / |E|, for i ∈ E

M_i = 1 when the evaluated target appears visibly in the answer body
M_i = 0 when it does not appear
E = frozen set of eligible executions
```

### Configuration

```text
Category: Visibility
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
Proportion of eligible controlled executions in which a predefined evaluated target appears visibly in the body of the generated answer.
```

### Interpretation EN

```text
Higher values indicate that the target appears in a larger proportion of eligible answers under the exact evaluated condition. AIR measures only presence in the answer body; it does not imply citation, recommendation, prominence, accuracy, influence or positive sentiment. It must be reported with the numerator, denominator and exclusions.
```

### Pseudocode EN

```text
Freeze the eligible execution set and the target dictionary. Resolve exactly one accepted response-level observation per execution. Assign M_i = 1 when the target appears visibly in the answer body through a predefined and unambiguous match; otherwise assign M_i = 0. Sum the values and divide by the number of eligible executions. Report excluded or non-codable cases separately.
```

### Numerator EN

```text
Number of eligible executions whose accepted observation has visibilityCoding.mentioned = true for the evaluated target.
```

### Denominator EN

```text
Total number of eligible executions with an observable response and exactly one accepted response-level observation. Valid executions without a mention remain in the denominator with value zero.
```

### Assumptions EN

```text
The target identity, aliases and matching rules are frozen before coding. Each eligible execution contributes exactly one binary outcome. Repetitions use the same protocol and reviewers have sufficient preserved evidence.
```

### Limitations EN

```text
AIR reduces inclusion to a binary outcome and does not measure position, prominence, semantic contribution, citation, recommendation, accuracy or quality. With five executions it can change only in increments of 0.20, so raw counts must be published and broad stability claims avoided. The estimate may vary across runs, dates, systems, accounts, locations, languages and interface versions.
```

### Validation EN

```text
Freeze the sample and target dictionary; verify protocol compliance and one accepted observation per execution; perform two independent reviews; adjudicate disagreements using preserved evidence; record agreement and exclusions; recount numerator and denominator; independently recalculate AIR; compare it with the stored Metric Result; and report counts, target, prompt, system, dates and rounding.
```

## Required inputs

| Source collection | Field name | Required |
| --- | --- | ---: |
| Observations | `visibilityCoding.targetType` | Yes |
| Observations | `visibilityCoding.targetValue` | Yes |
| Observations | `visibilityCoding.mentioned` | Yes |
| Observations | `qualityControl.reviewStatus` | Yes |
| Observations | `responseAssessment.errorObserved` | Yes |
| Prompt Executions | `lifecycleStatus` | Yes |

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

Keep `Validated At` empty and do not complete `Validated By` until the definition and codebook receive formal approval.

## Reference documents

- [`AIR_v0.1.0_REVIEW.md`](./AIR_v0.1.0_REVIEW.md)
- [`AIR_INCLUSION_CODEBOOK.md`](../codebooks/AIR_INCLUSION_CODEBOOK.md)
