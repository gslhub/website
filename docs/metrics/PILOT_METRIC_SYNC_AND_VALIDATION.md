# Pilot metric synchronization and deterministic validation

**Scope:** AIR, CR, MCP and RCR v0.1.0  
**Scientific lifecycle:** Under review  
**Purpose:** synchronize the permanent Payload records with the reviewed bilingual registry and verify all four calculators before formal validation.

## Preconditions

- The administrator is authenticated in Payload.
- The project `GSL-GEO-BENCH-01` exists.
- The benchmark `GSL-BENCH-GEO-01` exists.
- Researcher `eduardo-yauri` exists.
- Research area `GEO` exists.
- The protocol Resource and toolkit Software records are recommended but optional.
- AIR, CR, MCP and RCR must still be `planned` or `under-review` for synchronization.

The synchronization action refuses to overwrite definitions whose scientific lifecycle is `validated`, `active`, `deprecated` or `archived`.

## 1. Deploy and compile

Deploy the current `main` branch and confirm that the Next.js/Payload build completes successfully.

## 2. Synchronize permanent definitions

In Payload:

1. Open **Administration → Administrative Batches**.
2. Create a new batch.
3. Select:

```text
Permanent pilot metric definitions — create or synchronize AIR, CR, MCP and RCR v0.1.0
```

4. Save the batch.
5. Run the generated administrative action.
6. Confirm status `Completed` and `recordCount = 4`.

The action is idempotent:

- missing definitions are created;
- existing `planned` or `under-review` definitions are synchronized;
- duplicates cause a hard stop;
- scientifically frozen definitions are never overwritten.

## 3. Verify the four permanent records

Open **Research Operations → Metric Definitions** and verify:

```text
GSL-MDEF-AIR-0001
GSL-MDEF-CR-0001
GSL-MDEF-MCP-0001
GSL-MDEF-RCR-0001
```

For each record confirm:

- Version `0.1.0`.
- Lifecycle Status `Under review`.
- Editorial status `Draft`.
- Missing Data Policy `Report separately`.
- Open Methodology enabled.
- `Validated At` empty.
- `Validated By` empty.
- English and Spanish localized content present.
- Formula, inputs, assumptions, limitations and validation procedure match the reviewed registry.

Expected precision:

```text
AIR: 4 decimals
CR:  4 decimals
MCP: 2 decimals
RCR: 4 decimals
```

## 4. Run deterministic validation scenarios

Create and run one new Administrative Batch for each scenario, in this order:

```text
AIR deterministic validation
CR deterministic validation
MCP deterministic validation
RCR deterministic validation
```

Do not reuse a completed batch. Each scenario creates disposable `TEST-` records and one calculated Metric Result linked to the permanent definition.

## 5. Expected results

### AIR

```text
Numerator:    3
Denominator:  4
Value:        0.7500
Excluded:     1
```

### CR

```text
Numerator:    2
Denominator:  4
Value:        0.5000
```

### MCP

```text
Positions:    1, 2, 3
Sum:          6
Denominator:  3
Value:        2.00
```

### RCR

```text
Baseline:     1 not-assessed observation
Levels:       none, low, low, high
Numerator:    3
Denominator:  4
Value:        0.7500
Excluded:     1 baseline record
```

## 6. Inspect each calculated Metric Result

For every deterministic result confirm:

- the correct permanent `metricDefinition` relationship;
- inherited metric code, name, version, category, direction and unit;
- inherited formula snapshot;
- inherited Missing Data Policy `Report separately`;
- expected numerator, denominator and numeric value;
- input and output SHA-256 checksums;
- query snapshot with reported exclusions;
- quality-control status still `Pending`.

The deterministic Metric Results are synthetic validation records. They must not be promoted as real doctoral findings.

## 7. Cleanup

After reviewing one deterministic batch, delete its Administrative Batch to run the controlled cleanup of its `TEST-` records.

Never delete the permanent metric-definition synchronization batch expecting the scientific definitions to be removed. Permanent AIR, CR, MCP and RCR records are preserved independently of the administrative audit record.

## 8. Promotion gate

Do not change a definition to `Validated` until all of the following are complete:

- bilingual registry synchronization verified;
- codebook reviewed;
- deterministic scenario passed;
- formula and expected result independently recalculated;
- input and output checksums stable;
- target dictionary approved for AIR and CR;
- primary citation surface approved for MCP;
- baseline rule and variation codebook approved for RCR;
- `Validated At` and at least one `Validated By` researcher ready to be recorded.

Formal validation freezes the protected scientific fields. Later methodological changes require a new semantic version rather than overwriting v0.1.0.
