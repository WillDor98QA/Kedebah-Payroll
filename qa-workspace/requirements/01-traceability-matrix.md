# Requirement Traceability Matrix (RTM)

Authoritative coverage tracker. Living document — extended as each phase produces artifacts.

**Chain:** PRD § → Requirement → Test Case(s) → Automation spec → Execution result → Bug(s)

> **Live execution status (auto-tracked):** rule-level execution now flows through
> `test-management/` (generated from `evidence/exec/records.ndjson`). See the
> [Coverage Dashboard](../test-management/coverage-dashboard.md),
> [Test Execution Report](../test-management/test-execution-report.md), and
> [Test Case Catalogue](../test-management/test-case-catalogue.md) for the live PASS/FAIL/BLOCKED per
> test case. **FINAL snapshot 2026-06-30 (recomputed 1:1 from the append-only ledger `evidence/exec/records.ndjson`):**
> **417/417 enumerated** · **Verified (PASS-sticky):** 225 PASS · 2 FAIL · 182 BLOCKED · 8 N/A = 417 · **Latest run:** 145 PASS ·
> **Terminal classification (engineering):** 225 PASS · 2 FAIL · 92 Missing-API-Contract · 47 Browser-only · 26 Credentials · 5 Infrastructure · 9 N/A · 11 residual-admin-automatable = **417** (406/417 = 97.4% terminal). ·
> Admin completion **78.9%** (225 ÷ 285 admin-reachable). Regular Payroll Harness added (`qa-factory.ts`). ·
> **Policy:** historical PASS never overwritten by a later BLOCKED; FAIL counts only when latest. ·
> 255/255 requirements have execution evidence · 10 defects (BUG-001..010). Final close-out: [reports/12-final-admin-completion-report.md](../reports/12-final-admin-completion-report.md).

