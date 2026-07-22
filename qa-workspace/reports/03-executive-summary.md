# Executive Summary — Kedebah Payroll QA (living)

> **🔄 RECONCILED SNAPSHOT — 2026-06-29 (supersedes the inline figures further down).** Recomputed 1:1 from the append-only ledger `evidence/exec/records.ndjson` as two independent metrics. **Policy:** a historical PASS is never overwritten by a later BLOCKED — verification and latest-run are tracked separately.
> · **Verified (historical):** 184 PASS · 3 FAIL · 222 BLOCKED · 8 N/A = **417** ✓ · **Latest run:** 104 PASS · 2 FAIL · 302 BLOCKED · 9 N/A = **417** ✓
> · ~99 of the verified-BLOCKED are admin-reachable and queued for automation authoring; the remainder are externally blocked (Manager/Staff creds, unexposed API contracts, UI-only browser flows, Sanctum login, non-monthly schedules).
> · Authoritative live tables: [coverage-dashboard](../test-management/coverage-dashboard.md) · [automation-coverage-matrix](08-automation-coverage-matrix.md) — 0 missing spec files.

**Last updated:** 2026-06-28 · **Target:** https://payroll.kedebah.com (sandbox) · **Tenant:** William & Co Enterprises · **Role:** Payroll Admin

> Living document — refreshed after each execution milestone. Numbers come from the auto-generated
> [Coverage Dashboard](../test-management/coverage-dashboard.md) and
> [Executive QA Report](05-executive-qa-report.md).

## Status at a glance

| Dimension | Value |
|-----------|-------|
| Documented test cases (`test-cases/*.md`) | **417** (12 modules) |
| Suite ↔ catalogue mapping | **417 / 417 (100%)** — every case has a Playwright test, 0 silently missing |
| Cases verified PASS (live) | **159 / 417 catalogue (38%) · 159 / 391 admin-reachable (41%)** |
| Cases by terminal state | 159 PASS · 1 net-FAIL · 146 BLOCKED · 10 NOT-APPLICABLE · 101 queued-automatable · **0 not-executed** |
| Rule-level execution records | 723 → **363 PASS · 8 FAIL · 352 BLOCKED** |
| Open defects (the 8 FAILs) | **10** — BUG-001/008/010 (Low), BUG-002/003/006/007/009 (Med), **BUG-004/005 (High)** |
| Oracle self-validation | 135 assertions ✅ |
| **Production readiness** | **NOT READY to certify** — 29% of catalogue implemented; rest skip-with-reason |

> **How to read this (methodology, 2026-06-28):** the suite is now generated **1:1 from the
> `test-cases/*.md` catalogue** — one Playwright test per documented TC-ID (`tests/<module>/*.cases.spec.ts`
> → `helpers/run-cases.ts` + `helpers/tc-registry.ts`). Every one of the 417 cases is represented; **120
> are implemented & executed against the live app (119 PASS), and 297 are `test.skip` with a precise
> reason** (Manager/Staff creds · UI-only · dev API-contract · §25 gap · pending-impl). Strict
> requirement-level rollup (a requirement counts "verified" only if *all* its sub-cases pass) = 13/255;
> the 29%-of-cases figure is the fairer measure of what's actually automated. The earlier "47%" measured a
> curated subset, not the full catalogue.

## What has been verified against the live app (real, to the cent)

The **calculation engine is behaving correctly** for every rule tested, each asserted against an
independent oracle (`automation/utils/calc-oracle.ts`):

- ✅ **PAYE** — progressive bands, exact at all tested incomes **across the full band table**
  (low 5%/10%, mid 17.5%/25%, high 30%/35% — basics 900 / 8000 / 60000 all == oracle).
