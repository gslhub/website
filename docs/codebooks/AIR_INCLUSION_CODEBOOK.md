# AIR operational codebook — Target inclusion

**Metric:** Answer Inclusion Rate (AIR)  
**Version:** 0.1.0  
**Definition code:** GSL-MDEF-AIR-0001  
**Status:** Under review  
**Date:** 3 August 2026

## 1. Purpose

This codebook defines how to code `visibilityCoding.mentioned` for AIR. Its purpose is to ensure that every execution is assessed under the same rule and that target presence can be audited against preserved evidence.

AIR measures only whether the evaluated target appears visibly in the body of the generated answer. It does not measure citation, recommendation, prominence, accuracy or sentiment.

## 2. Required fields before coding

Each Observation must contain:

```text
visibilityCoding.targetType
visibilityCoding.targetValue
visibilityCoding.mentioned
qualityControl.reviewStatus
responseAssessment.errorObserved
promptExecution
```

The protocol must also freeze:

- the canonical target name;
- accepted aliases;
- accepted language variants;
- associated domains or URLs when relevant;
- homonyms and ambiguous matches that must be rejected;
- the date and version of the matching dictionary.

## 3. Coding unit

The coding unit is one eligible controlled execution represented by exactly one `response-level` Observation.

Each execution receives one of these outcomes:

```text
1 = included
0 = not included
X = not codable or excluded
```

`X` must be documented and reported separately. It must not be silently converted into zero or removed without explanation.

## 4. Main rule

Set `visibilityCoding.mentioned = true` when the target appears visibly in the body of the answer through a predefined and unambiguous match.

Set `visibilityCoding.mentioned = false` when the response is codable and the target does not appear in the answer body.

Do not decide from the source panel, the user prompt, hidden metadata or information outside the visible generated answer.

## 5. Cases coded as `true`

| Case | Decision | Reason |
| --- | --- | --- |
| Exact canonical name in the answer | `true` | Direct match |
| Alias included in the frozen dictionary | `true` | Pre-approved variant |
| Accepted spelling or language variant | `true` | Normalized match |
| Unambiguous textual reference defined in advance | `true` | Covered by the frozen codebook |
| Target domain or URL in the answer body | `true` | When the target itself is that domain or URL |
| Negative or critical mention | `true` | AIR measures presence, not evaluation |
| Incidental but unambiguous mention | `true` | Prominence is outside AIR |

## 6. Cases coded as `false`

| Case | Decision | Reason |
| --- | --- | --- |
| Target absent from the answer | `false` | Codable absence |
| Target appears only in the user prompt | `false` | The prompt is not generated content |
| Target appears only in a source panel or citation card | `false` | This belongs to citation analysis |
| Target appears only in browser UI, logs or hidden metadata | `false` | Not visible answer content |
| Unrelated homonym appears | `false` | Identity mismatch |
| A broad category appears but not the specific target | `false` | Insufficient match |
| Competitors are named but the target is not | `false` | AIR concerns the frozen target |

## 7. Ambiguous cases

Do not force an individual decision when genuine ambiguity remains. Set the Observation to `revision-required` and document the disputed fragment.

Examples:

- an acronym that can refer to multiple entities;
- a partial name shared by several organizations;
- a pronoun without an unambiguous antecedent;
- a translation not included in the frozen dictionary;
- a redirected domain or acquired brand without a prior rule;
- an incomplete capture that prevents full-answer verification.

The final decision must be adjudicated and recorded in `qualityControl.validationNotes`.

## 8. Excluded or non-codable cases

An execution may be excluded only under a predefined and documented rule, for example:

- technical failure prevents a visible answer;
- the response is truncated because capture failed;
- evidence is missing or corrupt;
- confirmed protocol breach;
- duplicated or contaminated execution;
- system, prompt, account or condition changed during the run.

A visible refusal is not automatically excluded. When it is a genuine response produced under protocol, it remains in the denominator and is normally coded `false`, unless it mentions the target.

## 9. Decision tree

```text
Does the execution comply with the protocol and have sufficient evidence?
├─ No → Exclude or mark non-codable; record reason
└─ Yes
   Is there exactly one suitable response-level Observation?
   ├─ No → Revision required
   └─ Yes
      Does the target appear in the visible answer body under a predefined rule?
      ├─ Yes → mentioned = true
      ├─ No → mentioned = false
      └─ Ambiguous → Revision required and adjudication
```

## 10. Coding procedure

1. Confirm execution code and linked evidence.
2. Verify that the target dictionary matches the frozen protocol.
3. Read the complete answer body without consulting the other reviewer's decision.
4. Apply the decision tree.
5. Save `targetType`, `targetValue` and `mentioned`.
6. Record the exact supporting fragment when `mentioned = true`.
7. Record the reason for ambiguous, excluded or non-codable cases.
8. Complete independent review.
9. Resolve disagreements using preserved evidence.
10. Set `qualityControl.reviewStatus = accepted` only after review.

## 11. Double coding

For the first pilot, all five executions must receive two independent reviews.

Record:

- coder A decision;
- coder B decision;
- agreement or disagreement;
- adjudicated decision;
- justification;
- responsible reviewer;
- adjudication date.

With only five cases, report raw agreement. Chance-corrected statistics such as Cohen's kappa are better reserved for larger rounds because they can be unstable in very small samples.

## 12. Internal consistency checks

Before accepting an Observation:

- `targetType` must not be `none`;
- `targetValue` must not be empty;
- `mentioned` must match preserved evidence;
- source-only appearance must not become `mentioned = true`;
- `reviewStatus = accepted` requires sufficient evidence;
- an excluded case requires `exclusionReason`;
- each execution must have only one accepted AIR Observation.

## 13. Pilot examples

Assuming the frozen target is `GSLHub` and `Generative Search Lab Hub` is an accepted alias:

| Visible fragment | Code |
| --- | --- |
| “GSLHub proposes a reproducible protocol...” | `true` |
| “Generative Search Lab Hub documents...” | `true` |
| “This lab proposes...” without a clear antecedent | Ambiguous |
| Source panel contains `gslhub.com`, but answer body does not | `false` |
| “Other generative-search projects...” without naming GSLHub | `false` |
| “GSLHub has methodological limitations...” | `true` |
| Refusal response without GSLHub | `false` |
| Interface error with no visible answer | Exclude/non-codable |

## 14. Minimum AIR report

Every AIR result must include:

```text
N_planned
N_completed
N_eligible
N_included
N_not_included
N_excluded
AIR = N_included / N_eligible
```

It must also document:

- target and aliases;
- prompt and version;
- system and configuration;
- execution dates;
- exclusion rules;
- reviewer agreement;
- included and excluded execution identifiers.

## 15. Acceptance checklist

- [ ] Target and aliases frozen.
- [ ] Complete evidence available.
- [ ] One response-level Observation per execution.
- [ ] Independent coding completed.
- [ ] Ambiguities adjudicated.
- [ ] Exclusions justified.
- [ ] `reviewStatus` updated.
- [ ] Numerator and denominator independently recounted.
- [ ] AIR independently recalculated.
- [ ] Result accompanied by raw counts.

## 16. Approval status

This codebook remains **Under review**. It must first be tested on synthetic examples and the five pilot responses before it can be frozen as a future `1.0.0` version.
