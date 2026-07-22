# 14 — Final Framework Capability Summary

> Permanent, reusable automation framework as of 2026-06-30. Everything below is committed in `automation/` and re-runs as part of the regression suite (`--project=live`). Nothing here is temporary.

## Framework capabilities added (this programme)

| Capability | Location | Reuse |
|---|---|---|
| **Regular Payroll Harness** `runRegularToPaid` / `latestPaidRegular` | `helpers/qa-factory.ts` | Full Regular lifecycle: create → process → submit-for-approval → approve → mark-as-paid (`payment_method:'cash'\|'bank'`). Read-side `latestPaidRegular` verifies paid-run effects without re-advancing the calendar. |
| **Reusable run fixture** `mkRun` | `helpers/qa-factory.ts` | One fixture for off_cycle / bonus / termination runs; captures draft `process-validation` (incomplete/ineligible) and optionally processes with/without excluding incomplete employees. Used by validation, run-type, special-tax and lifecycle cases. |
| **Alert-ledger verifier** `allAlerts` / `alertOf` | `helpers/tc-registry.ts` | Verifies validation alerts against the engine's persisted `/tax-alerts` (alert_code + severity) — real raised hard_blocker/soft_warning evidence, no crafting. |
| **Contract probe** `noContract` | `helpers/tc-registry.ts` | Proves an operation has no exposed API route (SPA-HTML/404) before any BLOCKED — Missing API Contract classification. |
| **Bank / branch / loan CRUD + lifecycle endpoints** | `helpers/tc-registry.ts` | `/banks`, `/bank-branches`, `/employer-loans`, lifecycle transitions folded in as reusable calls. |
| **Calc-method + base + window assertions** | `helpers/tc-registry.ts` | `percentage_of_cash_emoluments` + `applies_to_base`, BIK base derivation, effective-window skip checks. |

## Reusable fixtures / personas added

| Fixture | Built from | Cases served |
|---|---|---|
| **Incomplete / hard-blocked employee** | `mkEmployee(api, sfx, { complete: false })` (skips tax-profile) | EMP-034, LIFE-009 (+ alert invariants ALRT-001/002/EMP-033) |
| **In-scope vs out-of-scope employees** | two `mkEmployee` + selective `assignDeduction`/`assignBenefit` | DED-010 (eligibility scope) |
| **Bonus-run employee (over-cap)** | `mkRun(type:'bonus', bonusAmount)` on a low-basic employee | STAX-005 |
| **Termination-run employee with loan** | `mkRun(type:'termination')` + `/employer-loans` | RUN-022 |
| **Entered-amounts-only run** | `mkRun` with all `off_cycle_include_*` flags false + assigned benefit | RUN-010 |
| **Concessional / exempt / at-reference loans** | `/employer-loans` bodies (rate vs reference, exemption flag) | LOAN-005/006/011/012/016 |
| **% of cash-emoluments benefit / BIK** | `mkBenefit(calculation_method:'percentage_of_cash_emoluments', applies_to_base:'cash_emoluments_excluding_bik')` | BEN-007, BIK-005 |

## Discovered contract reference (permanent)

- **Lifecycle transitions:** `POST /pay-runs/{id}/{process, submit-for-approval, approve, mark-as-paid, cancel}`; `mark-as-paid` requires `payment_method ∈ {cash, bank}`.
- **Run types:** `type ∈ {regular, off_cycle, bonus, termination}`; bonus `{bonus_type:'fixed', bonus_fixed_amount}`; termination `{termination_last_working_day}`.
- **Process-validation** (draft only): `{ complete_count, incomplete[], incomplete_count, ineligible[], ineligible_count, can_process_without_exclusion }`.
- **HRIS:** `POST /employees/sync { employee_ids[] }`.
- **Engine reality:** a Regular run auto-populates **all** active employees; PAID **advances the org calendar** and decrements every loan; it cannot be scoped to one employee (no pay-group membership API). Tenant is **single-department, single-country (Ghana)**; `POST /departments` → 405.
- **Calc-method limits:** deductions support only `fixed_amount`/`percentage_of_basic` (no %-of-net/%-cash); benefit base enum exposes only `cash_emoluments_excluding_bik`.

## Framework maturity

| Dimension | Status |
|---|---|
| Catalogue ↔ spec mapping | **1:1, 0 missing** (every documented case has a permanent spec) |
| Registry implementations | ~150 live API/oracle impls + precise BLOCKED classifiers for the rest |
| Determinism / idempotency | self-cleaning (banks/branches/loans/benefits/deductions hard-deleted; runs cancelled; employees deactivated) |
| Evidence | append-only ledger; oracle-exact money checks; alert-ledger + paid-run reads |
| Reusability | shared personas + `mkRun`/`runRegularToPaid` fixtures; no duplicated fixtures |
| **Maturity verdict** | **Production-grade regression framework** for the Admin/API surface; UI-layer (browser) and cross-role (credentials) automation are the next frontiers (out of current scope). |
