# Application Coverage Map — Kedebah Payroll

> **🔄 RECONCILED SNAPSHOT — 2026-06-29 (supersedes inline figures below).** Recomputed 1:1 from `evidence/exec/records.ndjson`, two independent metrics (historical PASS never overwritten by a later BLOCKED):
> **Verified (historical):** 184 PASS · 3 FAIL · 222 BLOCKED · 8 N/A = **417** ✓ · **Latest run:** 104 PASS · 2 FAIL · 302 BLOCKED · 9 N/A = **417** ✓ · ~99 admin-reachable cases queued for automation. Live source: [coverage-dashboard](../test-management/coverage-dashboard.md).

**Updated:** 2026-06-28 · Scope: **Admin role** on sandbox `https://payroll.kedebah.com` (tenant: William & Co Enterprises).
Source: suite generated 1:1 from `test-cases/*.md` — **417/417 cases enumerated; 159 verified PASS (41% of 391 admin-reachable), 1 net-FAIL, 146 BLOCKED, 10 NOT-APPLICABLE, 101 queued-automatable, 0 not-executed**;
`evidence/exec/records.ndjson` 723 rule-level records (363 PASS / 8 FAIL / 352 BLOCKED) + [Coverage Dashboard](../test-management/coverage-dashboard.md).

A functional map of the application with the **level of testing** marked on each area.

**Legend:** 🟢 Deep (driven end-to-end + verified vs independent oracle) · 🟡 Moderate (core proven, sub-areas open) ·
🟠 Light (a few checks) · 🔴 Blocked (needs a contract or credentials) · ⚪ Not started

```
KEDEBAH PAYROLL
│
├─ 1. AUTHENTICATION & ACCESS ................................. 🟡 Moderate
│   ├─ Admin login (Bearer token + X-Tenant-Id) ............... 🟢
│   ├─ Multi-tenant / business-select isolation .............. 🟢  (bogus tenant ignored, no leak)
│   ├─ Login negatives / identifier detection ................ 🟠
│   └─ Role permissions — Manager / Staff .................... 🔴  needs credentials
│
├─ 2. EMPLOYEE MANAGEMENT ..................................... 🟢 Deep  (cracked 2026-06-27)
│   ├─ Create / edit / CRUD .................................. 🟢
│   ├─ Compensation — Monthly ................................ 🟢   |  Daily / Hourly ........ 🔴 field contract
│   ├─ Payment methods — Cash, Bank Transfer ................. 🟢   |  Mobile Money .......... 🔴  + BUG-010
│   ├─ Tax Profile / payroll-completeness (TIN) .............. 🟢   ← the unlock
│   ├─ Benefit/Deduction assignment + in-effect resolution ... 🟢
│   ├─ Readiness gate (incomplete blocked) ................... 🟢
│   └─ Delete (deactivate-only, no hard delete) .............. 🟢
│
├─ 3. COMPENSATION CATALOG .................................... 🟢 Deep
│   ├─ Benefits — Fixed + %-of-Basic (create + applied) ...... 🟢
│   ├─ BIK — taxed in chargeable, excluded from gross ........ 🟢   |  monthly cap .......... 🔴
│   ├─ Deductions — before-tax / after-tax / %-of-net ........ 🟢
│   └─ %-of-Cash-Emolument .................................. 🟠
│
├─ 4. PAY GROUPS ............................................. 🟡 Moderate
│   ├─ Create / CRUD ........................................ 🟢
│   └─ Member scoping ....................................... 🟠  BUG-006 (empty group paid everyone)
│
├─ 5. LOANS & PROTECTED PAY .................................. 🟡 Loans deep / PP blocked
│   ├─ Loan create + affordability ......................... 🟢  POST /employer-loans cracked
│   ├─ Loan repayment line + loan-BIK ...................... 🟢  verified in run
│   ├─ Balance only moves on Paid (invariant #3) ........... 🟢
│   └─ Protected Pay (rule create / trim + carryover) ...... 🔴  protected-pay-rules contract not exposed
│
├─ 6. PAYROLL CALCULATION ENGINE ............................. 🟢 Deepest  (== oracle to the cent)
│   ├─ PAYE progressive bands (low / mid / high) ............ 🟢
│   ├─ SSNIT Tier 1 / Tier 2 ............................... 🟢
│   ├─ Reliefs / SSF / chargeable-income assembly ........... 🟢
│   ├─ Bonus (15% cap, marginal, reconciliation §17) ........ 🟢
│   ├─ Gross / Net / Employer-cost invariants ............... 🟢
│   ├─ Overtime (junior vs senior) ......................... 🟡
│   └─ Pension 35% cap ..................................... 🟠
│
├─ 7. PAY-RUN LIFECYCLE ...................................... 🟢 Deep
│   ├─ 4 run types → PAID/Approved (Regular/Off-cycle/Bonus/Term) 🟢
│   ├─ State machine — illegal transitions blocked .......... 🟢
│   ├─ Idempotency (dup approve / mark-paid) ................ 🟢
│   ├─ Calendar advance (Regular only, invariant #4) ........ 🟢
│   └─ Cancel / abort ...................................... 🟡  BUG-007 (no abort post-approval)
│
├─ 8. PAYMENTS & OUTPUTS ..................................... 🟢 Deep
│   ├─ Bank payment file content (§19) ..................... 🟢
│   ├─ Payment actions / cash exclusion .................... 🟢
│   └─ Payslips (content + PDF) ............................ 🟢   |  some variants ........ 🟡
│
├─ 9. TAX CONFIGURATION ...................................... 🟡 Moderate  (2 High bugs here)
│   ├─ Statutory items read ................................ 🟢
│   ├─ Tier-1 rate edit → recalc → restore ................. 🟢
│   ├─ PAYE band editing ................................... 🔴  BUG-004 (un-saveable)
│   └─ Save via UI ........................................ 🔴  BUG-005 (POST vs PUT → 405)
│
├─ 10. TAX FORMS & COMPLIANCE ................................ 🟢 Deep
│   ├─ Forms generation per authority ..................... 🟢
│   └─ Audit trail (immutable) ............................ 🟢
│
├─ 11. REPORTS (8 reports) ................................... 🟡 Mostly verified
│   ├─ Payroll Summary / PAYE Recon / Statutory Remittance . 🟢  generate + data verified
│   ├─ Year-End Tax / Annual / Earnings&Ded / Config-History 🟢  generate verified
│   ├─ Export (PDF / Excel) ............................... 🟢
│   └─ Variance (2-period) / Audit (date-range) ........... 🔴  need report filter contract
│
└─ 12. DASHBOARD ............................................. 🟠 Light
    └─ Widgets ............................................ 🟠
```

