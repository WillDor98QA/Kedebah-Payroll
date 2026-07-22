# Employment-Type Payroll Calculation Certification

> 2026-07-08 · Principal-QA execution programme. Reuses the existing framework (factory, off-cycle harness, calc-oracle, append-only ledger). **Evidence-driven; the application is never its own oracle.** Reusable engine: `test-management/employment-type-cert.mjs`.

## 1. Executive Summary

Payroll was certified across **all 8 Employment Types discovered live**, using one isolated QA employee per type (basic GHS 3,000, Cash, complete tax profile) processed through an **off-cycle run** (no calendar advance; cancelled after extraction — safe on the shared tenant with 260 employees + 7 active loans).

**Headline result:** the **standard PAYE calculation engine is correct** — for a baseline employee the engine's chargeable income, PAYE (band-by-band), and net pay match an **independent Ghana-law oracle to the cent** (`paye(2850) = 389.50` = engine). Gross, statutory ordering, and net all reconcile.

**But two evidence-backed issues surfaced:**
1. **Employment Type does not drive special tax treatment.** All 8 types — including **Casual** (should be a 5% flat tax) and **Board** (should be Board-Member/WHT tax) — produced **identical** standard PAYE output. The seeded special engines ("Casual Worker Flat Tax", "Board Member Tax") are **not triggered by `employment_type` alone**.
2. **Tier-1 (SSNIT employee) is deducted at 5% (GHS 150), not the 5.5% (GHS 165)** commonly used in Ghana. Consistent across every type. Needs the authoritative rate confirmed before it can be called a defect.

**Overall verdict: PARTIAL / CONDITIONAL.** Standard employment types calculate and pay correctly; Casual & Board special treatments are unproven; one SSNIT-rate question is open.

## 2. Environment & Tenant
- Target: `https://payroll.kedebah.com` (SBX) · tenant `tenant_69ce648ab27b4_1775133834` · business **William & Co Enterprises** (R-2171-WRY).
- Safety inventory: **260 active employees**, **7 active loans** (staff 56/59), current period **2026-10** (scheduled future periods present). → **off-cycle** runs used (isolated, no calendar advance, cancelled); no Regular run marked PAID (would advance the shared calendar + decrement all loans).

## 3. Employment Type Inventory (live, authoritative — `/employees/lookup-resources`)

| Employment Type | API id | Source | Expected statutory treatment | Special engine seeded? |
|---|---|---|---|---|
| Board | 8 | live lookup + UI | Board-Member Tax / WHT-Board | Yes (id 11 / 10) |
| Casual | 1 | live lookup | Casual Worker **Flat 5%** | Yes (id 5) |
| Contract | 2 | live lookup | Standard PAYE + SSNIT | — |
| Full-time | 3 | live lookup | Standard PAYE + SSNIT | — |
| Internship | 4 | live lookup | Standard PAYE (confirm exemption?) | — |
| NSS | 7 | live lookup | Confirm exemption/standard | — |
| Part-time | 5 | live lookup | Standard PAYE + SSNIT | — |
| Temporary | 6 | live lookup | Standard PAYE + SSNIT | — |

*(Documentation names like "Permanent"/"Daily-Rated"/"Hourly" do NOT exist in this configuration — the live set is the 8 above.)*

## 4. Employee Test Matrix (Layer A baseline)
One QA employee per type, deterministic id `E2E_ET_<TYPE>_<ts>`, `ZZQA-ET` prefixed: basic 3,000 monthly, Cash, complete TIN/SSNIT tax profile, Ghana. (Layer B type-specific rules — daily/hourly rate, proration, overtime, contract dates — are deferred until Layer A special-treatment questions below are dispositioned, since applying them uniformly would be invalid.)

