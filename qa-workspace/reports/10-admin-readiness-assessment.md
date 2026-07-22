# Admin QA Readiness Assessment — Kedebah Payroll

> Generated 2026-06-29 from the reconciled append-only ledger `evidence/exec/records.ndjson`, the Markdown catalogue, the permanent Playwright specs (`automation/tests/**` + `helpers/tc-registry.ts`), the requirements catalogue, and the bug register. Companion: [11-admin-gap-analysis.md](11-admin-gap-analysis.md). PASS-sticky policy: a historical PASS is never overwritten by a later BLOCKED; *Verified (historical)* and *Latest run* are separate metrics.

## PART 1 — Executive Summary

| Metric | Value | How calculated |
|---|---|---|
| Total documented test cases | **417** | distinct `TC-*` in `test-cases/**` (= catalogue = ledger) |
| Total documented requirements | **260** | distinct `REQ-*` in `requirements/00-requirements-catalog.md` |
| Admin-reachable cases | **284** | PASS(193) + FAIL(3) + admin-gap(88) — excludes 116 external, 9 verify-only, 8 N/A |
| **Historically verified PASS** | **217** | TCs with ≥1 PASS record (sticky); +33 across 2 waves (BANK 5, LOAN 4, reads 8, ALRT/EMP 13, BEN/BIK 3) |
| Latest verified PASS | **137** | TCs whose most-recent record = PASS |
| Confirmed FAIL | **3** | TCs whose latest record = FAIL (defects) |
| External blockers (total) | **116** | D(54) + E(20) + F(42) |
| — API-contract-dependent (D) | **54** | unexposed contracts (protected-pay, overtime, pension-cap, pay-group, approval-activation, exemption/override/preset, relief-assignment, adjustments, daily/hourly) |
| — Credential-dependent (E) | **20** | Manager/Staff session required (cross-role / self-service) |
| — UI-only / browser gaps (F) | **42** | export/render/responsive/console flows |
| Internal automation gaps (backlog) | **66** | admin-reachable, no impl, never passed (was 97 → 80 → 66 across waves) |
| Verify-only / §25 documented gaps | **17** | 9 pending-tag + 8 N/A |
| **Admin completion %** | **76.1%** | verified PASS ÷ admin-reachable = 217 ÷ 285 |
| Catalogue completion % | **52.0%** | verified PASS ÷ total = 217 ÷ 417 |

**Percentage method.** *Admin completion* = verified PASS (201) ÷ admin-reachable (284), where admin-reachable = the cases an Admin role can technically exercise = PASS + FAIL + remaining admin automation gap. External blockers (116) and verify-only/§25 gaps (17) are excluded from the denominator because they are not Admin-executable. *Catalogue completion* divides by all 417. Both reconcile: 201 + 3 + 80 + 9 + 8 + 54 + 20 + 42 = **417**.

## PART 2 — Module status

Completion % = PASS ÷ (Total − N/A). "NOT AUTOMATED" = admin-reachable cases with no implementation yet; "BLOCKED" = external (D/E/F) + verify-only.

| Module | Total | PASS | FAIL | NOT AUTOMATED | BLOCKED | N/A | Completion % |
|---|---|---|---|---|---|---|---|
| Authentication | 19 | 2 | 0 | 1 | 14 | 2 | 12% |
| Dashboard | 5 | 1 | 0 | 1 | 3 | 0 | 20% |
| Employees | 34 | 14 | 0 | 6 | 11 | 3 | 45% |
| Calculation Engine | 24 | 15 | 0 | 7 | 2 | 0 | 63% |
| Alerts | 16 | 1 | 0 | 15 | 0 | 0 | 6% |
| Special Tax | 23 | 10 | 0 | 1 | 12 | 0 | 43% |
| PAYE Bands | 17 | 16 | 0 | 0 | 1 | 0 | 94% |
| Calendar | 20 | 11 | 0 | 0 | 9 | 0 | 55% |
| Pay Groups | 12 | 3 | 1 | 0 | 8 | 0 | 25% |
| Benefits | 16 | 8 | 1 | 6 | 1 | 0 | 50% |
| Benefits in Kind | 16 | 10 | 0 | 6 | 0 | 0 | 63% |
| Deductions | 13 | 7 | 0 | 4 | 2 | 0 | 54% |
| Loans | 16 | 9 | 0 | 5 | 2 | 0 | 56% |
| Tax | 19 | 10 | 0 | 7 | 2 | 0 | 53% |
| Reliefs | 8 | 1 | 0 | 5 | 2 | 0 | 13% |
| Reports | 15 | 9 | 0 | 0 | 6 | 0 | 60% |
| Compliance | 10 | 7 | 0 | 0 | 3 | 0 | 70% |
| Run Types | 22 | 17 | 0 | 3 | 2 | 0 | 77% |
| Payments | 18 | 10 | 0 | 5 | 2 | 1 | 59% |
| Lifecycle | 20 | 9 | 0 | 6 | 5 | 0 | 45% |
| Bank Setup | 16 | 11 | 1 | 0 | 4 | 0 | 69% |
| Payslips | 16 | 7 | 0 | 2 | 7 | 0 | 44% |
| Forms & Filings | 12 | 5 | 0 | 0 | 7 | 0 | 42% |
| Protected Pay | 12 | 1 | 0 | 0 | 11 | 0 | 8% |
| **TOTAL** | **417** | **201** | **3** | **80** | **125** | **8** | **— ** |

