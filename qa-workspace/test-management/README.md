# Test Management (enterprise deliverables)

This folder holds the **continuously-maintained** QA management artifacts. They are **auto-generated**
— do not hand-edit; edit the sources and regenerate.

## Deliverables (generated)

| File | What |
|------|------|
| `test-case-catalogue.md` | Master catalogue of all 417 test cases: TC ID · Requirement ID · Module · Feature · Scenario · Test Type · Expected Result · Automation Status · Execution Status. |
| `test-execution-report.md` | Living execution log — one row per validated business rule: TC ID · Req · Module · Feature · Scenario · Expected · Actual · Status · Timestamp · Evidence · Bug. |
| `coverage-dashboard.md` | Requirements covered/pending, cases generated/executed, pass/fail/blocked/skipped, module coverage, production-readiness verdict. |

## Sources

- **Catalogue source:** `../test-cases/**/*.md` (the authored test cases).
- **Execution source:** `../evidence/exec/records.ndjson` — append-only NDJSON written by live specs
  via `../automation/helpers/exec-recorder.ts` (`record()` / `recordMoney()`). One record per
  business rule; the generator de-dups by `tcId + scenario` keeping the latest timestamp.

## Regenerate (after every milestone)

```bash
cd qa-workspace
node test-management/generate-reports.mjs
```

The generator (`generate-reports.mjs`) re-parses the catalogue, aggregates execution records, and
rewrites the three files. Execution Status in the catalogue is derived from records
(FAIL > BLOCKED > PASS > NOT EXECUTED per TC).

## Workflow per milestone

1. Run the live specs (they append execution records automatically).
2. `node test-management/generate-reports.mjs`.
3. Update `../requirements/01-traceability-matrix.md` and `../reports/03-executive-summary.md`.
4. Log any new defects under `../bugs/`.
