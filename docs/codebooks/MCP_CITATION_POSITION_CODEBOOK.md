# MCP operational codebook — Target citation position

**Metric:** Mean Citation Position (MCP)  
**Version:** 0.1.0  
**Definition code:** GSL-MDEF-MCP-0001  
**Status:** Under review  
**Date:** 3 August 2026

## 1. Purpose

This codebook defines how to assign `citationPosition` for reproducible and auditable MCP calculation.

MCP uses the position of the **first valid target citation** in each cited execution. It does not measure citation frequency, support, authority, accuracy, or quality.

## 2. Coding unit

The unit is one eligible controlled execution containing at least one accepted target Citation in the primary surface.

Each execution receives one outcome:

```text
1, 2, 3... = first valid target position
NA           = the target was not cited
X            = cited, but position is unobservable or the execution is excluded
```

`NA` is not zero and does not enter the MCP denominator. `X` must be documented and reported separately.

## 3. Required surface record

Before running the round, record:

```text
systemCode
visibleInterfaceVersion
primaryCitationSurface
orderingConvention
captureMethod
captureViewport
locale
timezone
roundStartDate
```

Allowed `primaryCitationSurface` values:

```text
inline
end-references
source-cards
sources-panel
other-predefined
```

Do not change the primary surface after inspecting results.

## 4. Main rule

For each execution:

1. identify every accepted target Citation;
2. retain only citations from the primary surface;
3. remove duplicate representations of the same visual element;
4. order citations using the frozen convention;
5. assign the earliest position to the execution.

```text
P_i = min(citationPosition of valid target citations)
```

## 5. Surface conventions

### Inline

- read the body from top to bottom;
- within one block, read left to right;
- number visible markers from one;
- when multiple markers share a fragment, follow the order rendered by the interface.

### End references

- use the visible reference number when available;
- otherwise use visual list order;
- do not reorder by domain, title, or URL.

### Source cards

- use the initial rendered order;
- in a grid: top to bottom and then left to right within each visual row;
- record viewport and window size when they affect the grid.

### Sources panel or carousel

- preserve the initial state before interaction;
- record the complete order exposed by the interface;
- in a carousel, continue the sequence following the natural scroll direction;
- do not manually sort or filter sources during capture.

## 6. Multiple target citations

Example:

```text
Target positions in one execution: 2, 5, 7
Position used by MCP: 2
```

Later positions remain in Citations and may be reported, but they do not increase the execution’s weight.

## 7. Multiple URLs or entities belonging to the target

When the target is an organization or domain and several valid pages appear:

```text
position 2 → gslhub.com/research
position 4 → gslhub.com/benchmarks
```

Both are target Citations, but the execution contributes `P_i = 2`.

Equivalence must be covered by the target-identity dictionary approved for CR.

## 8. Interface duplicates

Do not count the same element twice when:

- a card is duplicated by responsive rendering;
- the same visual node is duplicated in the DOM;
- an animation or carousel repeats an item;
- overlapping captures include the same card twice.

Do not automatically deduplicate distinct citations merely because they share a domain. Different URLs may represent different sources.

Record deduplication decisions in `integrity.normalizationNotes` or `qualityControl.validationNotes`.

## 9. Secondary surfaces

When a citation appears inline and in the sources panel:

- preserve the representations needed to audit both surfaces;
- use only the primary surface for MCP;
- do not retrospectively choose the surface with the better rank;
- report secondary-surface appearances as descriptive data.

## 10. Ambiguous cases

Set `revision-required` when:

- visual order changes by viewport and no convention was frozen;
- a carousel does not expose a determinable complete order;
- cards overlap or load progressively;
- capture begins after an undocumented interaction;
- `citationPosition` disagrees between Observation and Citation;
- duplicate status is unclear;
- the interface changes during the round.

Adjudicate using preserved evidence. Never invent a position.

## 11. Not-applicable and excluded cases

| Case | Treatment |
| --- | --- |
| Valid execution without a target citation | `NA`; outside MCP, remains zero in CR |
| Target citation with observable position | Include in MCP |
| Visible target citation with unobservable order | `X`; report separately |
| Incomplete evidence | `revision-required` or justified exclusion |
| Unplanned interface change | Separate stratum or exclude under protocol |
| Execution invalid for general analysis | Exclude from CR and MCP |

## 12. Minimum Citation fields

```text
promptExecution
citationType
citationPosition
citationContext.location
sourceUrl
normalizedUrl
sourceDomain
targetCoding.targetType
targetCoding.targetValue
targetCoding.isEvaluatedTarget
targetCoding.targetMatchType
qualityControl.reviewStatus
evidence
```

## 13. Consistency checks

Before accepting a position:

- `citationPosition >= 1` and is an integer;
- `isEvaluatedTarget = true`;
- `targetMatchType` is not `none` or unresolved `unclear`;
- the Citation belongs to the same execution and scientific context;
- the surface matches the protocol;
- the position is visible in evidence;
- `Observations.visibilityCoding.cited = true`;
- only one position per execution enters MCP;
- the selected position is the minimum valid position.

## 14. Decision tree

```text
Is the execution included in the general analysis?
├─ No → Exclude from CR and MCP
└─ Yes
   Is there an accepted target citation?
   ├─ No → NA for MCP; zero for CR
   └─ Yes
      Does it belong to the primary surface?
      ├─ No → Preserve as secondary data
      └─ Yes
         Is order observable and auditable?
         ├─ No → X / revision-required
         └─ Yes
            Deduplicate → order → select minimum position
```

## 15. Independent review

For the first pilot:

1. one reviewer assigns positions without consulting the previous coding;
2. a second review checks surface, order, duplicates, and minimum position;
3. decisions are compared;
4. disagreements are adjudicated using evidence;
5. raw agreement and every correction reason are recorded.

## 16. Calculation

After all executions are reviewed:

```text
positions = [P_1, P_2, ..., P_n]
sumPositions = Σ positions
MCP = sumPositions / n
```

If `n = 0`:

```text
MCP = not estimable
```

Do not use `0`, a null value interpreted as zero, or a penalty rank.

## 17. Current synthetic scenario

```text
Cited execution 1 → position 1
Cited execution 2 → position 2
Cited execution 3 → position 3

Sum = 6
N_with_position = 3
MCP = 2.00
```

Future tests should add:

- two target citations in one execution;
- the same citation repeated in card and panel;
- an execution without citations;
- a citation with unobservable position;
- a surface change;
- a responsive grid.

## 18. Minimum reporting

```text
N_planned
N_generally_eligible
N_target_cited
N_cited_with_position
N_cited_without_position
individual_positions
sum_positions
MCP
CR
primary_surface
ordering_convention
```

For larger samples, also report median, minimum, maximum, and a dispersion measure.

## 19. Acceptance checklist

- [ ] Primary surface frozen.
- [ ] Ordering convention documented.
- [ ] Interface and viewport recorded.
- [ ] Target citations accepted under CR.
- [ ] Duplicates reviewed.
- [ ] Minimum position selected per execution.
- [ ] Evidence available for every position.
- [ ] Independent review completed.
- [ ] `NA` and `X` cases reported.
- [ ] Sum and mean independently recomputed.
- [ ] MCP presented together with CR.

## 20. Approval status

This codebook remains **Under review**. It must be tested with the additional cases and the real ChatGPT Search citation surface before MCP v0.1.0 is frozen.
