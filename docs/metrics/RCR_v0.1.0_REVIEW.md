# RCR v0.1.0 — Scientific review

**Metric code:** RCR  
**Definition code:** GSL-MDEF-RCR-0001  
**Status:** Under review  
**Version:** 0.1.0  
**Category:** Consistency  
**Direction:** Higher values indicate greater stability  
**Unit:** Proportion  
**Unit of analysis:** Experiment  
**Aggregation:** Ratio

## Purpose

Response Consistency Rate measures the proportion of valid repetition comparisons that show no substantive variation or low variation relative to a frozen baseline observation from the same experimental condition.

RCR evaluates stability under controlled repetitions. It does not measure factual correctness, quality, usefulness, source authority or textual identity. A response may be consistent and wrong, or correct but variable.

## Canonical formula

Let `b` be the frozen baseline observation and let `C` be the set of valid, comparable, non-baseline observations. For every comparison `i`:

```text
S_i = 1 when variationLevel_i ∈ {none, low}
S_i = 0 when variationLevel_i ∈ {medium, high}

RCR = (Σ S_i) / |C|, for i ∈ C
```

Valid range: `[0, 1]`.

The baseline observation is preserved and reported but is not included in the denominator. When `|C| = 0`, RCR is not estimable.

RCR is reported to four decimal places and must always include the numerator, denominator, individual variation levels, selected baseline and exclusions.

## First-pilot design

With five executions:

```text
1 baseline observation
4 assessed comparisons
```

RCR can only take the following values:

```text
0/4 = 0.00
1/4 = 0.25
2/4 = 0.50
3/4 = 0.75
4/4 = 1.00
```

A single small round must not be interpreted as a stable estimate of the system's general behaviour.

## Baseline selection and freezing

The baseline must be selected through a pre-specified rule, not because it looks representative after reading the responses.

Recommended pilot rule:

1. order executions by `repetitionNumber`;
2. select the first eligible execution;
3. confirm that it is completed, preserved and accepted;
4. freeze its Observation before classifying the remaining responses;
5. use the same baseline for every comparison in the condition.

For the initial round, the expected baseline is the execution with the lowest repetition number, normally `GSL-EXEC-GEO-0001`.

If that execution is technically invalid, apply a predeclared replacement rule—the next eligible repetition—and document the reason. Do not select a new baseline to improve RCR.

## Comparable experimental condition

The baseline and every comparison must share:

- project, benchmark and experiment;
- exact prompt and version;
- AI-system profile;
- access mode, account and search mode;
- defined language, locale, location and timezone;
- memory and custom-instruction state;
- compatible time window and visible interface version;
- evaluated-target definition.

A material change in condition requires exclusion, stratification or a separate analysis.

## Comparison dimensions

Each response is compared with the baseline across five dimensions:

1. **Target outcome**
   - `mentioned`;
   - `cited`;
   - `recommended`;
   - `recommendationStrength`;
   - position when protocol-relevant.

2. **Primary conclusion or recommendation**
   - overall orientation;
   - main conclusion;
   - selection, exclusion or recommendation of the target.

3. **Core claims and themes**
   - presence of required claims;
   - contradictions;
   - substantive additions or omissions;
   - coverage of essential themes.

4. **Sources and attribution**
   - presence or absence of citations;
   - source roles;
   - material changes to the domain set;
   - changes in visible evidence or grounding.

5. **Observable response mode and quality**
   - substantive answer, refusal or rejection;
   - error or truncation;
   - language;
   - completeness;
   - structure that materially changes interpretation.

## Conservative classification rule

Each dimension receives a preliminary severity. The final `variationLevel` is the highest severity observed:

```text
variationLevel = max(severity across assessed dimensions)
```

This prevents a critical difference from being hidden by superficial similarities.

## Variation levels

### `none` — no substantive variation

The response preserves:

- the same target-outcome vector;
- the same primary conclusion;
- the same core claims and themes;
- the same essential attribution pattern;
- the same response mode.

Only trivial differences in punctuation, formatting, ordering or wording are present and meaning is unchanged.

### `low` — low variation

The response preserves the same target outcome and primary conclusion. It may contain:

- paraphrasing;
- section reordering;
- minor length differences;
- different secondary examples;
- addition or omission of non-essential details;
- limited source substitutions that do not change the support function or evaluated outcome.

There can be no contradiction and no change in `mentioned`, `cited` or `recommended`.

### `medium` — material variation without changing the primary outcome

The primary target-outcome vector and conclusion remain stable, but at least one substantive difference exists, for example:

- addition or omission of a secondary core claim;
- important changes in arguments or explanation;
- broad change in the source set or source function;
- notable variation in thematic coverage;
- prominence or position changes that alter presentation without changing inclusion, citation or recommendation;
- partial versus complete response while keeping the same conclusion.

The comparison is not considered consistent for RCR v0.1.0.

### `high` — high variation or outcome change

Classify `high` when any of the following occurs:

- change in `mentioned`, `cited` or `recommended`;
- material change in `recommendationStrength`;
- opposite conclusion, recommendation or selection;
- contradiction of a core claim;
- substantive answer versus refusal, rejection or error;
- loss or addition of essential elements that changes interpretation;
- language or response-mode change that invalidates comparability;
- evidence that the experimental condition was not equivalent.

Technical protocol violations may require exclusion rather than classification, according to the applicable pre-specified rule.

## `not-assessed` cases

`not-assessed` is reserved for:

- the baseline observation itself;
- a comparison not yet reviewed;
- a case without sufficient evidence;
- a comparison awaiting adjudication.

It does not enter the denominator. It must be resolved or reported separately.

## Eligibility and denominator

A comparison Observation belongs to `C` when:

