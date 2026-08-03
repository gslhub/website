# CR operational codebook — Target citation

**Metric:** Citation Rate (CR)  
**Version:** 0.1.0  
**Definition code:** GSL-MDEF-CR-0001  
**Status:** Under review  
**Date:** 3 August 2026

## 1. Purpose

This codebook defines how to identify, extract and validate citations of the evaluated target for reproducible CR calculation.

CR measures whether the system presents the target as a visible source or reference in each eligible execution. It does not measure whether the citation correctly supports a claim, is authoritative, prominent or favourable.

## 2. Coding unit

The analytical unit for CR is one eligible controlled execution.

Each execution receives one outcome:

```text
1 = at least one accepted target citation exists
0 = no accepted target citation exists
X = the execution is not codable or is excluded
```

Multiple target citations within one execution do not increase the numerator more than once.

## 3. Surfaces that must be reviewed

The reviewer must inspect and preserve, when available:

- the answer body;
- inline links;
- end references;
- source cards;
- source panels or carousels;
- tables and lists;
- expandable interface elements;
- visible link destinations.

Absence of citation must not be inferred without reviewing every source surface required by the protocol.

## 4. What counts as a citation

A citation counts when a visible, identifiable source is presented by the system as:

- an inline citation;
- an end reference;
- a source card;
- a source-panel item;
- a linked mention functioning as attribution;
- an unlinked reference clearly located in a source section.

The citation must be attributable to one execution and supported by preserved evidence.

## 5. What does not count

The following do not count for CR:

- a plain target mention without a source function;
- the target only inside the user prompt;
- browser address-bar text;
- browser history;
- hidden metadata or internal logs;
- a retrieved source not shown to the user;
- a domain, entity or name match that does not represent the target;
- a browser extension suggestion unrelated to the evaluated system.

## 6. Target identity

Before coding, a frozen identity dictionary must define:

```text
targetType
targetValue
canonicalName
acceptedAliases
acceptedDomains
acceptedSubdomains
acceptedRedirects
rejectedMatches
languageRules
normalizationVersion
```

### Basic URL normalization

To compare URLs or domains:

1. lowercase the host;
2. remove a terminal dot from the host;
3. handle `www.` according to the frozen rule;
4. normalize protocol when identity does not change;
5. ignore fragments;
6. ignore predefined tracking parameters;
7. preserve path and subdomain when relevant to identity;
8. record redirects and do not assume equivalence without evidence.

## 7. Minimum Citation fields

Each candidate Citation should record, when applicable:

```text
promptExecution
citationType
citationPosition
sourceTitle
sourceUrl
normalizedUrl
sourceDomain
citationContext.displayText
citationContext.location
targetCoding.targetType
targetCoding.targetValue
targetCoding.isEvaluatedTarget
targetCoding.targetMatchType
qualityControl.reviewStatus
evidence
```

## 8. Match types

| `targetMatchType` | Use |
| --- | --- |
| `exact` | Predefined exact name, URL or identifier. |
| `domain` | Domain or subdomain accepted by the dictionary. |
| `entity` | Entity unambiguously equivalent to the target. |
| `semantic` | Only for topics or concepts under a prior methodological rule. |
| `unclear` | Ambiguous match requiring adjudication. |
| `none` | Does not match the target. |

A `semantic` match must not be used to retrospectively broaden an organization, person or domain target.

## 9. Positive cases

| Case | Decision |
| --- | --- |
| Inline link to the target domain | Positive citation |
| Source card displaying the target domain | Positive citation |
| End reference with target title and URL | Positive citation |
| Source-panel item from the target | Positive citation |
| Organization name linked to its website as a source | Positive citation |
| Several target pages in one execution | Execution is positive once; retain every Citation |
| Target URL later stops resolving but was preserved at capture | Positive citation; document later verification |

## 10. Negative cases

| Case | Decision |
| --- | --- |
| Target mentioned in prose without attribution | Not a citation |
| Source panel contains competitors but not the target | CR = 0 |
| Homonym or different domain | No match |
| Source visible only through a browser extension | Outside the evaluated system |
| Retrieved page present only in a log | Not a visible citation |
| Ambiguous match adjudicated as false | No match |

## 11. Ambiguous cases

Set `revision-required` when there is:

- a shortened URL with no verifiable destination;
- an undocumented redirect;
- a name shared by several entities;
- a parent or subsidiary domain with no prior rule;
- a partial source-panel capture;
- an icon or favicon with insufficient text;
- a textual reference with unverified identity;
- disagreement between title, domain and final URL.

Adjudication must preserve the reasoning and evidence used.

## 12. Relationship between Observation and Citations

The Observation summarizes the execution through:

```text
visibilityCoding.cited
```

The consistency rule is:

```text
visibilityCoding.cited = true
↔ at least one accepted Citation has isEvaluatedTarget = true
```

When they disagree, the Observation or Citations must move to `revision-required` before CR is calculated.

## 13. Evidence and verification

Evidence must allow reviewers to verify:

- that the citation was visible;
- its position and type;
- the identity presented;
- the execution to which it belongs;
- the interface context.

`verification.supportsClaim` is coded separately. A citation may count for CR even when it does not support the claim, because CR measures attribution occurrence. That deficiency belongs to citation-quality analysis.

## 14. Decision tree

```text
Is the execution eligible and was the interface captured completely?
├─ No → X; document exclusion or non-codability
└─ Yes
   Is any visible source or reference present?
   ├─ No → CR = 0
   └─ Yes
      Does any source match the target under a frozen rule?
      ├─ Yes → create Citation record(s), accept after review and CR = 1
      ├─ No → CR = 0
      └─ Ambiguous → revision-required and adjudication
```

## 15. Coding procedure

1. Confirm execution, protocol and evidence.
2. Review every source surface.
3. Extract one Citation per distinguishable visible source.
4. Preserve text, URL, domain, position and context.
5. Apply the identity dictionary without viewing the other reviewer's result.
6. Set `isEvaluatedTarget` and `targetMatchType`.
7. Complete quality control.
8. Resolve ambiguous cases.
9. Check agreement with `visibilityCoding.cited`.
10. Reduce the execution to 1, 0 or X.

## 16. Double coding

For the first pilot, two independent reviews must check:

- visible-source inventory;
- target identity;
- citation type;
- position;
- binary execution outcome.

Record raw agreement, disagreements and adjudication. With five executions, chance-corrected agreement statistics must be interpreted cautiously.

## 17. Minimum reporting

```text
N_planned
N_completed
N_eligible
N_cited_executions
N_uncited_executions
N_excluded
N_total_target_citations
CR = N_cited_executions / N_eligible
```

Also report:

- target and normalization rules;
- observed citation types;
- positive and negative execution lists;
- ambiguous or rejected citations;
- missing captures;
- prompt, system, dates and interface version.

## 18. Acceptance checklist

- [ ] Target dictionary frozen.
- [ ] Every source surface reviewed.
- [ ] Each visible source has a Citation record or exclusion rationale.
- [ ] Evidence linked.
- [ ] Target match reviewed.
- [ ] `visibilityCoding.cited` agrees with Citations.
- [ ] Double review completed.
- [ ] Ambiguities adjudicated.
- [ ] Numerator and denominator recounted.
- [ ] CR independently recalculated.
- [ ] Raw counts included in reporting.

## 19. Approval status

This codebook remains **Under review**. It must be tested with synthetic data and the first controlled round before being frozen as version `1.0.0`.
