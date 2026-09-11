# Beta — Phase 1: Pay-Run Lifecycle & Calculation Validation

> 2026-09-08 · Business **Glenn and Co**. 26 ledger entries (`evidence/beta/ledger.ndjson`) — **21 PASS · 3 FAIL (candidate) · 2 NOTE**. Evidence: `evidence/beta/*.png`, payslip + bank-doc PDFs.

## 1. Headline results

### 1a. The SSNIT rate question — **RESOLVED**
The beta app deducts **5.5% employee / 13% employer** SSNIT — the `calc-oracle` (5.5%) is correct; the prior environment's observed 5% does **not** reproduce on beta. Confirmed by a real pay run against a clean GH₵3,000 employee: employee SSNIT 165.00 = 5.5%, employer 390.00 = 13%.

### 1b. Calculation engine — **validated to the cent**
Independent oracle vs beta app, pay run #1 (Sep 2026):

| Check | Oracle | Beta | ✓ |
|---|---|---|---|
| ZZQA (3,000 basic, no benefits) — employee statutory (PAYE + SSNIT) | 551.88 | 551.88 | ✅ |
| ZZQA — PAYE (chargeable 2,835, bands 0/5/10/17.5%) | 386.88 | 386.88 | ✅ |
| ZZQA — net pay | 2,448.12 | 2,448.12 | ✅ |
| TaShya (5,000 basic + 500 BIK) — employee statutory | 1,179.75 | 1,179.75 | ✅ |
| TaShya — cash net (BIK not paid in cash) | 3,820.25 | 3,820.25 | ✅ |
| Run — employer pension/SSNIT (13% × 8,000) | 1,040.00 | 1,040.00 | ✅ |
| PAYE band table on payslip (490@0 / 110@5% / 130@10% / 2,105@17.5%) | 0 / 5.50 / 13.00 / 368.38 | identical | ✅ |
| 3-tier split: Tier1 EE 5.5%, Tier1 ER 8%, Tier2 ER 5% | 165 / 240 / 150 per GH₵3k | identical | ✅ |
| Tax liabilities generated (PAYE due 15th, SSNIT due 14th) | 1,291.63 / 440 / 640 / 400 | identical | ✅ |

BIK is correctly taxed (added to chargeable income) but excluded from cash net **and** from the SSNIT base. Ghana PAYE 7-band engine, SSNIT relief on chargeable income, and statutory remittance dates are all correct.

### 1c. Full lifecycle — **PASS**
Draft → Processed → Pending Approval → Approved → **Paid**, every gate enforced:
- Process computes all figures; hidden until processed.
- Approve is **blocked** until tax-safeguard soft warnings are acknowledged **on the approval page**.
- Finance journal preview is **balanced** (Dr 9,040 = Cr 9,040) with a correct double-entry split.
- Mark-as-Paid requires payment confirmation (date, method); optional pay-stub notification; optional payment documents.
- Paid run is **locked** — no further Process/Recalculate/Submit/Approve actions (**PRQ-015 ✅**).
- Paid run appears in Payroll History with status Paid.

## 2. PRQ coverage this phase

| PRQ | Feature | Verdict | Notes |
|---|---|---|---|
| **PRQ-001** | File upload on Mark-as-Paid + history | **PASS** | "Add Document" at Mark-as-Paid; PDF accepted; persists on the paid run as "Payment Documents" with download / delete / add-later. Helper: PDF/Word/Excel, 10MB each. |
| **PRQ-011** | Payslip download (individual) | **PASS** (1 minor gap) | Per-employee "Download Payslip" → PDF with employer identity+address, employee identity, earnings/deductions, gross/net, **reference PS-2026-09-00001-0003**, period, amount-in-words, "computer-generated" note. In-app payslip modal also shows a full band-by-band PAYE derivation + EE/ER tier split. **Gap:** the PDF omits employer SSNIT (BETA-F-006). Bulk ZIP download not yet tested. |
| **PRQ-015** | Payroll lock after approval | **PASS** | Paid run has no mutating actions. Unlock path not yet tested. |
| **PRQ-008 / dashboard note** | Employer cost by tier / cost summary | partial | Dashboard "Employer Cost by Tier" + payslip both show gross cash + employer Tier1/2/3 — consistent with the BTL review note. Full dashboard re-check pending a populated period. |
| PRQ-009 (config) | Penalties | PASS (config) | Tiered % penalty rule present; fixed-amount option and auto-apply not yet exercised. |
| PRQ-014 (adjacent) | Statutory schedules | partial | Tax liabilities auto-generated with correct Ghana due dates; bank/GRA/SSNIT **export files** not yet generated. |

