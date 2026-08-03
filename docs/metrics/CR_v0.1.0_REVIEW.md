# CR v0.1.0 — Scientific review

**Metric code:** CR  
**Definition code:** GSL-MDEF-CR-0001  
**Status:** Under review  
**Version:** 0.1.0  
**Category:** Citation  
**Direction:** Higher values are better  
**Unit:** Proportion  
**Unit of analysis:** Experiment  
**Aggregation:** Ratio

## Purpose

Citation Rate measures the proportion of eligible controlled executions in which the evaluated target is explicitly presented by the system as a source, reference or linked destination.

CR is a source-attribution frequency metric. By itself, it does not assess whether the source supports a claim, is correct, authoritative, prominent, primary or favourable to the target.

## Canonical formula

Let `E` be the frozen set of eligible executions and let `C_i` be the binary citation outcome for execution `i`:

```text
C_i = 1 when at least one accepted citation matches the evaluated target
C_i = 0 when no accepted citation matches the evaluated target

CR = (Σ C_i) / |E|, for i ∈ E
```

Valid range: `[0, 1]`.

Each execution contributes at most one unit to the numerator even when the target is cited several times. The total number of target citations may be reported as an additional descriptive statistic, but it does not alter CR.

CR is reported to four decimal places and always with the original numerator and denominator.

## What counts as a citation

A citation is a visible representation through which the system attributes information, directs the user or presents an identifiable source. It may appear as:

- an inline citation;
- an end reference;
- a source card;
- a source-panel item;
- a linked mention functioning as attribution;
- an unlinked reference clearly located in a source or reference context.

A plain mention of the target in the answer body is not a citation. That presence belongs to AIR unless the interface unambiguously presents it as attribution or a reference.

## Matching the evaluated target

Before coding, the protocol must freeze:

- the target type and canonical value;
- valid domains, subdomains and URLs;
- normalization rules for protocol, `www`, trailing slash, parameters and fragments;
- accepted redirects and alternative domains;
- names, aliases and equivalent entities;
- rules for organizations, persons, products and topics;
- ambiguous cases and explicitly rejected matches.

A citation contributes to CR only when its identity matches the target through a predefined and auditable rule.

Within `Citations`, the match should be represented through:

```text
targetCoding.targetType
targetCoding.targetValue
targetCoding.isEvaluatedTarget = true
targetCoding.targetMatchType
```

`targetMatchType = unclear` cannot be accepted without adjudication.

## Eligibility and denominator

An execution belongs to `E` when:

1. it was conducted under the frozen project, benchmark, experiment, prompt, system and repetition protocol;
2. it reached an analytically completed state;
3. exactly one accepted response-level Observation represents it;
4. the response and source interface were preserved with enough evidence to determine whether citation occurred;
5. the same target-identification rules were applied.

An eligible execution with no target citation remains in the denominator with `C_i = 0`.

A response displaying no citations also remains in the denominator when absence can be verified. A technical failure or incomplete capture that prevents observation of the interface may be excluded only under a predefined rule and must be reported separately.

## Positive CR rule

Assign `C_i = 1` when at least one `Citations` record simultaneously:

- belongs to the same `promptExecution`;
- is supported by sufficient preserved evidence;
- represents a visible source or reference;
- matches the evaluated target;
- has `targetCoding.isEvaluatedTarget = true`;
- passes quality control for analytical use;
- is not rejected or archived as invalid.

`Observations.visibilityCoding.cited` must agree with this decision, but the preserved evidence and Citation records form the auditable basis of a positive result.

## Negative CR rule

Assign `C_i = 0` when the execution is eligible and:

- no visible attribution to the target exists;
- displayed sources belong to other targets;
- the target is only mentioned in the body without a source function;
- the target appears only in the user prompt;
- an ambiguous match is adjudicated as invalid;
- no citations are visible and that absence is adequately preserved.

## Missing-data policy

Recommended policy: **Report separately**.

- Do not impute citations.
- Do not treat an execution with no citations as missing; it is a valid zero.
- Do not treat a currently unresolved URL as absence of citation when the visible citation was preserved.
- Report excluded executions, incomplete interfaces and unadjudicated identities separately.
- Report `N_planned`, `N_completed`, `N_eligible`, `N_cited_executions`, `N_uncited_executions` and `N_excluded`.

