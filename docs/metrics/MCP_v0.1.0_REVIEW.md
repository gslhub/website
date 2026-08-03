# MCP v0.1.0 — Scientific review

**Metric code:** MCP  
**Definition code:** GSL-MDEF-MCP-0001  
**Status:** Under review  
**Version:** 0.1.0  
**Category:** Position  
**Direction:** Lower values indicate earlier appearance  
**Unit:** Ordinal position  
**Unit of analysis:** Experiment  
**Aggregation:** Arithmetic mean

## Purpose

Mean Citation Position measures the average visible position of the **first valid citation of the evaluated target** across eligible executions in which the target was cited and its position was observable.

MCP is a conditional presentation-order metric. It describes whether target citations tend to appear earlier or later within a frozen citation surface. It does not by itself measure citation quality, claim support, authority, influence, semantic prominence, or the probability of being cited.

## Canonical formula

Let `C_pos` be the set of eligible executions that contain at least one accepted target citation with an observable position. Let `P_i` be the one-based position of the first valid target citation in execution `i`:

```text
P_i = min(position of every accepted target citation in the primary surface)

MCP = (Σ P_i) / |C_pos|, for i ∈ C_pos
```

Valid range: `[1, +∞)`.

If `|C_pos| = 0`, MCP must be reported as **not estimable**, never as zero.

MCP is reported to two decimal places and must always be accompanied by:

- number of eligible experiment executions;
- number of executions in which the target was cited;
- number of cited executions with an observable position;
- sum of positions;
- individual positions;
- citation surface used;
- CR from the same analytical sample.

## Relationship with CR

CR answers: “In what proportion of executions was the target cited?”

MCP answers: “When the target was cited and position was observable, where did its first citation appear?”

Therefore:

- MCP is conditional on citation;
- uncited executions do not receive position zero or an artificial rank;
- MCP must be interpreted together with CR;
- an early MCP with very low CR does not imply high overall visibility.

## Primary citation surface

Before a round begins, one comparable primary citation surface must be frozen, for example:

- inline citations in the response body;
- end references;
- source cards;
- a sources panel or carousel.

The surface must be recorded in the protocol and system profile. Positions from incomparable interfaces or surfaces must not be mixed in one MCP result.

When the system exposes citations in more than one surface:

1. all available citations are preserved and extracted;
2. MCP uses only the primary surface defined before execution;
3. appearances in secondary surfaces remain descriptive data;
4. an interface change during the round requires stratification or exclusion under a predefined rule.

## Visible-order convention

Positions are one-based integers.

### Inline citations

Response reading order:

1. top to bottom;
2. left to right within the same line or block;
3. visible marker order when multiple citations are attached to one fragment.

### End references

Numeric or visual order of the reference list.

### Source cards or panels

Initial visual order rendered by the interface:

1. top to bottom;
2. left to right in a grid;
3. accessible carousel order when scrolling is required.

The evidence must preserve the initial state and, when necessary, the full panel sequence.

## Multiple target citations in one execution

Each execution contributes one position:

```text
P_i = the earliest position among accepted target citations
```

This prevents an execution with many citations from receiving more weight than an execution with one citation.

The total target-citation count and later positions may be reported separately, but they do not enter the primary mean more than once.

## Duplicates across surfaces

The same source may appear as an inline link, card, and panel item. Every visible representation can be preserved, but for MCP:

- only the primary surface is used;
- duplicate representations of the same interface element within that surface are deduplicated;
- different URLs or entities belonging to the target remain distinct citations, although the execution still contributes only its earliest position.

Deduplication should use `normalizedUrl`, `sourceDomain`, target identity, and preserved interface evidence.

## Eligibility

An execution belongs to `C_pos` when:

1. it follows the frozen protocol;
2. it is included in the analytical sample;
3. it contains at least one accepted target Citation;
4. `targetCoding.isEvaluatedTarget = true`;
5. the citation belongs to the primary surface;
6. `citationPosition` is visible, integral, and at least one;
7. evidence is sufficient to audit the order.

A cited execution whose position cannot be observed does not become zero. It is reported as a citation without observable position and excluded from `C_pos` with a documented reason.

## Missing-data policy

Recommended Payload policy: **Report separately**.

Required distinctions:

