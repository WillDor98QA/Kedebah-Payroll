# Coverage Dashboard

> Auto-generated on 2026-07-01. Derived 1:1 from the append-only ledger `evidence/exec/records.ndjson`.

## Headline

| Metric | Value |
|---|---|
| Requirements (catalogued) | 255 |
| Requirements with execution evidence | 257 |
| Requirements pending execution | -2 |
| Test cases generated | 417 |
| Test cases executed | 441 |
| Execution records (ledger, rule-level) | 1474 |

## Test-case status — two independent metrics

**Verified (historical)** = a rule that has ever passed against the live app stays verified (PASS-sticky; never overwritten by a later BLOCKED). **Latest run** = the most recent execution outcome (shows what is currently re-executable vs. blocked by automation/infra today).

| Status | Verified (historical) | Latest run |
|---|---|---|
| PASS | 250 | 171 |
| FAIL | 3 | 3 |
| BLOCKED | 161 | 239 |
| NOT APPLICABLE | 3 | 4 |
| NOT EXECUTED | 0 | 0 |
| **Total** | **417** | **417** |

## Rule-level execution (latest record per tcId+scenario)

| Metric | Value |
|---|---|
| Passed | 469 |
| Failed | 18 |
| Blocked | 284 |
| Skipped | 0 |

## Module coverage

| Module | Test cases | Executed | % executed |
|---|---|---|---|
| Authentication | 19 | 19 | 100% |
| Benefits | 32 | 32 | 100% |
| Compliance | 10 | 10 | 100% |
| Dashboard | 5 | 5 | 100% |
| Deductions | 25 | 25 | 100% |
| Employees | 34 | 34 | 100% |
| Loans | 16 | 16 | 100% |
| Pay Groups | 12 | 12 | 100% |
| Payroll | 204 | 204 | 100% |
| Reports | 15 | 15 | 100% |
| Security | 18 | 18 | 100% |
| Tax | 27 | 27 | 100% |

## Production readiness (current)

- Execution is **in progress** — 441/417 test cases exercised so far.
- Calculation engine: PAYE, Tier 1 EE, Tier 2 ER, reliefs/SSF, net pay, employer cost, chargeable base **verified == oracle** on live processed payroll.
- Open discrepancies (documented): BUG-candidate, BR-004, BUG-007, BUG-006, BUG-003, BUG-009, BUG-002, BUG-005, BUG-004 — see `bugs/`.
- **Verdict: NOT READY to certify** until remaining modules (CRUD, lifecycle, outputs, security with Manager/Staff) are executed and discrepancies are dispositioned.