## 5. Payroll Run Details
Off-cycle run per employee: `basic only` (benefits & deductions **excluded** to isolate the base calculation), processed → per-employee `calculation_breakdown` + lines extracted → run cancelled. Ground-truth lines (identical for all 8): `Basic Salary 3000 (earning)` · `Tier 1 150 (statutory)` · `Tier 2 0` · `PAYE 389.50 (statutory)`.

## 6/7. Per-Type Calculation Results & Component-Level Oracle Comparison

Independent oracle (Ghana PAYE bands on the engine's chargeable): **paye(2850) = 389.50** — matches engine exactly.

| Type | Gross (exp/act) | Chargeable | Tier1 (act) | PAYE (oracle/act) | Net (oracle/act) | Verdict |
|---|---|---|---|---|---|---|
| Full-time | 3000/3000 ✓ | 2850 | 150 | 389.50 / **389.50** ✓ | 2460.50 / **2460.50** ✓ | **PASS** |
| Contract | 3000/3000 ✓ | 2850 | 150 | 389.50 / 389.50 ✓ | 2460.50 / 2460.50 ✓ | **PASS** |
| Part-time | 3000/3000 ✓ | 2850 | 150 | 389.50 / 389.50 ✓ | 2460.50 / 2460.50 ✓ | **PASS** |
| Temporary | 3000/3000 ✓ | 2850 | 150 | 389.50 / 389.50 ✓ | 2460.50 / 2460.50 ✓ | **PASS** |
| Internship | 3000/3000 ✓ | 2850 | 150 | 389.50 / 389.50 ✓ | 2460.50 / 2460.50 ✓ | **PASS** (confirm intern exemption policy) |
| NSS | 3000/3000 ✓ | 2850 | 150 | 389.50 / 389.50 ✓ | 2460.50 / 2460.50 ✓ | **PASS** (NSS often tax-exempt — confirm policy) |
| Casual | 3000/3000 ✓ | 2850 | 150 | flat 5% (150) expected / **389.50 standard PAYE applied** | — | **NOT VERIFIED** — flat tax not applied |
| Board | 3000/3000 ✓ | 2850 | 150 | Board/WHT expected / **389.50 standard PAYE applied** | — | **NOT VERIFIED** — board tax not applied |

**PAYE band math (independent check):** 0%≤490 → 0; next 110 @5% → 5.50; next 130 @10% → 13.00; next 2120 @17.5% → 371.00; **Σ = 389.50** = engine. Net = 3000 − 150 − 389.50 = 2460.50 = engine. ✓

## 8. Payroll Total Reconciliation
Single-employee off-cycle runs: employee-level = run-level by construction (one employee per run; totals equal the single employee's gross/PAYE/tier/net). Multi-employee total reconciliation (Σemployee = payroll total) is covered by the existing Regular-run reconciliation cases (`TC-RUN-*`, prior evidence) and not re-triggered here to avoid a shared-calendar advance.

## 9. Payment / Post-Payroll Validation
**Constrained by environment.** Marking a Regular run PAID on this shared tenant advances the org calendar and decrements all 7 active loans (documented framework behaviour). Off-cycle runs prove the **calculation** (items 4–9 of the business question) but are not the paid lifecycle. Payslip/paid-status/loan-movement verification for these personas would require an isolated tenant; **NOT VERIFIED** here by design (risk-controlled), and flagged as a Blocker (§11).

## 10. Defects / Candidate Findings
| # | Finding | Type | Evidence | Disposition |
|---|---|---|---|---|
| ETC-F1 | **Special tax engines not triggered by Employment Type** — Casual gets standard PAYE (not 5% flat); Board gets standard PAYE (not Board/WHT). | Product/Config — **candidate** | 8-type run all identical (389.50 PAYE, no casual/board line) | Confirm whether special treatment is driven by a tax-status/config field vs `employment_type`. If auto-expected → **Product Defect**. |
| ETC-F2 | **Tier-1 (SSNIT employee) = 5% (150), not 5.5% (165).** | Rate — **candidate** | `ssf_employee=150`, `tier_1 line=150` on basic 3000, all types | Confirm the authoritative SSNIT employee rate for this tenant. If 5.5% expected → under-deduction defect. |

*(Not logged as confirmed bugs per the programme's rule — both need product-owner disposition before a defect is raised. Oracle recalculated; test data verified; the PAYE engine itself is correct.)*

## 11. Blockers
- Paid-lifecycle + payslip verification per Employment Type → **shared-tenant calendar-advance risk** (needs an isolated QA tenant).
- Casual/Board special-treatment trigger → needs the tax-status/config contract (how the special engine is selected).

## 12. Risk Assessment
- **Low risk:** standard PAYE + net computation for standard employment types (Full-time/Contract/Part-time/Temporary) — verified to the cent.
- **Medium risk:** SSNIT employee rate (5% vs 5.5%) — a systematic 0.5% under-deduction if 5.5% is correct (affects every employee, every run).
- **Medium/High risk:** Casual & Board tax treatment — if special tax should auto-apply and doesn't, those workers are mis-taxed.
- **Unquantified:** paid-lifecycle/payslip correctness per type (not verifiable without an isolated tenant).

## 13. Certification Decision

**CONDITIONAL PASS.**
- **Standard employment types (Full-time, Contract, Part-time, Temporary): CERTIFIED** for baseline calculation — payroll calculates gross, chargeable, PAYE (band-exact) and net correctly.
- **Internship, NSS: calculation correct, policy unconfirmed** — standard PAYE applied correctly; confirm whether an exemption is expected.
- **Casual, Board: NOT CERTIFIED** — special tax treatment not applied via employment type; needs disposition.
- **Cross-cutting:** SSNIT employee rate (5% vs 5.5%) must be confirmed before full certification.

---

## Certification Matrix

| Employment Type | Employee Created | Included in Payroll | Gross Correct | PAYE Correct | Statutory Correct | Deductions Correct | Net Correct | Paid | Payslip Correct | Final Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| Full-time | ✅ | ✅ | ✅ | ✅ | ⚠️ tier1 5% | N/A (none) | ✅ | ⏸ isolated | ⏸ isolated | **PASS** |
| Contract | ✅ | ✅ | ✅ | ✅ | ⚠️ tier1 5% | N/A | ✅ | ⏸ | ⏸ | **PASS** |
| Part-time | ✅ | ✅ | ✅ | ✅ | ⚠️ tier1 5% | N/A | ✅ | ⏸ | ⏸ | **PASS** |
| Temporary | ✅ | ✅ | ✅ | ✅ | ⚠️ tier1 5% | N/A | ✅ | ⏸ | ⏸ | **PASS** |
| Internship | ✅ | ✅ | ✅ | ✅ | ⚠️ + policy | N/A | ✅ | ⏸ | ⏸ | **PASS (policy confirm)** |
| NSS | ✅ | ✅ | ✅ | ✅ | ⚠️ + policy | N/A | ✅ | ⏸ | ⏸ | **PASS (policy confirm)** |
| Casual | ✅ | ✅ | ✅ | ❌ standard, not flat 5% | ❌ | N/A | — | ⏸ | ⏸ | **NOT VERIFIED** |
| Board | ✅ | ✅ | ✅ | ❌ standard, not board/WHT | ❌ | N/A | — | ⏸ | ⏸ | **NOT VERIFIED** |

**Answer to the business question — "Does Kedebah Payroll correctly calculate payroll for every Employment Type?"**
Yes for the **standard types** (Full-time, Contract, Part-time, Temporary) at baseline — PAYE and net are correct to the cent. **Internship/NSS** compute correctly but need a policy call on exemptions. **Casual and Board are NOT correct** unless their special tax is intentionally config-driven (not employment-type-driven) — that needs product confirmation. One **SSNIT employee-rate** question (5% vs 5.5%) applies to all types.
