# MCP v0.1.0 — Payload update sheet

**Record:** `GSL-MDEF-MCP-0001`  
**Status to retain:** `Under review`  
**Purpose:** align the production record with the scientific review and operational codebook.

## Formula

```text
MCP = (Σ P_i) / |C_pos|, for i ∈ C_pos

P_i = one-based position of the first valid target citation
C_pos = eligible executions with an accepted target citation and observable position
```

If `|C_pos| = 0`, the result is **not estimable**, never zero.

## Configuration

```text
Category: Position
Direction: Lower is better
Unit of Analysis: Experiment
Value Type: Number
Unit: Position
Aggregation Method: Mean
Missing Data Policy: Report separately
Rounding Precision: 2
Minimum: 1 inclusive
Maximum: empty
Open Methodology: true
Lifecycle Status: Under review
```

## English description

```text
Arithmetic mean of the one-based visible position of the first valid citation of the evaluated target across eligible executions in which the target was cited and its position was observable within a previously frozen citation surface.
```

## English interpretation

```text
Lower values indicate that, when cited, the target’s first citation tended to appear earlier within the defined primary surface. MCP is conditional on citation and must be reported together with CR, the number of cited executions, the number with observable position, and the individual positions. It does not measure citation frequency, claim support, authority, quality, or influence.
```

## English pseudocode

```text
Freeze the primary citation surface and ordering convention. For every included execution, retrieve accepted target Citations belonging to that surface. Deduplicate repeated representations of the same visible element. If the target has no citation, mark the execution as not applicable to MCP. If one or more citations exist, select the earliest valid position. Exclude from the denominator and report separately citations whose position cannot be observed. Sum one position per execution and divide by the number of cited executions with observable position. If that number is zero, report MCP as not estimable.
```

## English numerator

```text
Sum of the earliest one-based positions of the first valid target citation in each execution included in C_pos.
```

## English denominator

```text
Number of eligible executions containing at least one accepted target citation in the primary surface with an observable position. Uncited executions are structurally not applicable; cited executions without observable position are reported separately.
```

## English assumptions

```text
The primary surface, ordering convention, and viewport are frozen before the round. Every position follows the same one-based convention. Each execution contributes at most one position, corresponding to the earliest valid citation. Target identity and matching rules have already been approved through CR, and visible order can be audited from preserved evidence.
```

## English limitations

```text
MCP is conditional and may look favourable when the target is rarely cited, so it must be published together with CR. The mean is sensitive to outliers and long source lists, and with a small sample one position can materially change the result. Inline, reference-list, card, and panel positions are not comparable unless a frozen surface and convention are applied. MCP does not measure citation quality, claim support, authority, semantic prominence, or causal influence.
```

## English validation procedure

```text
Freeze the surface and order; verify the sample and CR; confirm every target Citation against evidence; review type, location, and position; deduplicate repeated representations; select the minimum position per execution; perform independent double review; adjudicate disagreements; recount cited executions and executions with position; sum positions; independently recompute MCP; compare it with the stored Metric Result; and report CR, MCP, positions, surface, exclusions, and interface changes.
```

## Required inputs

| Source collection | Field name | Required |
| --- | --- | ---: |
| Citations | `promptExecution` | Yes |
| Citations | `citationPosition` | Yes |
| Citations | `citationType` | Yes |
| Citations | `citationContext.location` | Yes |
| Citations | `targetCoding.isEvaluatedTarget` | Yes |
| Citations | `targetCoding.targetMatchType` | Yes |
| Citations | `qualityControl.reviewStatus` | Yes |
| Citations | `evidence` | Yes |
| Observations | `visibilityCoding.cited` | Yes |

## Mandatory minimum reporting

```text
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

## Fields that must not be changed

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

Keep `Validated At` empty and do not complete `Validated By` until additional cases and the pilot primary surface have been approved.

## Reference documents

- [`MCP_v0.1.0_REVIEW.md`](./MCP_v0.1.0_REVIEW.md)
- [`MCP_CITATION_POSITION_CODEBOOK.md`](../codebooks/MCP_CITATION_POSITION_CODEBOOK.md)