- uncited execution: structurally not applicable to MCP;
- cited execution with observable position: included in `C_pos`;
- cited execution without observable position: reported separately;
- execution excluded from the general analysis: excluded from both CR and MCP.

Do not impute positions and do not assign a penalty rank to uncited executions in MCP v0.1.0. A future metric combining frequency and position must be defined separately.

## Required inputs

| Collection | Field | Required | Function |
| --- | --- | ---: | --- |
| Citations | `promptExecution` | Yes | Groups citations by execution. |
| Citations | `citationPosition` | Yes | One-based visible position. |
| Citations | `citationType` | Yes | Identifies the surface or representation. |
| Citations | `citationContext.location` | Yes | Confirms visible location. |
| Citations | `targetCoding.isEvaluatedTarget` | Yes | Restricts calculation to the target. |
| Citations | `targetCoding.targetMatchType` | Yes | Documents target matching. |
| Citations | `qualityControl.reviewStatus` | Yes | Restricts calculation to accepted citations. |
| Citations | `evidence` | Yes | Makes order and interface auditable. |
| Observations | `visibilityCoding.cited` | Yes | Consistency check against CR. |

## Interpretation

Lower values indicate that, when cited, the target’s first citation tended to appear earlier within the defined primary surface.

MCP does not establish:

- frequent citation;
- correct claim support;
- authoritative or primary sourcing;
- equal user visibility across interfaces;
- causal influence of early position on the answer;
- comparability between different citation surfaces.

Position is a property of a specific interface, version, and protocol. The system, visible version, surface, date, and capture method must be recorded.

## Assumptions

- The primary surface is frozen before the round.
- Visible order can be reconstructed from preserved evidence.
- Every position follows the same one-based convention.
- Each execution contributes at most one position.
- Target identity and matching rules have already been approved for CR.
- Citations are reviewed independently of the final MCP value.

## Limitations

MCP is conditional and may look favourable when the target is rarely cited. It must therefore always be reported together with CR and eligibility counts.

The mean is sensitive to outliers and long source lists. With few observations, one rank can materially change the result. Individual positions should be reported and, in larger samples, median, minimum, maximum, and dispersion should also be provided.

Inline, card, and panel positions are not automatically equivalent. Comparability exists only within a frozen interface convention.

## Validation procedure

1. Freeze the primary surface and ordering convention.
2. Verify the eligible sample and CR result.
3. Confirm every accepted target Citation against preserved evidence.
4. Review `citationType`, `citationContext.location`, and `citationPosition`.
5. Deduplicate repeated representations within the primary surface.
6. Select the earliest target position per execution.
7. Perform independent double review of positions.
8. Adjudicate disagreements using captures and preserved records.
9. Recount `N_cited` and `N_with_position`.
10. Sum positions and independently recompute MCP.
11. Compare the result with the stored Metric Result.
12. Report CR, MCP, positions, surface, exclusions, and interface changes.

## Existing deterministic scenario

The GSLHub synthetic pipeline uses three cited executions with positions:

```text
1, 2, 3

Σ positions = 6
N_with_position = 3
MCP = 6 / 3 = 2.00
```

This validates basic arithmetic but should be extended with tests for multiple citations per execution, cross-surface duplicates, no citations, and unobservable position.

## Recommended Payload values

```text
Title: Mean Citation Position
Metric Code: MCP
Version: 0.1.0
Lifecycle Status: Under review
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
```

Do not move the definition to `Validated` until the position codebook, multi-citation tests, and primary surface for the first pilot have been approved.

## Scientific basis

- Liu, N. F., Zhang, T., & Liang, P. (2023). *Evaluating Verifiability in Generative Search Engines*. Findings of EMNLP 2023. DOI: 10.18653/v1/2023.findings-emnlp.467.
- Xu, Y., Gao, J., Yu, X., Bi, B., Shen, H., & Cheng, X. (2025). *ALiiCE: Evaluating Positional Fine-grained Citation Generation*. NAACL 2025. DOI: 10.18653/v1/2025.naacl-long.23.
- Kirsten, E. et al. (2026). *Characterizing Web Search in The Age of Generative AI*. Findings of ACL 2026. DOI: 10.18653/v1/2026.findings-acl.526.
- Pfrommer, S. et al. (2024). *Ranking Manipulation for Conversational Search Engines*. EMNLP 2024. DOI: 10.18653/v1/2024.emnlp-main.534.
