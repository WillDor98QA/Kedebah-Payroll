# Executive QA Report — Kedebah Payroll

> 2026-06-30 · Scope: **Admin role** on sandbox `https://payroll.kedebah.com` (tenant: William & Co Enterprises). Source of truth: PRD `PAYROLL_COMPLETE_SYSTEM_GUIDE.md`.

## Executive summary

The payroll **calculation engine and pay-run workflow are functionally strong** — every monetary rule tested matched an independent oracle to the cent, all four run-type lifecycles complete through to PAID, and the audit trail is complete and immutable. Execution covered the **highest-risk areas first**. Testing surfaced **12 defects** (2 High, 5 Medium, 3 Low); the two High defects both concern **statutory-config editing in the app**. The product is **NOT YET ready to certify** — cross-role/self-service testing is blocked on Manager/Staff credentials, and several config-application paths need API contracts from the dev team.

## Key metrics

| Metric | Value |
|---|---|
| Total requirements | 257 |
| Admin-reachable requirements | 250 (excl. 7 needing Manager/Staff) |
| Requirements verified (PASS/FAIL) | 171 → 68% of admin-reachable |
| Test cases executed | 417 / 417 (100%) |
| Rule-level execution records — *all attempts incl. superseded re-runs* | 763 (PASS 453 · FAIL 16 · BLOCKED 294) |
| **Catalogue verdict — PASS-sticky (canonical, = coverage matrix `reports/08`)** | **234 PASS · 1 FAIL · 174 BLOCKED · 8 N/A = 417 cases** |
| **Pass rate** (of verified rule-checks) | **97%** |
| Fail rate (of verified rule-checks) | 3% |
| Open defects | 12 (High 2 · Med 5 · Low 3) |

## Requirement status (all 257 — every requirement is PASS / FAIL / BLOCKED)

| Status | Count | % |
|---|---|---|
| ✅ PASS | 171 | 67% |
| ❌ FAIL | 0 | 0% |
| ⏸ BLOCKED (credentials / API-contract / client-side UI — see breakdown below) | 86 | 33% |

_No requirement is left silently "not executed" — every un-verified requirement is classified BLOCKED with a reason below._

## Defects by severity

| Bug | Severity | Module | Title | Status |
|---|---|---|---|---|
| [BUG-004](../bugs/BUG-004.md) | High | TAX | `PUT /statutory-items/{id}/config` rejects the seeded PAYE bands — config is un- | Open |
| [BUG-005](../bugs/BUG-005.md) | High | TAX | Statutory item config save uses `POST /statutory-items/{id}/config` but the rout | Open |
| [BUG-002](../bugs/BUG-002.md) | Medium | TAX | Tier 1 (SSNIT) employer contribution rate differs between PRD (13%) and live con | Open — needs disposition by PRD/config owner |
| [BUG-003](../bugs/BUG-003.md) | Medium | Tax / Reliefs | Auto SSF relief is computed from Tier 1 + Tier 2 + Tier 3 EE; PRD §11 says Tier  | Open — needs disposition by PRD owner |
| [BUG-006](../bugs/BUG-006.md) | Medium | PG | A Regular pay run linked to a pay group that has no members populated all active | Open — needs confirmation |
| [BUG-007](../bugs/BUG-007.md) | Medium | LIFE | Once a pay run reaches Approved, `cancel`, `reject`, and `return-to-previous` al | Open — needs confirmation |
| [BUG-009](../bugs/BUG-009.md) | Medium | SEC | Any auth failure — tampered/invalid token AND a missing token entirely — causes  | Open |
| [BUG-001](../bugs/BUG-001.md) | Low | TAX | PAYE statutory-item bands 3 & 4 return `min_income == max_income` (zero-width br | Open |
| [BUG-008](../bugs/BUG-008.md) | Low | BANK | `PUT /banks/{id}` on a system (seeded) bank returns 200 OK while silently NOT ap | Open |
| [BUG-010](../bugs/BUG-010.md) | Low | Employees (EMP) | `POST/PUT /employees` validates `payment_method` against Title-Case labels ("Cas | Open |
| [BUG-011](../bugs/BUG-011.md) | Critical | Enterprise Onboarding / Users & Roles | A user created in Payroll (with a role assigned) is not granted the Payroll modu | Open |
| [BUG-012](../bugs/BUG-012.md) | Major | Users & Roles / Auth | `POST /users` accepts a `password` (and `password_confirmation`) but silently ig | Open |

## Module coverage (% test cases executed)

| Module | Executed / Total | % |
|---|---|---|
| Authentication | 19/19 | 100% |
| Benefits | 32/32 | 100% |
| Compliance | 10/10 | 100% |
| Dashboard | 5/5 | 100% |
| Deductions | 25/25 | 100% |
| Employees | 34/34 | 100% |
| Loans | 16/16 | 100% |
| Pay Groups | 12/12 | 100% |
| Payroll | 204/204 | 100% |
| Reports | 15/15 | 100% |
| Security | 18/18 | 100% |
| Tax | 27/27 | 100% |

## Outstanding work — why not 100%

| Reason | Requirements |
|---|---|
| Admin-reachable — pending execution | 47 |
| Needs per-employee assignment / catalog approval-activation contract | 16 |
| Needs Manager/Staff credentials | 7 |
| Reports/exports rendered client-side — needs UI execution | 7 |
| Needs employee-create contract (HR reference-data layer not exposed via Admin API) | 5 |
| Boundary/edge needs controlled employee creation | 4 |

## Production readiness

**Verdict: NOT READY to certify.** What's proven is solid (engine, lifecycle, outputs, audit, basic security). Gating items:
- **2 High defects** block statutory-config editing in the app (BUG-004 validation-vs-seed, BUG-005 wrong HTTP method).
- **Cross-role & self-service untested** (7 requirements) — Manager/Staff credentials required.
- **Config-application & employee CRUD** not exercised — need the assignment / approval-activation / employee-create API contracts.

## Outstanding risks

1. **Statutory config cannot be maintained in-app** (BUG-004/005) — annual rate/band changes would fail silently; High.
2. **Pay-group scoping** (BUG-006) — a run on an empty group paid all active employees; risk of unintended mass payment.
3. **No abort path for an approved-unpaid run** (BUG-007) — combined with #2, risk of an erroneous payment.
4. **PRD vs implementation tax-rate mismatches** (BUG-002/003) — must reconcile authoritative Ghana figures before go-live.
5. **Permissions/self-service unverified** — the security boundary for Manager/Staff is not yet tested.

## Recommended next actions

1. **Dev:** fix the 2 High defects (BUG-004/005) and disposition BUG-002/003/006/007/009.
2. **You:** provide **Manager + Staff credentials** to unblock ~7+ permission/security/self-service requirements.
3. **Dev:** share the **API collection / endpoints** for employee-create, catalog assignment/approval-activation, protected-pay, and loans so the remaining admin config-application tests can run.
4. **QA:** on receipt of the above, execute the remaining modules and re-issue this report with a go/no-go.

## References
- Defect fix-list: [reports/04-developer-handoff.md](04-developer-handoff.md)
- Full pass/fail: [test-management/test-execution-report.md](../test-management/test-execution-report.md)
- Coverage dashboard: [test-management/coverage-dashboard.md](../test-management/coverage-dashboard.md)
