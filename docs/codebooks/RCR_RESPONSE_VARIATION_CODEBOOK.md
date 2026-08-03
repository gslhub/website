# RCR operational codebook — Response variation

**Metric:** Response Consistency Rate (RCR)  
**Version:** 0.1.0  
**Definition code:** GSL-MDEF-RCR-0001  
**Status:** Under review  
**Date:** 3 August 2026

## 1. Purpose

This codebook defines how each repeated response is compared with a frozen baseline Observation and how to assign:

```text
none
low
medium
high
not-assessed
```

RCR measures response stability under a controlled condition. It does not measure correctness or quality.

## 2. Coding unit

The unit is one accepted `response-level` Observation linked to a completed Prompt Execution and compared with one baseline Observation from the same condition.

Each comparison contributes:

```text
1 = none or low
0 = medium or high
X = not-assessed, pending or excluded
```

The baseline Observation is stored as `not-assessed` and is excluded from the denominator.

## 3. Required condition record

Freeze before comparison:

```text
projectCode
benchmarkCode
experimentCode
promptCode
promptVersion
systemCode
visibleInterfaceVersion
accessMode
accountTier
searchMode
locale
timezone
location
memoryEnabled
customInstructionsEnabled
targetType
targetValue
baselineSelectionRule
```

## 4. Baseline selection

Recommended rule:

```text
Baseline = first eligible execution by repetitionNumber
```

Procedure:

1. order executions by `repetitionNumber`;
2. select the first completed and accepted execution;
3. preserve its response and evidence;
4. freeze its Observation;
5. do not replace it after reading the other responses.

If the first execution is invalid, use the next eligible execution and record the reason in the protocol and calculation notes.

## 5. Comparison dimensions

### A. Target outcome

Compare:

```text
visibilityCoding.mentioned
visibilityCoding.cited
visibilityCoding.recommended
visibilityCoding.recommendationStrength
visibilityCoding.mentionPosition
visibilityCoding.citationPosition
```

### B. Primary conclusion

Compare:

- main answer to the question;
- conclusion or recommendation;
- inclusion or exclusion of the target;
- overall orientation.

### C. Claims and themes

Compare:

- core claims;
- contradictions;
- required themes;
- substantive additions or omissions;
- semantic coverage.

### D. Sources

Compare:

- presence of citations;
- presented domains;
- source functions;
- visible grounding;
- position or prominence when relevant.

### E. Response mode

Compare:

- substantive answer, refusal or rejection;
- error or truncation;
- language;
- completeness;
- format changes that alter interpretation.

## 6. Maximum-severity rule

Assess every dimension and use the most severe level:

```text
Final level = highest observed level
```

Example:

```text
Target outcome: none
Conclusion: low
Claims: medium
Sources: low
Mode: none

Final variationLevel = medium
```

## 7. `none`

Assign `none` when no substantive variation exists.

Allowed differences:

- punctuation;
- formatting;
- synonyms;
- minimal reordering;
- near-equivalent wording.

Requirements:

- same target outcome;
- same conclusion;
- same core claims;
- same essential source pattern;
- same response mode.

## 8. `low`

Assign `low` for minor differences that do not change the outcome or primary meaning.

Examples:

- extensive paraphrasing;
- different section order;
- a different secondary example;
- addition or omission of a non-essential detail;
- moderately different length;
- limited substitution of a secondary source.

Not allowed:

- change in `mentioned`, `cited` or `recommended`;
- contradiction;
- changed conclusion;
- omission of an essential element.

## 9. `medium`

Assign `medium` when variation is substantive but the primary target outcome and conclusion remain stable.

Examples:

- a secondary core claim appears in only one response;
- the explanation changes materially;
- the source set changes broadly;
- an important theme is omitted without reversing the conclusion;
- target prominence or position changes substantially;
- partial versus complete answer with the same conclusion.

`medium` counts as inconsistent in RCR v0.1.0.

## 10. `high`

Assign `high` when an essential outcome changes or comparability breaks.

Mandatory examples:

- `mentioned` changes between true and false;
- `cited` changes between true and false;
- `recommended` changes between true and false;
- material change in `recommendationStrength`;
- one response recommends the target and another excludes it;
- opposite conclusions;
- contradiction of a core claim;
- normal answer versus refusal or error;
- unplanned language change;
- loss or addition of elements that changes interpretation.

