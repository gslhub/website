# AIR v0.1.0 — Scientific review

**Metric code:** AIR  
**Definition code:** GSL-MDEF-AIR-0001  
**Lifecycle status:** Under review  
**Version:** 0.1.0  
**Category:** Visibility  
**Direction:** Higher is better  
**Unit:** Proportion  
**Unit of analysis:** Experiment  
**Aggregation:** Ratio

## Purpose

Answer Inclusion Rate measures the proportion of eligible controlled executions in which a predefined evaluated target is visibly included in the generated answer body.

AIR is a GSLHub operational visibility metric. It measures answer-level presence only. It must remain separate from citation occurrence, citation quality, recommendation strength, prominence, factual use and sentiment.

## Canonical formula

Let `E` be the frozen set of eligible executions and let `M_i` be the binary inclusion code for execution `i`:

```text
M_i = 1 when the evaluated target is visibly included in the generated answer body
M_i = 0 when the evaluated target is not visibly included

AIR = (Σ M_i) / |E|, for i ∈ E
```

Valid range: `[0, 1]`.

Report AIR to four decimal places, but always publish the raw numerator and denominator alongside the proportion.

## Evaluated target

Before coding begins, the protocol must freeze:

- target type: domain, URL, organization, person, product/service or topic;
- canonical target value;
- accepted names, aliases and normalized variants;
- disallowed ambiguous variants;
- language-specific matching rules;
- treatment of parent companies, subsidiaries, redirects and alternate domains.

The target definition must be identical across all executions included in one AIR result.

## Inclusion coding rule

Code `visibilityCoding.mentioned = true` only when the target is visible in the generated answer body through one of the predefined, unambiguous matching forms.

Count as inclusion:

- exact canonical name;
- a predefined alias or normalized variant;
- an unambiguous textual reference covered by the frozen codebook.

Do not count as answer inclusion when the target appears only in:

- the user prompt;
- hidden metadata or retrieval logs;
- a browser address bar;
- a source panel, citation card or reference list without being included in the answer body;
- an unrelated or ambiguous namesake.

A source-only appearance belongs to citation analysis and must not be converted into AIR inclusion.

## Eligibility and denominator

An execution belongs to `E` when:

1. it was run under the frozen project, benchmark, experiment, prompt, AI-system profile and repetition protocol;
2. the execution reached a completed analytical state;
3. exactly one response-level observation represents the execution;
4. the observation passed quality control and is accepted for analysis;
5. the response and interface evidence are sufficient to code inclusion.

A valid execution in which the target is absent remains in the denominator with `M_i = 0`.

A refusal remains in the denominator when it is a genuine system response produced under the protocol; inclusion is coded from the visible refusal text. A technical failure that prevents a response from being observed may be excluded only under a predefined exclusion rule and must be reported separately.

## Missing-data policy

Recommended policy: **report separately**.

- Do not impute AIR outcomes.
- Do not treat “target not mentioned” as missing; it is a valid zero.
- Record every excluded or non-codable execution and its reason.
- Report `N_planned`, `N_completed`, `N_eligible`, `N_included` and `N_excluded`.

## Required inputs

| Collection | Field | Required | Role |
| --- | --- | ---: | --- |
| Observations | `visibilityCoding.targetType` | Yes | Identifies the evaluated target class. |
| Observations | `visibilityCoding.targetValue` | Yes | Stores the frozen target value. |
| Observations | `visibilityCoding.mentioned` | Yes | Binary AIR outcome. |
| Observations | `qualityControl.reviewStatus` | Yes | Restricts the denominator to accepted observations. |
| Observations | `responseAssessment.errorObserved` | Yes | Supports technical-failure and exclusion review. |
| Prompt Executions | `lifecycleStatus` | Yes | Confirms execution completion and eligibility. |

## Interpretation

Higher AIR values indicate that the target appears in a larger share of eligible generated answers under the exact evaluated condition.

AIR does not establish:

- that the target was cited or linked;
- that the target influenced the answer;
- that the mention was prominent or favourable;
- that the generated statement was accurate;
- that the target would appear under another prompt, system, account, location, language, date or interface version.

AIR must be interpreted as a sample estimate from repeated controlled executions, not as a permanent property of a generative system.

## Assumptions

- The target identity and matching rules are frozen before coding.
- Each eligible execution contributes exactly one binary outcome.
- Repetitions use the same frozen protocol.
- Coders can inspect sufficient preserved evidence.
- Exclusion rules are defined before outcome inspection whenever possible.

## Limitations

AIR collapses all valid mentions into one binary result. It does not measure position, prominence, semantic contribution, citation, recommendation, correctness or quality.

Small samples produce coarse estimates. For the first five-execution pilot, AIR can change only in increments of `0.20`; therefore the raw count must be emphasized and no broad stability claim should be made from one round.

Run-to-run and temporal variability in generative search means that AIR can change even when the prompt and target remain constant. Later studies should increase repetitions and report uncertainty intervals.

## Validation procedure

1. Freeze the analytical sample and target dictionary.
2. Verify that every included execution matches the protocol.
3. Confirm exactly one accepted response-level observation per execution.
4. Double-code all five pilot observations independently.
5. Reconcile disagreements using the preserved answer and interface evidence.
6. Record raw agreement; use a chance-corrected reliability statistic only when the sample is sufficiently large.
7. Independently recount `N_included` and `N_eligible`.
8. Recompute AIR from the canonical formula.
9. Compare the independent value with the stored Metric Result.
10. Report numerator, denominator, exclusions, target definition, system profile, prompt version, collection dates and rounding.

## Recommended Payload values

```text
Title: Answer Inclusion Rate
Metric Code: AIR
Version: 0.1.0
Lifecycle Status: Under review
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
```

Do not move this definition to `Validated` until the observation codebook, target-matching rules and independent review procedure are approved.

## Scientific basis

- Aggarwal, P., Murahari, V., Rajpurohit, T., Kalyan, A., Narasimhan, K., & Deshpande, A. (2024). *GEO: Generative Engine Optimization*. Proceedings of KDD 2024, 5–16. DOI: 10.1145/3637528.3671900.
- Liu, N. F., Zhang, T., & Liang, P. (2023). *Evaluating Verifiability in Generative Search Engines*. Findings of EMNLP 2023, 7001–7025. DOI: 10.18653/v1/2023.findings-emnlp.467.
- Xu, Y. et al. (2025). *CiteEval: Principle-Driven Citation Evaluation for Source Attribution*. ACL 2025, 32759–32778. DOI: 10.18653/v1/2025.acl-long.1574.
- Schulte, J., Bleeker, M., & Kaufmann, P. (2026). *Don't Measure Once: Measuring Visibility in AI Search (GEO)*. Working paper, arXiv:2604.07585.