## Required inputs

| Collection | Field | Required | Function |
| --- | --- | ---: | --- |
| Prompt Executions | `lifecycleStatus` | Yes | Confirms completion and eligibility. |
| Observations | `qualityControl.reviewStatus` | Yes | Restricts the denominator to accepted observations. |
| Observations | `visibilityCoding.cited` | Yes | Execution-level binary summary that must agree with citations. |
| Citations | `promptExecution` | Yes | Links the citation to the execution. |
| Citations | `citationType` | Yes | Identifies the visible source representation. |
| Citations | `targetCoding.isEvaluatedTarget` | Yes | Confirms that the citation belongs to the evaluated target. |
| Citations | `targetCoding.targetMatchType` | Yes | Documents the match rule. |
| Citations | `qualityControl.reviewStatus` | Yes | Restricts the numerator to accepted citations. |
| Citations | `sourceDomain` or equivalent identity | Yes | Supports identity audit. |
| Citations | `evidence` | Recommended | Preserves the visible representation used for coding. |

`verification.supportsClaim` is not required for CR because it concerns citation quality rather than citation occurrence.

## Interpretation

Higher CR values indicate that the system attributed or presented the target as a source in a larger proportion of eligible executions under the exact condition studied.

CR does not establish:

- that the source correctly supports a claim;
- that the link still resolves during later review;
- that the source is primary, official or authoritative;
- that the citation is prominent;
- that it appears in a favourable position;
- that it actually influenced generation;
- that the target is recommended or mentioned in the answer body;
- that the frequency will persist with another prompt, system, date, location or account.

CR should be interpreted as sample frequency of visible attribution, not as a permanent property of the system.

## Assumptions

- Target identity and normalization rules are frozen before coding.
- Each eligible execution contributes one binary outcome.
- Visible sources and the answer are preserved sufficiently.
- Citation records represent distinguishable visible source elements.
- Multiple target citations within one execution do not duplicate the numerator.
- Inclusion and exclusion rules are applied consistently.

## Limitations

CR collapses all citation activity in an execution to a binary result. It does not distinguish citation count, position, prominence, function, entailment, authority or quality.

Systems may display sources through dynamic interfaces, collapsed panels or different formats. Observability depends on complete interface capture and a stable coding convention.

A URL may redirect, stop resolving or change after execution. CR must rely on the attribution preserved at capture time; later verification is documented separately.

With five executions, CR can change only in increments of `0.20`, so raw counts must always be communicated and broad stability claims should be avoided.

## Validation procedure

1. Freeze the analytical sample and target identity dictionary.
2. Verify that each included execution follows the protocol.
3. Confirm one accepted Observation per execution.
4. Review the full answer and every preserved source surface.
5. Extract one Citation record per distinguishable visible source.
6. Independently code whether each citation matches the target.
7. Resolve disagreements using preserved evidence and normalization rules.
8. Confirm that `visibilityCoding.cited` agrees with the presence or absence of accepted target citations.
9. Reduce each execution to `C_i = 1` or `C_i = 0`.
10. Independently recount numerator and denominator.
11. Recalculate CR and compare it with the stored Metric Result.
12. Report counts, citation types, target identity, exclusions, prompt, system, dates and rounding.

## Recommended Payload values

```text
Title: Citation Rate
Metric Code: CR
Version: 0.1.0
Lifecycle Status: Under review
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
```

Do not move this definition to `Validated` until the citation codebook, target-normalization rules and visible citation-surface convention are approved.

## Scientific basis

- Liu, N. F., Zhang, T., & Liang, P. (2023). *Evaluating Verifiability in Generative Search Engines*. Findings of EMNLP 2023, 7001–7025. DOI: 10.18653/v1/2023.findings-emnlp.467.
- Aggarwal, P., Murahari, V., Rajpurohit, T., Kalyan, A., Narasimhan, K., & Deshpande, A. (2024). *GEO: Generative Engine Optimization*. Proceedings of KDD 2024, 5–16. DOI: 10.1145/3637528.3671900.
- Xu, Y. et al. (2025). *CiteEval: Principle-Driven Citation Evaluation for Source Attribution*. ACL 2025, 32759–32778. DOI: 10.18653/v1/2025.acl-long.1574.
