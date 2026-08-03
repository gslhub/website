# RCR v0.1.0 — Payload update sheet

**Record:** `GSL-MDEF-RCR-0001`  
**Status to preserve:** `Under review`  
**Purpose:** align the production record with the scientific review and operational codebook.

## Formula

```text
RCR = (Σ S_i) / |C|, for i ∈ C

S_i = 1 when comparison.variationLevel ∈ {none, low}
S_i = 0 when comparison.variationLevel ∈ {medium, high}
C = set of valid comparisons against one frozen baseline
```

The baseline Observation is reported but excluded from the denominator. If no valid comparison exists, RCR is not estimable.

## Configuration

```text
Category: Consistency
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

## English title

```text
Response Consistency Rate
```

## English description

```text
Proportion of valid repetition comparisons that show no substantive variation or low variation relative to a frozen baseline observation from the same experimental condition.
```

## English interpretation

```text
Higher values indicate that a larger proportion of repetitions remained within the none/low threshold relative to the frozen baseline. RCR measures stability under a controlled condition and does not imply factual correctness, quality, usefulness, absence of bias or textual identity. Report it together with the selected baseline, individual levels, numerator, denominator and exclusions.
```

## English pseudocode

```text
Freeze the experimental condition and select the first eligible execution by repetitionNumber as baseline. Preserve the baseline Observation as not-assessed and exclude it from the denominator. For every remaining accepted Observation, confirm that it references the same baseline and compare target outcome, conclusion, claims, sources and response mode. Assign none, low, medium or high using the highest observed severity. Count none and low in the numerator and divide by all assessed comparisons. Report not-assessed records and exclusions separately.
```

## English numerator

```text
Number of valid accepted comparisons whose comparison.variationLevel is none or low relative to the single frozen baseline Observation.
```

## English denominator

```text
Total number of valid accepted non-baseline comparisons whose comparison.variationLevel is none, low, medium or high. The baseline Observation, not-assessed records and exclusions do not enter the denominator and are reported separately.
```

## English assumptions

```text
The baseline is selected through a pre-specified rule and remains fixed for the full condition. All executions share the prompt, version, system, access, environment and target. Each execution contributes at most one accepted Observation. Levels are assigned through the same codebook using sufficient preserved evidence and without consulting the final RCR value.
```

## English limitations

```text
RCR depends on the selected baseline and on human-coding thresholds. It summarizes stability but does not determine correctness or identify by itself which claims, sources or outcomes changed. A repeatedly incorrect response can obtain a high RCR. With one baseline and four comparisons, the first pilot only produces increments of 0.25, so all levels and raw counts must be reported.
```

## English validation procedure

```text
Freeze the condition and baseline rule; verify the baseline Observation and one accepted Observation per comparison; independently review target outcome, conclusion, claims, sources and response mode; apply the maximum-severity rule; justify every level; perform a second coding and adjudicate disagreements; resolve or exclude not-assessed cases; recount none, low, medium and high; recalculate RCR; compare it with the Metric Result, inputChecksum and outputChecksum; and report baseline, levels, exclusions, conditions and dates.
```

## Required inputs

| Source collection | Field name | Required |
| --- | --- | ---: |
| Observations | `comparison.baselineObservation` | Yes |
| Observations | `comparison.variationLevel` | Yes |
| Observations | `comparison.comparisonNotes` | Yes |
| Observations | `visibilityCoding.mentioned` | Yes |
| Observations | `visibilityCoding.cited` | Yes |
| Observations | `visibilityCoding.recommended` | Yes |
| Observations | `visibilityCoding.recommendationStrength` | Yes |
| Observations | `responseAssessment.relevanceLevel` | Yes |
| Observations | `responseAssessment.completeness` | Yes |
| Observations | `responseAssessment.refusalObserved` | Yes |
| Observations | `responseAssessment.errorObserved` | Yes |
| Observations | `citationAssessment` | Yes |
| Observations | `sourceObservations` | Recommended |
| Observations | `semanticCoding` | Recommended |
| Observations | `qualityControl.reviewStatus` | Yes |
| Prompt Executions | `lifecycleStatus` | Yes |

## Classification rule to preserve

```text
none   → consistent
low    → consistent
medium → inconsistent
high   → inconsistent
```

The final level uses the highest observed severity across comparison dimensions.

## Recommended baseline rule

```text
First eligible execution ordered by repetitionNumber
```

The initial pilot expects to use `GSL-EXEC-GEO-0001`, provided that it passes eligibility and evidence checks.

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

Keep `Validated At` empty and do not complete `Validated By` until the definition, codebook and baseline rule receive formal approval.

## Reference documents

- [`RCR_v0.1.0_REVIEW.md`](./RCR_v0.1.0_REVIEW.md)
- [`RCR_RESPONSE_VARIATION_CODEBOOK.md`](../codebooks/RCR_RESPONSE_VARIATION_CODEBOOK.md)