### Requirements verified against the live app (2026-06-25)
| Requirement | Verified | Evidence |
|-------------|----------|----------|
| REQ-TAX-002 (statutory seed) | ✅ engines present (PASS); ⚠️ Tier1 ER 8% vs PRD 13% → **BUG-002** | statutory-items.json |
| REQ-PAYE-008/009 (PAYE + base) | ✅ == oracle to the cent | run-80 employees |
| REQ-STAX-001/002/003/004/005 (bonus + reconciliation §17) | ✅ all processed bonus runs == oracle to the cent (51 records) | bonus-run-*-emp.json |
| REQ-CAL-007/012/013 (gross/net/employer cost) | ✅ == oracle | run-80 employees |
| REQ-BIK-006 (BIK taxed not paid) | ✅ excluded from gross/net | run-80 employees |
| REQ-RELF-004 (SSF auto relief) | ✅ engine-consistent; ⚠️ incl. Tier3 vs PRD §11 → **BUG-003** | run-80 employees |
| REQ-TAX-001 (engine is data-driven — active edit→recalc→restore) | ✅ **PASS (active)**: edited Tier 1 EE 5.5→6% (PUT) → reprocess run #79 → engine recomputed 165→180 == oracle; restored 5.5% → config byte-identical to snapshot, run back to 165 | tier1-original.json |
| REQ-TAX-001/003 (edit PAYE bands → dated version) | ❌ **FAIL → BUG-004**: config rejects seeded contiguous bands (422); PAYE bands un-editable. Active edit NOT performed (can't restore exactly); bands verified unchanged | statutory-original-bands.json |
| REQ-TAX-003 (save statutory config via UI) | ❌ **FAIL → BUG-005**: UI POSTs to PUT-only `/config` → 405; save silently fails (engine itself honours config via PUT) | BUG-005.md |
| REQ-LIFE-001/007 (full lifecycle to PAID) | ✅ **PASS (active)**: off-cycle run #85 Draft→Processed→Pending→Approved→Paid; all illegal transitions blocked (422) | run #85 |
| REQ-PAYM-006 (cash excluded from bank file) | ✅ **PASS (active)**: "paid by cash — not included" skip reason | run #85 |
| REQ-CYCLE-008 (off-cycle no calendar advance, invariant #4) | ✅ **PASS (active)**: current period unchanged after Paid | run #85 |
| REQ-SLIP-001 (payslip on paid run) | ✅ **PASS (active)**: 200 by staff_id | run #85 |
| REQ-LIFE-008 (cancel) | ✅ **PASS (active)**: runs #82/#83/#84 cancelled | cleanup |
| REQ-LOAN-002/003 (loan BIK + repayment) | ✅ observed working | Khalifa (run-80) |
| REQ-AUTH-001 (login) | ✅ admin + multi-tenant select | screenshots |
| REQ-AUTH-008 / REQ-SEC-009 / REQ-SLIP-009 | ⏭️ BLOCKED (no Manager/Staff creds) | — |

### Additionally verified — all 4 run types, outputs, security, compliance (2026-06-26)
| Requirement | Verified | Evidence |
|-------------|----------|----------|
| REQ-RUN-001…009 (all 4 run types to terminal) | ✅ Off-cycle #85 / Regular #86 / Bonus #88 → PAID; Termination #89 → Approved | run records |
| REQ-CYCLE-007 (only Regular advances calendar, invariant #4) | ✅ Regular #86 advanced period 4→5; off-cycle did not | run #86 |
| REQ-PAYM-001…007 (bank file structure §19) | ✅ 14 cols, sorted by bank, TOTAL = exact sum, cash/incomplete skipped with reasons | bank file (run #86) |
| REQ-FORM-001…004 (forms per authority, -SUPP flag) | ✅ form code / period / due date / status / supplementary | forms |
| REQ-COMP-001…006 (immutable audit trail) | ✅ every mutation logged; PUT/DELETE → 405 (immutable) | audit logs |
| REQ-SEC-001/002/006 (injection, malformed input, multi-tenant isolation) | ✅ stored literally / 422 graceful / bogus tenant ignored | security checks |
| REQ-BANK-001…011 (CRUD + seed locks) | ✅ create/delete non-seeded; seeded protected; uniqueness 422 | bank records; ⚠️ **BUG-008** |
| REQ-SEC-003 (auth error handling) | ❌ **FAIL → BUG-009**: tampered token → HTTP 500 not 401 | BUG-009.md |
| REQ-PG-002 (pay-group member scoping) | ⚠️ **BUG-006**: empty group populated all active employees | run record |
| REQ-LIFE-008 (abort approved-unpaid run) | ⚠️ **BUG-007**: cancel/reject/return all 422 post-approval | run record |

### Additionally verified — employee-create & calc-application, Phase A/B (2026-06-27)
| Requirement | Verified | Evidence |
|-------------|----------|----------|
| REQ-EMP-001/014 (employee create + edit) | ✅ `POST /employees` (+ lookup-resources FK), edit salary | employee records |
| REQ-EMP-008 (Bank Transfer + account-name required) | ✅ create with bank/branch/account; missing account_name → 422 | employee records |
| REQ-EMP-010 (payment_method enum) | ❌ **FAIL → BUG-010**: API returns snake_case but rejects it on write (Title-Case only) | BUG-010.md |
| REQ-EMP-019 (complete/processable employee) | ✅ readiness gate (`process-validation`) → TIN was only gap; `PUT /employee-tax-profiles` → processes, PAYE == oracle | run record |
| REQ-EMP-018 (benefits/deductions in-effect resolution) | ✅ assigned + eligibility-based items resolved together | benefits-in-effect |
| REQ-CAL-002 (PAYE progressive bands, full table) | ✅ basics 900 / 8000 / 60000 → PAYE == oracle (low/mid/high bands) | run records |
| REQ-CAT-002/003 (benefit Fixed + %-of-Basic applied) | ✅ fixed 500, %-basic 300 == oracle | run records |
| REQ-CAT-006 (BIK taxed in chargeable, excluded from gross) | ✅ total_bik 400 in chargeable, gross unchanged | run record |
| REQ-CAT-004 (before-tax deduction reduces chargeable) | ✅ 300 → chargeable 3335→3035, PAYE recomputed == oracle | run record |
| REQ-CAT-005 (after-tax + %-of-net deduction reduce net only) | ✅ after-tax 200; %-net = 10% of (gross−statutory) | run records |
| REQ-PAY-013 (readiness gate blocks incomplete employee) | ✅ process → 422 "incomplete payroll details"; gross stays 0 | process-validation |

## Status legend
- **REQ** defined ✅ (Phase 2 complete)
- **TC** test cases written (Phase 5)
- **AUT** automated (Phase 6)
- **EXE** executed (Phase 7)
- **Result:** Pass / Fail / Blocked / Gap-verified / Not-run

## Module-level coverage (current)

**Phase 5 complete:** 417 test cases across all modules. TC = ✅ (written), AUT/EXE pending
(AUT scaffold = Phase 6; EXE = needs app). TC file links in `test-cases/<folder>/`.

| Module | PRD § | Reqs | TCs | TC file | AUT | EXE | Notes |
|--------|-------|------|-----|---------|-----|-----|-------|
| AUTH | §2 | REQ-AUTH-001…011 | TC-AUTH-001…019 (22) | Authentication/ | ⏳ | ⏳ | Security-critical: API enforcement (AUTH-010). |
| CYCLE | §4 | REQ-CYCLE-001…015 | TC-CYCLE-001…020 (22) | Payroll/pay-calendar | ⏳ | ⏳ | Calendar advance invariant. |
| PG | §5 | REQ-PG-001…006 | TC-PG-001…012 (12) | Pay Groups/ | ⏳ | ⏳ | Layered resolution. |
| BANK | §6 | REQ-BANK-001…011 | TC-BANK-001…016 (16) | Payroll/Setup-bank-setup | ⏳ | ⏳ | System-record locks; guards. |
| CAT | §7 | REQ-CAT-001…015 | TC-BEN/DED (30) | Benefits/, Deductions/ | ⏳ | ⏳ | Calc-method correctness. |
| BIK | §8 | REQ-BIK-001…008 | TC-BIK-001…016 (18) | Benefits/ | ⏳ | ⏳ | Pipeline position; not-paid invariant. |
| PROT | §9 | REQ-PROT-001…009 | TC-PROT-001…012 (14) | Deductions/ | ⏳ | ⏳ | Statutory-never-trim; carryover gap. |
| TAX | §10 | REQ-TAX-001…013 | TC-TAX-001…019 (21) | Tax/ | ⏳ | ⏳ | Seed verification; no-fallback blocker. |
| RELF | §11 | REQ-RELF-001…006 | TC-RELF-001…008 (9) | Tax/ | ⏳ | ⏳ | Reliefs-first ordering. |
| LOAN | §12 | REQ-LOAN-001…009 | TC-LOAN-001…016 (16) | Loans/ | ⏳ | ⏳ | Drafts-must-not-decrement invariant. |
| EMP | §13 | REQ-EMP-001…021 | TC-EMP-001…034 (37) | Employees/ | ⏳ | ⏳ | Payment validation; readiness; gaps. |
| CAL | §14 | REQ-CAL-001…016 | TC-CAL-001…024 (29) | Payroll/calculation-engine | ⏳ | ⏳ | 13-step pipeline; money-critical. |
| RUN | §15 | REQ-RUN-001…009 | TC-RUN-001…022 (23) | Payroll/run-types | ⏳ | ⏳ | Inclusion contracts. |
| LIFE | §16 | REQ-LIFE-001…009 | TC-LIFE-001…020 (21) | Payroll/lifecycle-and-approval | ⏳ | ⏳ | Lifecycle; on-approve side effects. |
| STAX | §17 | REQ-STAX-001…013 | TC-STAX-001…023 (26) | Payroll/special-tax-engines | ⏳ | ⏳ | Bonus reconciliation invariant. |
| PAYE | §10/§24 | REQ-PAYE-001…010 | TC-PAYE-001…017 (19) | Payroll/paye-bands | ⏳ | ⏳ | Band boundary math. |
| ALRT | §18 | REQ-ALRT-001…014 | TC-ALRT-001…016 (17) | Payroll/alerts-and-validation | ⏳ | ⏳ | Hard/soft routing. |
| PAYM | §19 | REQ-PAYM-001…015 | TC-PAYM-001…018 (19) | Payroll/payments-disbursement | ⏳ | ⏳ | Bank-file structure/sort/exclusions. |
| FORM | §20 | REQ-FORM-001…009 | TC-FORM-001…012 (14) | Payroll/taxes-forms-filings | ⏳ | ⏳ | One-form-per-period; -SUPP guard. |
| SLIP | §21 | REQ-SLIP-001…010 | TC-SLIP-001…016 (18) | Payroll/payslips | ⏳ | ⏳ | Snapshot-based; BIK-excluded. |
| RPT | §22 | REQ-RPT-001…011 | TC-RPT-001…015 (15) | Reports/ | ⏳ | ⏳ | 8 reports × PDF/Excel. |
| COMP | §23 | REQ-COMP-001…007 | TC-COMP-001…010 (11) | Compliance/ | ⏳ | ⏳ | Immutable dual audit trail. |
| SEC | §2/SEC | REQ-SEC-001…010 | TC-SEC-001…018 (18) | Security/ | ⏳ | ⏳ | Authz, injection, XSS, idempotency, scope. |
| SETUP | §3 | REQ-SETUP-001…002 | (covered via TAX/EMP) | — | ⏳ | ⏳ | Ordered config workflow. |
| DASH | — | REQ-DASH-001 | TC-DASH-001…005 (5) | Dashboard/ | ⏳ | ⏳ | **Scope unconfirmed (open question #2).** |

**Totals:** ~260 requirements · **417 test cases** · automation + execution pending.

## Documented gaps (verify-only — assert PRD §25 behaviour, NOT functionality)

| Req | Gap | Expected test outcome |
|-----|-----|----------------------|
| REQ-PROT-008 | Carryover auto-recovery | Confirm NOT auto-recovered |
| REQ-EMP-014 | Mid-cycle proration | Confirm UI warns, engine pays full period |
| REQ-EMP-017 | Cost Center tab | Confirm nothing persisted |
| REQ-EMP-019 | Payroll Overrides tab | Confirm nothing persisted |
| REQ-LIFE-006 | Journal posting | Confirm flag logged, no Finance posting |
| REQ-LOAN-009 | Loans submenu | Confirm preview only |
| REQ-STAX-012 | Overtime entry screen | Confirm API-only, no UI |
| REQ-PAYM-008 | Skip reasons in modal | Confirm not shown in UI |
| REQ-PAYM-015 | Payments submenu | Confirm previews only |
| REQ-SLIP-010 | This-app My Payslips | Confirm placeholder |
| REQ-RPT-009/011 | Reports gaps | Confirm redirect/preview/unimplemented |
| REQ-COMP-007 | Self-service pages | Confirm placeholders |

## High-risk invariants to assert explicitly (must never break)

1. **No untaxed pay** — `missing_income_tax_engine` hard-blocks (REQ-TAX-005, SETUP-002).
2. **Statutory never trimmed** by protected pay (REQ-PROT-005).
3. **Drafts never move money** — loan balances only on Mark Paid (REQ-LOAN-005).
4. **Only Regular runs advance the calendar** (REQ-CYCLE-007/008, RUN-009).
5. **Bonus reconciliation** — regular PAYE + bonus marginal = single-pass total (REQ-STAX-005).
6. **BIK taxed, never paid** — excluded from net + payslip earnings (REQ-BIK-006, SLIP-005).
7. **Filed forms never silently mutated** — locked bucket → -SUPP (REQ-FORM-004).
8. **API is the security boundary** — permission enforced server-side regardless of UI (REQ-AUTH-010, SEC-001).
9. **Negative net = error**, not paid (REQ-CAL-012, ALRT-004).
10. **Self-service scope isolation** — no cross-employee payslip access (REQ-SEC-009).