1. its Prompt Execution is `completed`;
2. the Observation is `validated`;
3. `qualityControl.reviewStatus = accepted`;
4. it matches the evaluated target;
5. it references exactly the frozen baseline;
6. it uses `none`, `low`, `medium` or `high`;
7. there is one accepted Observation per execution;
8. sufficient evidence exists to audit the comparison.

The baseline and `not-assessed` records do not enter the denominator. Exclusions retain their reasons.

## Missing-data policy

Recommended Payload policy: **Report separately**.

- Do not impute variation levels.
- Do not convert `not-assessed` into `high` or zero.
- Report candidates, valid comparisons, baseline and exclusions.
- If no valid comparison remains, report RCR as not estimable.

The current calculator operationally applies `exclude-and-report`; the CMS methodology should represent this as `Report separately`.

## Required inputs

| Collection | Field | Required | Purpose |
| --- | --- | ---: | --- |
| Observations | `comparison.baselineObservation` | Yes | Identifies the frozen baseline. |
| Observations | `comparison.variationLevel` | Yes | Stores the comparison classification. |
| Observations | `comparison.comparisonNotes` | Yes | Provides auditable justification. |
| Observations | `visibilityCoding.*` | Yes | Compares target outcomes. |
| Observations | `responseAssessment.*` | Yes | Compares mode, error and completeness. |
| Observations | `citationAssessment.*` | Yes | Compares source presentation. |
| Observations | `sourceObservations` | Recommended | Compares sources and domains. |
| Observations | `semanticCoding.*` | Recommended | Compares themes and claims. |
| Observations | `qualityControl.reviewStatus` | Yes | Restricts analysis to accepted comparisons. |
| Prompt Executions | `lifecycleStatus` | Yes | Requires completed execution. |

## Interpretation

Higher values indicate that a larger proportion of assessed repetitions remained within the `none/low` threshold relative to the frozen baseline.

RCR does not establish:

- factual correctness;
- quality or usefulness;
- absence of bias;
- stability at another date, account, system, language or prompt;
- literal textual identity;
- causality between variation and system changes.

A repeatedly incorrect response can obtain a high RCR. A correct response expressed through materially different arguments or sources can obtain a lower RCR.

## Baseline dependence

RCR v0.1.0 is a baseline-relative metric and therefore depends on the selected baseline.

Always report:

- baseline execution code;
- baseline Observation code;
- selection rule;
- reason for any replacement;
- future sensitivity analysis using pairwise comparisons or multiple baselines.

Do not interpret RCR as global all-pairs agreement until a separate metric is defined for that purpose.

## Double coding and adjudication

The four pilot comparisons should be reviewed independently through two codings whenever possible.

When only one researcher is available:

1. perform the first coding;
2. use a pre-specified separation period;
3. perform a second coding blind to the first result;
4. record agreements and disagreements;
5. document adjudication.

With four comparisons, raw agreement should be the primary reported reliability measure. Chance-corrected statistics become more useful in larger rounds.

## Validation procedure

1. Freeze the condition, target and baseline-selection rule.
2. Verify and freeze the baseline Observation.
3. Confirm one accepted Observation per comparison execution.
4. Review all five dimensions without consulting the previous classification.
5. Assign severity by dimension.
6. Apply the maximum-severity rule.
7. Justify the level in `comparisonNotes`.
8. Perform the second review and adjudicate disagreements.
9. Resolve or exclude `not-assessed` cases.
10. Recount `none`, `low`, `medium` and `high`.
11. Recalculate numerator and denominator.
12. Compare with the Metric Result and its checksums.
13. Report baseline, individual levels, exclusions and execution conditions.

## Existing deterministic scenario

The administrative scenario generates:

```text
Baseline: not-assessed
Comparisons: none, low, low, high

Consistent numerator = 3
Assessed denominator = 4
RCR = 3 / 4 = 0.7500
Reported baseline exclusion = 1
```

This validates arithmetic, single-baseline enforcement, required states, target matching and checksums. It should later be extended with tests for `medium`, multiple baselines, duplicate executions, missing baseline and pending comparisons.

## Recommended Payload values

```text
Title: Response Consistency Rate
Metric Code: RCR
Version: 0.1.0
Lifecycle Status: Under review
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
```

Do not move to `Validated` until the codebook has been tested with synthetic comparisons and the first-pilot baseline rule has been formally confirmed.

## Scientific basis

- Bartsch, H. et al. (2023). *Self-Consistency of Large Language Models under Ambiguity*. BlackboxNLP 2023. DOI: 10.18653/v1/2023.blackboxnlp-1.7.
- Nalbandyan, G., Shahbazyan, R., & Bakhturina, E. (2025). *SCORE: Systematic COnsistency and Robustness Evaluation for Large Language Models*. NAACL 2025. DOI: 10.18653/v1/2025.naacl-industry.39.
- Jang, D., Ahn, Y., & Shin, H. (2025). *RCScore: Quantifying Response Consistency in Large Language Models*. EMNLP 2025. DOI: 10.18653/v1/2025.emnlp-main.290.
- Wu, X. et al. (2025). *Estimating LLM Consistency: A User Baseline vs Surrogate Metrics*. EMNLP 2025. DOI: 10.18653/v1/2025.emnlp-main.1554.
- Ganesh, P., Shokri, R., & Farnadi, G. (2026). *Rethinking Hallucinations: Correctness, Consistency, and Prompt Multiplicity*. EACL 2026. DOI: 10.18653/v1/2026.eacl-long.327.
- Schulte, J., Bleeker, M., & Kaufmann, P. (2026). *Don't Measure Once: Measuring Visibility in AI Search (GEO)*. arXiv:2604.07585.