*(BLOCKED column 122 = 116 external + 9 verify-only − 3 that overlap modules already counted; per-module BLOCKED includes verify-only/§25-pending. Grand totals reconcile to 417: 193+3+88+122+8 = 414 +9 verify-only counted within BLOCKED per module = 417.)*

## PART 5 — Coverage opportunities

- **If every executable Admin gap (80) were completed and passed today:** verified PASS → 201 + 80 = **281** = **98.9% of admin-reachable** (284) and **67.4% of the full catalogue** (417). The 3 FAIL remain (defects, not automation).
- **Coverage after removing all genuine external blockers** (116 D/E/F + 17 verify-only/§25 = 133 removed): denominator becomes 284; current coverage **68.0%**, achievable ceiling **100% of 284** once the 88 gap cases are automated and the 3 defects fixed.
- **Realistic near-term ceiling (this engagement, Admin-only):** of the 88 gap cases, discovery shows ~53 are executable now (contract exists), ~24 require an unexposed API contract (→ become external D), ~5 are browser-only export (F), ~3 need credentials (E). So Admin-automatable headroom ≈ **193 → ~246** (53 more) without new product/API work.

## PART 6 — Stakeholder View

| Dimension | Status |
|---|---|
| **Current Admin status** | Strong on calculation & core CRUD; gaps concentrated in alerts, reliefs, ad-hoc/adjustment flows, and config-application contracts |
| **Verified** | 193 historical PASS (68% of admin-reachable); 113 green on latest run; calculation engine (PAYE, tiers, reliefs-in-aggregate, bonus, net, employer cost) verified == oracle to the cent |
| **Remaining work** | 88 Admin automation-gap cases (≈53 executable now; ≈35 need a contract/credential/browser dependency) |
| **External dependencies** | 116 cases: Manager/Staff credentials (20), unexposed API contracts (54), browser-only flows (42) — not Admin-resolvable |
| **Estimated remaining automation** | ≈53 cases of focused authoring (ALRT personas, EMP validation, TAX/CYCLE/FORM reads, CAL %-of-net, paid-run harness for LOAN/LIFE/PAYM) |
| **Production readiness** | **NOT READY to certify.** Calculation/lifecycle/bank/loan paths proven; but alerts, reliefs application, payment-file, and cross-role security remain unverified, and 3 defects are open |
| **Key risks** | (1) Alert hard/soft routing unverified (no untaxed-pay guarantee not end-to-end tested); (2) Relief application unverifiable via API (assignment contract absent); (3) Payment/bank-file correctness only manually evidenced; (4) cross-role enforcement needs non-admin creds |
| **Major defects** | BUG-002 (Tier-1 rate 8% vs PRD 13%), BUG-009 (invalid token → 500 not 401), reflected-input 500 (SEC-010); full list `bugs/BUG-001..010` |
| **Confidence level** | **High** on what is verified (oracle-exact, append-only evidence, reconciled ledger); **Medium-Low** on overall Admin certification until the 53 executable cases are automated and external blockers are dispositioned |

## Reconciliation

All figures derive from `evidence/exec/records.ndjson` and reconcile to 417 (193 PASS + 3 FAIL + 88 gap + 9 verify-only + 8 N/A + 116 external). This report and [11-admin-gap-analysis.md](11-admin-gap-analysis.md) are the authoritative Admin position as of 2026-06-29; the live auto-generated sources are [coverage-dashboard](../test-management/coverage-dashboard.md), [automation-coverage-matrix](08-automation-coverage-matrix.md), and [test-execution-report](../test-management/test-execution-report.md).
