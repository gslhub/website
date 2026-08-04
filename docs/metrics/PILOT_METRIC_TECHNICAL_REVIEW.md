# Pilot metric author technical review

**Scope:** AIR, CR, MCP and RCR v0.1.0  
**Platform version:** 0.4.2  
**Scientific lifecycle after this action:** `Under review`  
**Author self-reviewer:** Eduardo José Yauri Luna  
**Independent review:** still pending

## Purpose

This procedure records the technical verification already completed for the four pilot metrics without pretending that author self-review is an independent scientific validation.

The action writes to the dedicated `Technical Review` group and deliberately leaves the formal fields empty:

```text
Validated At: empty
Validated By: empty
Lifecycle Status: Under review
Editorial Status: Draft
```

## Preconditions

- Version 0.4.2 has compiled and deployed successfully.
- Researcher `eduardo-yauri` exists as Eduardo José Yauri Luna.
- The four permanent definitions exist exactly once:

```text
GSL-MDEF-AIR-0001
GSL-MDEF-CR-0001
GSL-MDEF-MCP-0001
GSL-MDEF-RCR-0001
```

- Every definition is version `0.1.0`, `Under review` and `Draft`.
- The deterministic scenarios have passed and their disposable `TEST-` records have been removed.

## Run the permanent action

1. Open **Administration → Administrative Batches**.
2. Create a new batch.
3. Select:

```text
Record pilot metric author technical review — AIR, CR, MCP and RCR v0.1.0
```

4. Save the batch.
5. Select **Run selected action**.
6. Confirm:

```text
Status: Completed
Record Count: 4
```

This is a permanent documentation action. Deleting its Administrative Batch audit record does not remove the Technical Review data from the four Metric Definitions.

## Expected values in each Metric Definition

Open each definition and inspect `Technical Review`.

```text
Status: Completed
Review Mode: Author self-review
Reviewed At: populated
Reviewed By: Eduardo José Yauri Luna
Deterministic Validation Status: Passed
Independent Review Status: Pending
Independent Reviewed At: empty
Independent Reviewed By: empty
```

The notes must be present in English and Spanish and must contain the observed deterministic result for that metric.

## Expected deterministic statements

```text
AIR: 3 / 4 = 0.7500, with 1 reported exclusion
CR:  2 / 4 = 0.5000, with 1 reported exclusion
MCP: positions 1, 2 and 3; mean = 2.00
RCR: none, low, low, high; 3 / 4 = 0.7500
```

The notes must also state that:

- the review was an author technical self-review;
- synthetic `TEST-` records were removed after verification;
- permanent Metric Definitions were preserved;
- independent review remains pending.

## Governance rules

While a definition is `planned` or `under-review`, Payload rejects attempts to populate `Validated At` or `Validated By`.

A transition to `Validated` requires all of the following:

- completed Technical Review;
- deterministic validation status `Passed`;
- completed independent review;
- an independent reviewer different from the author self-reviewer;
- populated formal `Validated At` and `Validated By` fields;
- required numerator and denominator definitions for ratio metrics.

After formal validation, the Technical Review and the rest of the scientific definition become frozen. Later methodological changes require a new semantic version.
