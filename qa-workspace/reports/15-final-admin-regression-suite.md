# 15 — Final Admin Regression Suite

> The permanent Playwright regression suite as of 2026-06-30. Run with `npx playwright test --project=live` from `automation/`. Strict 1:1 Markdown↔spec; **0 missing spec files**.

## Suite composition

| Layer | Location | Content |
|---|---|---|
| Per-module case specs | `automation/tests/<module>/*.cases.spec.ts` | one named test per documented TC-ID (417 total), dispatched through `helpers/case-runner.ts` |
| Live coverage specs | `automation/tests/payroll/*.live.spec.ts` | seed/PAYE/bonus/calc oracle checks |
| Unit specs | `automation/tests/unit/*.spec.ts` | calc-oracle + catalogue-coverage (run offline) |
| Implementation registry | `helpers/tc-registry.ts` | ~150 API/oracle implementations + precise BLOCKED classifiers |
| Fixtures / harness | `helpers/qa-factory.ts` | `mkEmployee`, `mkBenefit`, `mkDeduction`, `assign*`, `mkRun`, `runRegularToPaid`, `latestPaidRegular`, `deactivateAll` |

## Regression status

| Metric | Value |
|---|---|
| Documented cases | 417 (1:1 with specs; 0 missing) |
| **Verified PASS (regression-green, historical)** | **232** |
| Latest-run PASS | 152 |
| Standing FAIL (defects, expected-red) | 2 |
| Terminal BLOCKED (external; skip-with-reason) | 174 |
| N/A (§25) | 9 |
| Execution records (append-only ledger) | 1378 |

## Run guidance

- **Full regression:** `npx playwright test --project=live` — executes all impls live against the sandbox; PASS cases re-assert against the live engine; BLOCKED cases skip with their proven reason; the 2 defect cases carry a known-bug marker (stay green at the suite level, FAIL recorded in the ledger).
- **Single module/case:** `--grep "TC-LOAN-"` / `--grep "TC-STAX-005"`.
- **Reports:** after any run, regenerate with `node test-management/generate-reports.mjs && node test-management/exec-report.mjs && node test-management/generate-coverage-matrix.mjs` — all reconcile to 417.

## Regression readiness

| Dimension | Status |
|---|---|
| Determinism | ✅ self-cleaning data (AIQA_/ZZQA_), idempotent re-runs |
| Evidence integrity | ✅ append-only ledger; historical PASS never overwritten; FAIL only when latest |
| Catalogue coverage | ✅ 417/417 specs (0 missing) |
| **Stable green set** | **232 cases** — the engine/calculation/lifecycle/alert/loan/bank/payment core, safe to gate CI on |
| Known-red set | 2 defects (tracked to BUG register) |
| **Caveat** | Re-running the **Regular Payroll Harness** advances the org calendar and mass-marks-paid — it is **excluded from routine CI** and run only in a controlled maintenance window; paid-run assertions read the latest completed Regular run by default. |

**Verdict:** the Admin/API regression suite is **ready for continuous use** as the gate for the verified core; calendar-advancing harness runs are quarantined to controlled execution.
