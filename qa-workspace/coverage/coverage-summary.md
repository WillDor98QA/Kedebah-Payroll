# Coverage Summary

> **🔄 RECONCILED SNAPSHOT — 2026-06-29 (supersedes the execution figures below).** Recomputed 1:1 from the append-only ledger `evidence/exec/records.ndjson`, two independent metrics (historical PASS never overwritten by a later BLOCKED):
> **Verified (historical):** 184 PASS · 3 FAIL · 222 BLOCKED · 8 N/A = **417** ✓ · **Latest run:** 104 PASS · 2 FAIL · 302 BLOCKED · 9 N/A = **417** ✓ · ~99 admin-reachable cases queued for automation authoring. Live source: [coverage-dashboard](../test-management/coverage-dashboard.md).

Living roll-up of design coverage. Execution coverage (pass/fail) is added in Phase 7.

## Design coverage (current)

| Metric | Value |
|--------|-------|
| Requirements catalogued | ~260 (`requirements/00-requirements-catalog.md`) |
| Test cases authored | **417** across 25 modules |
| Modules with test cases | 25 / 25 (100%) |
| P1 requirements with ≥1 test case | 100% (verify per RTM) |
| Documented gaps (§25) with verify-only cases | 16 / 16 |
| High-risk invariants with dedicated cases | 10 / 10 |
| Oracle unit tests (runnable now) | **27 specs / 135 assertions — ✅ all passing** |
| Browser/API specs scaffolded | login, paye-engine, permissions (self-skip until app) |

## Test cases per module

| Module | TCs | Module | TCs |
|--------|-----|--------|-----|
| EMP (Employees) | 37 | BIK (Benefits-in-Kind) | 18 |
| CAL (Calc Engine) | 29 | ALRT (Alerts) | 17 |
| STAX (Special Tax) | 26 | LOAN (Loans) | 16 |
| RUN (Run Types) | 23 | BEN (Benefits/Earnings) | 16 |
| CYCLE (Pay Calendar) | 22 | BANK (Bank Setup) | 16 |
| AUTH (Authentication) | 22 | RPT (Reports) | 15 |
| TAX (Tax & Statutory) | 21 | PROT (Protected Pay) | 14 |
| LIFE (Lifecycle) | 21 | FORM (Forms & Filings) | 14 |
| PAYM (Payments) | 19 | DED (Deductions) | 14 |
| PAYE (PAYE Bands) | 19 | PG (Pay Groups) | 12 |
| SLIP (Payslips) | 18 | COMP (Compliance) | 11 |
| SEC (Security) | 18 | RELF (Reliefs) | 9 |
| | | DASH (Dashboard) | 5 (provisional) |

## High-risk invariant coverage (RTM §invariants)

| # | Invariant | Cases |
|---|-----------|-------|
| 1 | No untaxed pay (`missing_income_tax_engine` hard block) | TC-TAX-010, TC-ALRT-001, TC-EMP-033 |
| 2 | Statutory never trimmed by protected pay | TC-PROT-007 |
| 3 | Drafts never move money (loan balances) | TC-LOAN-009/010 |
| 4 | Only Regular runs advance the calendar | TC-RUN-004/009/016/021, TC-CYCLE-009/010 |
| 5 | Bonus reconciliation (regular + bonus = single-pass) | TC-STAX-007 |
| 6 | BIK taxed, never paid | TC-BIK-011/012, TC-SLIP-007 |
| 7 | Filed forms never silently mutated (-SUPP) | TC-FORM-005/006 |
| 8 | API is the security boundary | TC-AUTH-017, TC-SEC-001/002/006 |
| 9 | Negative net = error | TC-CAL-017, TC-ALRT-002 |
| 10 | Self-service scope isolation (IDOR) | TC-SEC-014, TC-SLIP-015 |

## Execution coverage (live sandbox — updated 2026-06-27)

Target: https://payroll.kedebah.com (sandbox), business "William & Co Enterprises", Admin only.
See [Coverage Dashboard](../test-management/coverage-dashboard.md) and [Executive QA Report](../reports/05-executive-qa-report.md).

**Headline (2026-06-28, suite now generated 1:1 from `test-cases/*.md`):** **417 / 417 documented cases enumerated** (every case has a test) ·
**159 / 391 admin-reachable verified PASS (41%)** · 159 PASS · 1 net-FAIL · 146 BLOCKED · 10 NOT-APPLICABLE · 101 queued-automatable · **0 not-executed** · **723 rule-level records — 363 PASS · 8 FAIL · 352 BLOCKED** ·
10 defects (2 High, 5 Med, 3 Low). The 297 skips carry precise reasons (creds / UI / dev-contract / §25 / pending-impl) — see [reports/07-requests-to-unblock.md](../reports/07-requests-to-unblock.md).

### Per-module coverage (from auto-generated dashboard)

| Module | Executed / Total | % | Module | Executed / Total | % |
|--------|------------------|---|--------|------------------|---|
| Payroll | 54 / 204 | 26% | Pay Groups | 5 / 12 | 42% |
| Employees | 9 / 34 | 26% | Compliance | 4 / 10 | 40% |
| Benefits | 8 / 32 | 25% | Security | 7 / 18 | 39% |
| Tax | 7 / 27 | 26% | Reports | 1 / 15 | 7% |
| Deductions | 2 / 25 | 8% | Loans | 1 / 16 | 6% |
| Authentication | 2 / 19 | 11% | Dashboard | 1 / 5 | 20% |

> Note: the case count understates engine depth — many oracle checks map to a few catalogue cases.
> See the [Application Coverage Map](../reports/06-application-coverage-map.md) for testing-level by domain.

### Testing-level by domain

| Domain | Level | PASS / FAIL / BLOCKED (rule-level) |
|--------|-------|-----------------------------------|
| Calculation engine (PAYE / STAX / Calc / bands) | 🟢 Deep | ~119 / 0 / 2 |
| Pay-run lifecycle + payments + payslips | 🟢 Deep | ~37 / 1 / 1 |
| Employees (CRUD, complete-employee, assignment) | 🟢 Deep | 14 / 1 / 2 |
| Compensation catalog (Benefits / BIK / Deductions) | 🟢 Deep | 22 / 0 / 7 |
| Tax forms / Compliance | 🟢 Deep | 7 / 0 / 0 |
| Tax configuration | 🟡 Moderate | 16 / 3 / 3 (BUG-004/005 High) |
| Security (admin-side) | 🟡 Moderate | 7 / 3 / 2 |
| Authentication / Pay Groups / Dashboard | 🟡/🟠 | small (Manager/Staff blocked) |
| Loans + Protected Pay | 🔴 Blocked | 10 / 0 / 3 (mostly read-only; create-contract pending) |
| Reports (8) | 🔴 Blocked | 5 / 0 / 4 (client-side; needs UI run) |

**Defects:** BUG-001/008/010 (Low), BUG-002/003/006/007/009 (Med), **BUG-004/005 (High)** — see `bugs/`.
**Discrepancies:** multi-tenant business-select (undocumented), Bearer+tenant auth, +1 WHT statutory item — see execution report §3.