A technical protocol failure may require exclusion instead of `high`.

## 11. `not-assessed`

Use `not-assessed` when:

- the record is the baseline Observation;
- review has not yet been performed;
- evidence is insufficient;
- ambiguity is awaiting adjudication.

It does not enter the denominator and must be explained in `comparisonNotes` or quality control.

## 12. Decision tree

```text
Does the execution satisfy the condition and have sufficient evidence?
├─ No → Exclude and justify
└─ Yes
   Is it the baseline Observation?
   ├─ Yes → not-assessed
   └─ No
      Does it reference the correct frozen baseline?
      ├─ No → Revision required
      └─ Yes
         Did an essential target outcome or conclusion change?
         ├─ Yes → high
         └─ No
            Are there substantive differences in claims, sources or coverage?
            ├─ Yes → medium
            └─ No
               Are the differences limited to wording, order or minor detail?
               ├─ Yes → low
               └─ No → none
```

## 13. Operational procedure

1. Open the baseline evidence and comparison evidence.
2. Verify codes, prompt, system and conditions.
3. Review all five dimensions.
4. Record notes by dimension.
5. Assign provisional severity.
6. Apply the maximum-severity rule.
7. Save `baselineObservation`, `variationLevel` and `comparisonNotes`.
8. Perform the second coding.
9. Resolve disagreements using preserved evidence.
10. Set `reviewStatus` to `accepted` only after adjudication.

## 14. `comparisonNotes` template

```text
Baseline:
Comparison:
Target outcome:
Primary conclusion:
Core claims/themes:
Sources/attribution:
Response mode/completeness:
Highest observed severity:
Final variationLevel:
Evidence references:
Reviewer rationale:
```

## 15. GSLHub pilot examples

Assuming the same question, system and `gslhub.com` target:

| Comparison with baseline | Level |
| --- | --- |
| Same ideas and outcomes, wording only changes | `none` |
| Same outcome and conclusion, reordered sections and one secondary example | `low` |
| GSLHub remains mentioned and cited, but arguments and sources change broadly | `medium` |
| Baseline cites GSLHub and comparison does not | `high` |
| Baseline recommends GSLHub and comparison excludes it | `high` |
| Comparison is a refusal without a substantive answer | `high` or exclusion under protocol |
| Incomplete capture prevents assessment | `not-assessed` or exclusion |

## 16. Internal consistency

Before accepting a comparison:

- exactly one baseline must exist;
- the baseline cannot reference itself as a comparison;
- every comparison must use the same baseline;
- an execution cannot have two accepted Observations;
- `variationLevel` must be assessed;
- `comparisonNotes` must justify severity;
- target, prompt and system must match;
- evidence must be sufficient.

## 17. Double coding

Record:

```text
Coder A level
Coder B level
Agreement yes/no
Adjudicated level
Adjudication rationale
Reviewer
Date
```

When only one researcher is available, perform a second blind coding after a pre-specified interval.

## 18. Minimum reporting

Every RCR result must show:

```text
N_candidates
N_baselines = 1
N_assessed_comparisons
N_none
N_low
N_medium
N_high
N_not_assessed_or_excluded
Numerator = N_none + N_low
Denominator = N_none + N_low + N_medium + N_high
RCR = Numerator / Denominator
```

Also report:

- baseline execution and Observation;
- selection rule;
- individual levels;
- exclusions;
- reviewer agreement;
- system configuration and dates.

## 19. Checklist

- [ ] Experimental condition frozen.
- [ ] Baseline-selection rule approved.
- [ ] Valid baseline preserved.
- [ ] Same baseline used for every comparison.
- [ ] Five dimensions reviewed.
- [ ] Maximum severity applied.
- [ ] Justification notes saved.
- [ ] Second coding completed.
- [ ] Disagreements adjudicated.
- [ ] Exclusions documented.
- [ ] Numerator and denominator recounted.
- [ ] RCR independently recalculated.

## 20. Status

This codebook remains **Under review**. It must be tested with the deterministic scenario and additional synthetic cases covering `medium`, baseline changes, duplicates and insufficient evidence before it is frozen.