## 3. Candidate findings

| ID | Severity | Finding | Evidence |
|---|---|---|---|
| **BETA-F-001** | **Major** | 3 mandatory/automatic statutory items — Overtime Tax (Junior), Pension Excess, Tier 3 — show **"No active rate"** on a tenant the setup wizard reports as "payroll setup completed". Payroll can be (and was) run in this state; overtime / pension-excess / Tier-3 would silently compute at 0%. Not exercised in this run (no overtime/bonus), so real impact unconfirmed — needs a targeted overtime/bonus run. | `07-statutory-items.png` |
| **BETA-F-002** | **Major** | Every module/settings page renders skeleton loaders for **8–30 s** on cold load (Tax & Statutory ~30 s; approval page ~15 s). Consistent, reproducible. | all screenshots |
| **BETA-F-003** | **Major** | Bootstrap-Icons + RemixIcon web fonts **fail to load app-wide** (`OTS parsing error: invalid sfntVersion`, `Failed to decode downloaded font` — woff/woff2/ttf). ~100 font errors per session. Nav icons, button glyphs and status icons render blank; many icon-only controls have **no accessible name**. | `console-warnings.log` |
| **BETA-F-006** | Minor | Downloaded payslip **PDF** omits the employer SSNIT contribution (the in-app payslip modal shows it as "+240 employer / +150 employer"). PRQ-011 AC calls for employer SSNIT on the payslip. | `payslip-zzqa-001-*.pdf` vs `37-*.png` |
| **BETA-F-004** | Minor | Tier 1 config detail panel exposes only the combined 13.5%, not the EE/ER split — an admin can't verify statutory correctness from Settings (the payslip does show it). | `07-statutory-items.png` |
| **BETA-SEC-001** | NOTE (to test) | Payment-document download URL is a predictable tenant-scoped path (`/tenant/glenn_and_co/3/<filename>`). Must verify it rejects unauthenticated / cross-tenant access (IDOR). | `35-paid-run-view.png` |
| **BETA-F-005** | Trivial | `main-*.css` / `app-*.css` preloaded but "not used within a few seconds" — preload misconfig. | `console-warnings.log` |

Positive UX note: soft warnings (Missing TIN) are surfaced as **acknowledgeable** items, never hard blockers; the finance journal preview and the payslip band-by-band breakdown are genuinely good transparency features.

## 4. Test data created on beta (Glenn and Co)

- **Employee #3 — "ZZQA AlphaOne"** (ZZQA-001): Full-time, GH₵3,000/mo, Cash, no benefits/deductions. QA fixture — leave in place for regression, or deactivate on teardown.
- **Pay run #1 — "Regular Payroll - September 2026"**: period Sep 1–30, pay date Sep 30, **status Paid** (Sep 8). 2 employees (ZZQA + TaShya). Net GH₵6,268.37. This **advanced the pay calendar to September** on this tenant.
- 1 payment document attached (`zzqa-bank-confirmation.pdf`).
- 4 pending tax liabilities generated.

## 5. Next

1. **Bonus run (PRQ-012)** + **combined regular+bonus (PRQ-013)** — also exercises Bonus Tax (5%) and, if an employee has overtime, tests BETA-F-001's real impact.
2. **Bank / GRA-PAYE / SSNIT export files (PRQ-014)** — from the paid run and/or tax liabilities.
3. **Bulk salary update (PRQ-016)**, **budgets (PRQ-007)**, **employee summary dashboard (PRQ-008)** on the now-populated period.
4. **Benefits model (BTL items 4–7)** — create a benefit, assign to an employee, confirm it appears + applies; per-employee amount override; bulk benefit adjustment; BIK seeding.
5. **BETA-SEC-001** — unauthenticated fetch of the payment-doc URL.
6. Remaining statutory tabs (Eligibility, Reliefs, Filing, Voluntary Schemes, Authorities) + the 4 other "Completed" setup cards.
7. Payslip **bulk ZIP** (PRQ-011) + **unlock path** (PRQ-015).