- ✅ **Chargeable income assembly** — qualifying income (incl. catalog BIK *and* employer-loan BIK) − reliefs − SSF.
- ✅ **Gross excludes BIK** (invariant #6); **BIK taxed, never paid**.
- ✅ **Net pay** = gross − after-tax deductions − employee statutory (where `total_statutory_employee` **includes PAYE** + SSNIT).
- ✅ **Employer cost** = gross + employer statutory.
- ✅ **Tier 1 employee 5.5%**, **Tier 2 employer 5%**; SSF auto-relief consistent.
- ✅ **Bonus tax + reconciliation (§17.1–§17.5)** across all processed/paid bonus runs — 15%-of-annual-basic
  cap, 5% final within cap, excess → marginal PAYE = `tax(ref+excess) − tax(ref)`, and
  `regular PAYE + bonus marginal = single-pass PAYE` — all == oracle to the cent.

## Pay-run lifecycle driven end-to-end ✅ (PRD §16/§19/§21)

- ✅ **All four run-type lifecycles** driven to terminal state: Off-cycle #85→PAID, Regular #86→PAID
  (calendar advanced 4→5, invariant #4 ✓), Bonus #88→PAID, Termination #89→Approved.
- ✅ **State machine robust** — every illegal transition blocked (422); idempotency (dup approve/mark-paid 422).
- ✅ **Bank payment file (§19)** — generated + parsed: metadata, 14 columns ordered, sorted by bank,
  real sort codes, TOTAL = exact sum, cash + incomplete employees skipped with reasons.
- ✅ **Cash employee excluded from bank file**; **off-cycle does not advance the calendar**; **payslip on paid run**.
- ✅ **Compliance audit trail** — every mutation logged (module/action/old+new/user/IP/timestamp); **immutable** (PUT/DELETE → 405).
- ✅ **Tax forms** — generated per authority with form code / period / due date / status / supplementary flag.

## Phase A/B — Employee-create & calc-application (NEW, 2026-06-27)

Cracked the contracts that were previously blocking deep config-application testing, then drove them:

- ✅ **Employee CRUD** — create (`POST /employees` + `/employees/lookup-resources` for FK ids), edit,
  payment-method matrix (Cash ✓, Bank Transfer ✓ + account-name validation; Mobile Money blocked on a
  field contract), required-field negatives. **Delete = deactivate-only** (no hard delete; PUT employment_status → Terminated).
- ✅ **COMPLETE-employee recipe** — the pay-run **readiness gate** (`GET /pay-runs/{id}/process-validation`)
  pinpointed the only missing field: **Tax Profile TIN**. Recipe:
  `create → POST /employees/{id}/salary → PUT /employee-tax-profiles/{id} {tin, ssnit_number, nhis_number}`.
  A complete employee then processes; PAYE/SSNIT/net == oracle to the cent.
- ✅ **Catalog assignment + in-effect resolution** — `PUT /employees/{id}/benefits|deductions {assignments:[…]}`;
  `GET /employees/{id}/benefits-in-effect` resolves assigned + eligibility-based items.
- ✅ **Calc-application == oracle** — benefit %-of-basic (300) + fixed (500); **BIK taxed in chargeable but
  excluded from gross** (400); deductions **before-tax** (chargeable 3335→3035), **after-tax** (net only),
  **%-of-net** (10% of gross−statutory). Deduction control field is **`tax_treatment` (before_tax/after_tax)**.

## Findings (10 defects)

| Bug | Sev | Summary | Disposition |
|-----|-----|---------|-------------|
| [BUG-001](../bugs/BUG-001.md) | Low | PAYE band `min_income` serialized zero-width in `/statutory-items` | Cosmetic; **tax verified correct** |
| [BUG-002](../bugs/BUG-002.md) | Med | Tier 1 employer rate: PRD §24 says 13%, live uses 8% (real Ghana split) | Likely **PRD doc error** — reconcile |
| [BUG-003](../bugs/BUG-003.md) | Med | SSF relief includes Tier 3; PRD §11 says Tier 1+2 only | Likely **PRD doc gap** — reconcile |
| [BUG-004](../bugs/BUG-004.md) | **High** | **PAYE config un-saveable**: validation requires non-overlapping bands but seed is contiguous → 422 | **Real defect** — PAYE bands cannot be edited as seeded |
| [BUG-005](../bugs/BUG-005.md) | **High** | **Statutory config save fails**: UI sends `POST /statutory-items/{id}/config` but route is PUT-only → 405 | **Real defect** — can't update statutory rates via UI |
| [BUG-006](../bugs/BUG-006.md) | Med | Regular run on an **empty pay group** populated **all active employees** | **Needs confirmation** with a populated subset group |
| [BUG-007](../bugs/BUG-007.md) | Med | **Approved (unpaid)** run cannot be cancelled/rejected/returned — no abort path | **Needs confirmation** (PRD §16 lists Cancel) |
| [BUG-008](../bugs/BUG-008.md) | Low | Editing a **seeded bank** returns 200 but ignores the change (data protected; response misleading) | Return explicit rejection |
| [BUG-009](../bugs/BUG-009.md) | Med | **Tampered/invalid Bearer token → HTTP 500** instead of 401 | Return 401 cleanly |
| [BUG-010](../bugs/BUG-010.md) | Low | Employee `payment_method` round-trip: API returns `cash`/`bank_transfer` but rejects them on write (only Title-Case accepted) | Normalise enum casing |

BUG-001/002/003 are documentation↔implementation discrepancies (app likely correct).
**BUG-004 and BUG-005 are real functional defects** (statutory-config editing in the app).

## Active data-driven (edit → recalc → restore) — DONE ✅

Per the requirement to *edit the tax, recalculate, and restore exactly*:
- **Tier 1 (single rate):** edited EE 5.5% → 6% via `PUT /statutory-items/{id}/config`, reprocessed run #79,
  engine recomputed Tier 1 EE 165 → 180 (== oracle), then restored 5.5% → config **byte-identical** to snapshot.
  Proves the engine is genuinely **data-driven**.
- **PAYE bands:** the edit surfaced **BUG-004** (config rejects the seeded contiguous bands) → a guaranteed
  restore was impossible, so **PAYE bands were NOT edited; verified byte-identical to snapshot**.

## Coverage gaps (why not ready)

- **47% of admin-reachable requirements verified** (118/249). Engine, lifecycle, outputs, audit, employee
  CRUD + calc-application + **Loans** + **Reports** are strong; remaining work is contract- or credential-gated.
- **Group A — needs dev API contracts:** Protected-pay rules, Pay-group member assignment, Overtime entry,
  Catalog approval-activation, Bank-branch create, Daily/Hourly comp, Variance/Audit report params.
- **Group C — needs Manager/Staff credentials** (~9 permission/security/self-service cases).
- **Group D — deferred** (~80 granular sub-cases): low-value re-verification of proven behaviours.
- Full unblock plan: [reports/07-requests-to-unblock.md](07-requests-to-unblock.md).
- Sandbox residue: ~40 throwaway `ZZ-QA` employees, all **deactivated** (no hard-delete API).

## Recommended next milestones

1. **Dev:** fix BUG-004/005 (statutory-config editing) and disposition BUG-002/003/006/007/009/010.
2. **You:** provide **Manager + Staff credentials** → unblock ~58 permission/security/self-service cases.
3. **Dev:** share API contracts for **loan-create, protected-pay-rule, and BIK monthly-cap** to finish admin config-application.
4. **QA:** drive Reports via UI; on the above, execute remaining modules and re-issue with a go/no-go.

## Artifacts
[Application Coverage Map](06-application-coverage-map.md) ·
[Executive QA Report](05-executive-qa-report.md) ·
[Developer Hand-off](04-developer-handoff.md) ·
[Coverage Dashboard](../test-management/coverage-dashboard.md) ·
[Test Execution Report](../test-management/test-execution-report.md) ·
[Test Case Catalogue](../test-management/test-case-catalogue.md) ·
[Traceability Matrix](../requirements/01-traceability-matrix.md) ·
[Defects](../bugs/)