## Coverage heat-map (rule-level checks per domain)

| Domain | Depth | PASS / FAIL / BLOCKED |
|---|---|---|
| Calculation engine (PAYE / STAX / Calc / CAL / bands) | 🟢 | ~119 / 0 / 2 |
| Pay-run lifecycle + payments + payslips | 🟢 | ~37 / 1 / 1 |
| Employees | 🟢 | 14 / 1 / 2 |
| Compensation catalog (Benefits / BIK / Deductions) | 🟢 | 22 / 0 / 7 |
| Tax forms / Compliance | 🟢 | 7 / 0 / 0 |
| Tax configuration | 🟡 | 16 / 3 / 3 |
| Security (admin-side) | 🟡 | 7 / 3 / 2 |
| Loans | 🟢 | create/affordability/repayment/BIK/balance all PASS |
| Reports | 🟡 | 8 reports + export PASS; Variance/Audit BLOCKED |
| Auth / Pay Groups / Dashboard | 🟡 / 🟠 | login-neg PASS; PG members blocked |
| **Total** | | **291 / 11 / 29** |

## How to read this map

- **The money math and the pay-run machine are the most thoroughly tested** (🟢) — everything monetary
  matched an independent oracle to the cent, and all four run types complete through their lifecycle.
- **Two red zones are real defects, not just untested:** Tax-config editing (BUG-004/005, both High) and
  Pay-group scoping (BUG-006).
- **Two red zones are access-gated, not failures:** Loans/Protected-Pay (need create-contracts) and Reports
  (client-side, need UI execution); Manager/Staff need credentials.
- **Headline:** 41% of admin-reachable requirements verified; 160/417 authored test cases executed (the
  engine's depth is understated by the case count since many oracle checks map to a few cases).

## What would move the needle

| To turn 🔴/🟡 → 🟢 | Need |
|---|---|
| Loans, Protected Pay, BIK monthly-cap | Their create-contracts (reverse-engineer or dev API collection) |
| Reports (8) | Drive the Reports UI (client-side rendering) |
| Manager / Staff permissions & self-service (~58 cases) | **Manager + Staff credentials** |
| Tax-config editing (red → green) | Dev fixes for **BUG-004 / BUG-005** |

## Related
[Executive Summary](03-executive-summary.md) · [Executive QA Report](05-executive-qa-report.md) ·
[Developer Hand-off](04-developer-handoff.md) · [Coverage Dashboard](../test-management/coverage-dashboard.md) ·
[Traceability Matrix](../requirements/01-traceability-matrix.md) · [Defects](../bugs/)
