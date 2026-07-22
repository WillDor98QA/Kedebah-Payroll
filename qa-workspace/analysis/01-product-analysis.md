# Phase 1 — Product Analysis

**Product:** Kedebah Payroll — Complete Payroll & Statutory Compliance System (Ghana-localised)
**Source of truth:** `qa-workspace/docs/PAYROLL_COMPLETE_SYSTEM_GUIDE.md` (PRD §1–§25)
**Analyst:** Senior Principal QA / Test Architect
**Status:** Phase 1 complete — no tests generated yet (per process).

> Every statement below cites the PRD section(s) it derives from. Nothing here invents behaviour.

---

## 1. Product Summary

Kedebah Payroll converts **configuration** (pay schedules, statutory rules, benefit/deduction
catalogs, bank master data, employee setups) into **pay runs** that compute each employee's gross
pay, taxes, deductions, and net pay, then carries results through **approval → payment → filing →
payslips → reporting** (PRD §1).

The defining architectural principle: **all statutory math is data-driven** — PAYE, Tier 1/2/3,
bonus tax, overtime tax and the pension cap read configured statutory items, bands and rate
versions; there are **no hard-coded tax rates** (PRD §1, §10). Ghana's full statutory setup ships
pre-seeded (PRD §1, §10).

A second product (`kedebah_v2_pim`) is the **employee self-service portal**; the only fully-wired
self-service feature (My Payslips) lives there and calls this app's `/my/payslips/*` API (PRD §21,
§23). It is a **separate project** and out of scope for this app's UI testing except at the API
boundary.

---

## 2. Modules (top-level functional areas)

Derived from the Table of Contents (PRD §Table of Contents) and the menu references throughout.

| # | Module | PRD § | Core responsibility |
|---|--------|-------|---------------------|
| M-AUTH | Authentication & Access Control | §2 | Login (multi-identifier), session, permissions, roles. |
| M-SETUP | Setup Order / Configuration hub | §3 | Ordered configuration workflow. |
| M-CYCLE | Pay Schedules & Pay Calendar | §4 | Frequency, rolling horizon, period lifecycle. |
| M-PG | Pay Groups | §5 | Grouped employees, shared assignments, layered resolution. |
| M-BANK | Bank Setup | §6 | Bank/branch/sort-code master data, CRUD + system-record guards. |
| M-CAT | Earnings, Benefits & Deductions Catalog | §7 | Recurring pay components, scopes, overrides, catalog approval. |
| M-BIK | Benefits in Kind | §8 | Non-cash taxable perks inside the tax pipeline. |
| M-PROT | Protected Pay Rules | §9 | Net-pay floors, trimming, carryovers. |
| M-TAX | Tax & Statutory Configuration | §10 | Statutory items, engines, bands, rate versions, assignment resolver, filing rules. |
| M-RELF | Tax Reliefs | §11 | Per-employee PAYE-base reductions. |
| M-LOAN | Employer Loans | §12 | Staff loans, loan BIK, repayments. |
| M-EMP | Employee Setup | §13 | Add/Import/Sync, compensation types, payment methods, 7 detail tabs, readiness. |
| M-CAL | Calculation Engine | §14 | The 13-step per-employee compute pipeline. |
| M-RUN | Payroll Run Types | §15 | Regular / Bonus / Off-Cycle / Termination inclusion contracts. |
| M-LIFE | Pay Run Lifecycle & Approval | §16 | Draft→Processing→Processed→Pending Approval→Approved→Paid, multi-stage approval. |
| M-STAX | Special Tax Engines | §17 | Bonus marginal method, overtime junior/senior, pension excess. |
| M-ALRT | Alerts & Validation | §18 | Hard blockers vs soft warnings, acknowledgement. |
| M-PAYM | Payments & Disbursement | §19 | Per-run Files action, bank payment file, payment status, proof of payment. |
| M-FORM | Taxes, Forms & Filings | §20 | Tax liabilities, one-form-per-period consolidation, supplementary forms, exports. |
| M-SLIP | Payslips | §21 | Admin PDF + self-service API (PIM portal). |
| M-RPT | Reports & Exports | §22 | 8 implemented reports, PDF/Excel. |
| M-COMP | Self-Service & Compliance | §23 | Audit trails, change history, filing history, alerts. |
| M-DASH | Dashboard | (implied UI) | Landing/overview screen (no dedicated PRD section — verify scope). |

**Note (DASH):** A Dashboard test-cases folder exists, but the PRD has **no dedicated dashboard
section**. Scope for Dashboard must be confirmed (it may be the post-login landing). Flagged as an
open question — see `reports/00-engagement-status.md`.

---

## 3. User Roles & Permission Model (PRD §2)

| Role | Capability |
|------|------------|
| **Payroll Admin** | Full 4-permission set (`view/create/edit/delete`) on **every** module. |
| **Payroll Manager** | Full CRUD on day-to-day operational modules; **view-only** on sensitive structural master data (e.g. **Banks**); full bank edit stays with Admin. |
| **Staff / Employee (self-service)** | Separate gate scoped to own staff record; **no admin permission required** for own pay info (My Payslips). |

**Permission mechanics (PRD §2):**
- Every resource has a 4-permission set: `payroll.view-*`, `payroll.create-*`, `payroll.edit-*`, `payroll.delete-*`, grouped under a named module (e.g. Banks group → `payroll.view-banks` …).
- Permission groups bundle into roles.
- Frontend **hides** menu items/blocks routes the user lacks; backend **independently enforces** the same permission on every API route.
- **Security boundary = API permission check.** UI hiding is convenience only → *direct-URL access and API authorization must be tested independently of the UI (Security module).*

---

## 4. Primary User Journeys

Reconstructed from PRD §1, §3, §13–§21.

### J1 — First-time system configuration (Setup Order, §3)
Pay Schedule → Statutory items/bands/filing rules (verify Ghana seed) → Tax presets → Benefits &
Deductions catalog → Pay Groups (opt) → Protected pay rules (opt) → Overtime rules → Bank Setup
(opt) → Employees → Employer loans. **Order matters** (each step depends on prior).

### J2 — Onboard an employee (§13)
Add (multi-step: personal → job → compensation → payment) **or** Bulk Import (Excel, chunked) **or**
Sync from HRIS → complete 7 tabs → reach **readiness** (salary/rate, payment method+details,
mandatory statutory enrollment).

### J3 — Run a Regular payroll (§14–§16, §19–§21)
Create Regular run (defaults to **Current** period) → draft preview (live totals/warnings) →
Process (engine + optional exclude-incomplete) → Submit for Approval → multi-stage approve →
(on Approve) tax liabilities + forms generated → Files (PAYE/SSNIT/bank file) → Mark as Paid →
loan balances decrement + **calendar advances** → payslips downloadable.

### J4 — Run a Bonus / Off-Cycle / Termination payroll (§15)
Same lifecycle, different inclusion contract (see Business Rules §6 below). None of these advance
the calendar.

### J5 — File statutory returns (§20)
On approval, liabilities generate per authority → consolidated into **one form per filing period**
(attach to Pending, or **-SUPP** if locked) → forms approval → submit → Compliance filing history.

### J6 — Distribute payslips (§21)
Admin: Paid run → employee row → Download Payslip (gated on run Paid + employee payment status Paid).
Employee: PIM portal Payroll → Payslips (current + history + bulk).

### J7 — Reporting & audit (§22–§23)
Reports Centre (8 reports, PDF/Excel) + per-employee detail view; Compliance audit/change/approval/
filing trails.

---

## 5. Navigation Map (menu locations cited in PRD)

| Area | Path (per PRD) | § |
|------|----------------|---|
| Pay Schedule / Cycles | Payroll Setup → Cycles | §3, §24 |
| Tax & Statutory | Settings → Tax & Statutory Configuration; Statutory Items; Tax Presets | §3, §10, §24 |
| Earnings & Deductions / Benefits | Payroll Setup → Earnings & Deductions / Benefits | §3, §7, §24 |
| Catalog Approval | Setup → Benefits/Deductions → Approval | §7 |
| Pay Groups | Payroll Setup → Pay Groups | §3, §5 |
| Protected Pay Rules | Setup → Protected Pay Rules | §3, §9 |
| Overtime Rules | Setup → Overtime Rules | §3, §17 |
| Bank Setup | Settings → Bank Setup | §3, §6 |
| Employees | Employees → Add / Import / Sync | §3, §13 |
| Loans (functional) | Management → Loans | §3, §12 |
| Pay runs / Files / payments | Run Payroll tab, Payroll History tab | §16, §19, §20 |
| Reports | Reports (Centre) | §22 |
| Compliance | Compliance → Statutory Filings | §20, §23 |

**Preview/placeholder menus (NOT functional — PRD §12, §13, §17, §19, §23, §25):** Loans submenu
(Requests/Eligibility/Approval/Active/Repayments); Payments submenu (Batches/Bank Files/Mobile
Money/Multi-Currency/Failed); Attendance (Summary/Overtime/LWP/Shifts/Imports); Employees → Bonuses
& Commissions; Reports → Payslips / Earnings & Deductions / Cost Center / Analytics; AI Insights;
Integrations pages; Self-Service → My Earnings / My Loans / Queries; Employee Cost Center tab;
Employee Payroll Overrides tab.

---

## 6. Business Rules (the engine's contract)

### 6.1 Pay Calendar (§4)
- **Rolling horizon:** always 1 Current + 3 Scheduled periods ahead; auto-created.
- Period lifecycle: **Scheduled → Current → Completed**.
- **Only a Regular run marked Paid** flips period to Completed, promotes next Scheduled to Current, tops up buffer. Bonus/Off-Cycle/Termination do **not** advance the calendar.
- Create Regular Pay Run modal **defaults to Current** period.
- **Weekend pay dates shift back to preceding Friday.**
- Frequency-specific date math (monthly month-end snap; semi-monthly 1–15 / 16–end incl. short Feb; quarterly +3 months).
- **Frequency change is effective-dated from next open period:** only future Scheduled periods with **no runs attached** are deleted/regenerated; Completed/Current/period-with-run are never rewritten.

### 6.2 Pay Groups (§5)
- Pre-populate a run with members; Regular run with **no** pay group adds **all employees with active salary** (eligibility-checked at period end).
- Carry shared benefit/deduction assignments + optional protected-pay rule.
- **Assignment resolution order (layered):** all-employees → department → pay group → individual. "In Effect" view shows final resolved set.

### 6.3 Bank Setup (§6)
- Seeded: 27 banks, 1,370+ branches, real 6-digit sort codes.
- Seeded records = **system**: identity fields (name, sort code) **never editable/deletable**; only **status** (Active/Inactive) changeable.
- Full CRUD for non-seeded: bank name + branch sort code validated **unique**.
- Relationship guards: can't delete a bank with branches, or a branch linked to an employee.
- Employee bank details = cascading **Bank → Branch** picker, **no free text** anywhere.

### 6.4 Catalog (§7)
- **Component Category:** Earning (cash → gross, `earning` line) vs Benefit (`benefit` line); both add to pay.
- **Benefit Nature:** Cash (benefits engine) vs Non-Cash (BIK → tax pipeline only).
- **Calculation Method (benefits):** Fixed / % of Basic / % of Cash Emoluments (basic + fixed cash benefits).
- **Tax Treatment (benefits):** Taxable (added to PAYE base) vs Non-Taxable.
- **Deduction Type:** Statutory / Voluntary / Loan / Benefit / Custom.
- **Deduction Calc Method:** Fixed / % Basic / % Cash Emoluments / **% of Net Pay** (second pass after tax + protected pay).
- **Deduction Tax Treatment:** Before Tax (reduces PAYE base) / After Tax (net only) / Non-Taxable / Taxable. **Default = After Tax.**
- **Priority:** lower priority kept first when protected pay trims; higher numbers deferred first.
- **Per-employee override:** override amount/% + effective from/to; engine skips not-yet-effective and expired assignments vs the period.
- Catalog changes can route through **approval workflow** with activity trail.

### 6.5 BIK (§8)
- A BIK = catalog benefit with Nature = Non-Cash. Each variant = own row (rate %, applies-to base, monthly cap, tax treatment).
- Value = fixed **or** `rate% × base`; base ∈ {Basic, Cash Emoluments excl BIK, Cash Emoluments incl BIK, Qualifying Employment Income}.
- Value **capped** at monthly cap → `bik_cap_applied` soft warning (computed vs applied).
- Taxable BIK adds to PAYE base but is **never paid in cash** (`bik` line inflates chargeable income, not net).
- Resolves via same eligibility engine; country-scoped BIK only for matching tax profile.
- Processed **inside tax pipeline** before percentage statutory items.

### 6.6 Protected Pay (§9)
- Floor modes: Absolute amount / % of gross / % of basic.
- Enforcement: **Hard Block** (employee errors, run can't process) / **Partial Apply with Alert** (trim by priority, record carryovers, alert) / **Alert Only** (nothing changed, warning).
- Statutory amounts (PAYE, Tier 1) **never trimmed** — only catalog deductions deferrable.
- Partial trims in **priority order** (highest priority survives longest).
- Deferred amounts → **deduction carryovers** (recorded). ⚠️ **Auto-recovery NOT implemented** — manual run adjustment only.
- Protected-pay details stored per employee (rule, floor, net before/after, amount deferred).

### 6.7 Tax & Statutory (§10, §24, key figures §24)
- Each statutory item: engine key, calculation stage + sequence, base amount type, behaviour switches (reduces taxable income / mandatory / requires enrollment / counts toward pension cap), cumulative tracking + window, rate versions, tax bands.
- **Assignment resolver:** mandatory (floor) + auto-enrolled (matching eligibility) + explicit enrollments − explicit exemptions (reason required).
- **No silent fallback:** no income-tax engine → **hard blocker `missing_income_tax_engine`**.
- Eligibility rules scope by country / employment type / pay group / department / single staff; multiple rules combine with **OR**.
- Tax presets bundle items (Enroll/Exempt/Suggest). Per-employee rate overrides supported. Voluntary schemes configure Tier 3.
- Filing rules: GRA 15th, SSNIT/NPRA 14th of following month (monthly). Drive compliance calendar, not the math.

**Ghana pre-loaded statutory items (§10, §24):**
| Item | Engine | Base | Rate |
|------|--------|------|------|
| PAYE | Progressive Bands | Qualifying Employment Income | 7 monthly bands (see §6.8) |
| Tier 1 (SSNIT) | Percentage Split | Basic | 5.5% EE / 13% ER |
| Tier 2 (NPRA) | Percentage Split | Basic | 0% EE / 5% ER |
| Tier 3 (voluntary) | Percentage Split | Basic | per scheme |
| Bonus Tax | Bonus Tax | Bonus Amount | 5% final within cap; excess → marginal PAYE |
| Overtime (Junior) | Overtime Junior | Overtime Amount | 5% / 10% final |
| Casual Worker Flat Tax | Flat Rate | Daily Pay Total | 5% |
| Pension Excess | Pension Excess | Qualifying Employment Income | 35% cap |

### 6.8 PAYE monthly bands (§10, §24) — exact figures for assertion
| Band | Upper bound (GH₵) | Rate |
|------|-------------------|------|
| 1 | ≤ 490 | 0% |
| 2 | ≤ 600 | 5% |
| 3 | ≤ 730 | 10% |
| 4 | ≤ 3,896.67 | 17.5% |
| 5 | ≤ 19,896.67 | 25% |
| 6 | ≤ 50,416.67 | 30% |
| 7 | above 50,416.67 | 35% |

### 6.9 Tax Reliefs (§11) — per employee, runs **first** in pipeline
| Relief | Monthly value |
|--------|---------------|
| Fixed Annual | annual ÷ 12 (Dependent GH₵1,200/yr → GH₵100/mo) |
| Per Unit Annual | annual × units ÷ 12, capped at max units (Children's Education GH₵600/child, max 3) |
| Percent of Assessable Income | % of month's assessable income (Disability 25%) |
| SSF Contribution | auto from actual Tier 1 + Tier 2 EE contributions this month (no manual amount) |

### 6.10 Employer Loans (§12)
- **Loan BIK:** interest below reference rate → monthly subsidy is taxable; engine adds `bik` line "Employer Loan BIK" (taxed, not paid).
- **Repayments:** per-period amount deducted from net (after tax), clamped to remaining balance; can auto-stop when repaid.
- On **Mark as Paid**, balances decrement by repayments actually taken — **never on drafts**. Each loan tracked/decremented **independently**; multiple loans show as single "Employer Loan Repayment" payslip line but full per-loan detail in audit.
- Loan exemption assessments determine BIK exemption.

### 6.11 Calculation Engine 13-step sequence (§14) — verbatim order
1. Resolve basic earning (compensation type).
2. Resolve run-type flags ({basic, benefits, deductions}).
3. Bonus amount (bonus runs): fixed or % of basic.
4. Recurring **benefits** (scope-resolved, override windows; earnings vs benefits; taxable tracked).
5. Recurring **deductions** (before/after tax; %-of-net waits for pass 2).
6. Ad-hoc **earnings** (off-cycle one-time + adjustments incl. overtime rows; dedupe catalog items; catalog-linked no-amount rows inherit catalog amount).
7. **GROSS PAY** = basic + bonus + extra earnings + cash benefits.
8. Ad-hoc **deductions** (off-cycle/termination, with tax treatment).
9. **TAX PIPELINE** (order a–j): a. Reliefs → b. BIK → c. Employer loans → d. Percentage items (Tier 1/2/3; pre-tax reduce taxable) → e. Bonus tax → f. Overtime tax → g. Pension excess → h. Progressive (PAYE) → i. Flat-rate → j. Alerts consolidated.
10. **Protected pay floor** (block / trim+carryover / alert).
11. **%-of-net-pay deductions** (second pass).
12. **NET PAY** = gross − total deductions − employee statutory. **Negative net = error.**
13. **EMPLOYER COST** = gross + employer statutory (Tier 1 13%, Tier 2 5%, Tier 3 ER share) + employer-only benefits.

Per-employee end status: **Calculated / Warning / Error**. Full snapshot stored (chargeable/qualifying income, BIK values, reliefs, protected-pay, traces) → powers detail modal + payslip (reads snapshot, never recomputes).

### 6.12 Run-type inclusion contract (§15, §24) — assertion-grade
| Component | Regular | Bonus | Off-Cycle | Termination |
|-----------|---------|-------|-----------|-------------|
| Basic salary | ✅ always | ❌ never | flag (default ❌) | ✅ always |
| Recurring benefits | ✅ | ❌ | flag | ❌ |
| Recurring deductions | ✅ | ❌ | flag | ❌ |
| Statutory | ✅ full | ✅ bonus tax; Tier1/2=0 | on included | ✅ |
| Ad-hoc earnings/deductions | overtime only | overtime only | ✅ one-time + adj | ✅ adjustments |
| Period | Current period | optional (pay-date month) | own date range | last working day |
| Advances calendar on Paid | ✅ | ❌ | ❌ | ❌ |

### 6.13 Pay Run Lifecycle (§16)
`Draft → Processing → Processed → Pending Approval → Approved → Paid`; Reject → back to draft;
Cancelled (with reason); Return to previous stage.
- **On Approved:** tax liabilities generated per authority + rolled into period's PAYE/SSNIT/NPRA forms; PAYE/SSNIT/bank file **downloadable immediately** (not gated on payment). "Post journal entries" flag recorded in audit — ⚠️ **actual Finance posting NOT implemented**.
- **Mark as Paid (terminal):** loan decrements (real payment only), calendar advance (Regular only), payment status updates.
- Every transition → immutable pay-run audit log (who/when/from/to/message).

### 6.14 Special Tax Engines (§17)
- **Bonus (Act 896 §5.1):** annual cap = 15% of annual basic (12× monthly basic). Within cap → 5% final (YTD cumulative). Excess → added to chargeable income at **marginal PAYE** = `tax(reference + excess) − tax(reference)`. Reference = full synthetic regular run for the bonus month (incl benefits, BIK, loan BIK, before-tax deductions, SSF, reliefs). Reconciliation: regular PAYE + bonus marginal PAYE = single-pass total. Detail modal: band-by-band table + reconciliation strip.
- **Overtime:** carried as earning adjustments flagged overtime (with hours). Junior (qualifying YTD ≤ GH₵18,000): 5% on overtime up to 50% of monthly basic, 10% above — never PAYE. Senior: added to chargeable income at PAYE marginal. Thresholds/rates from Setup → Overtime Rules; statutory fallback if unconfigured. ⚠️ **No pay-run overtime entry screen — API only**; Attendance→Overtime is sample data.
- **Pension Excess (35% cap):** total pension (Tier 1+2+3, EE+ER, counting items) vs 35% of qualifying employment income; excess routed back to chargeable income + PAYE'd, `pension_threshold` alert.

### 6.15 Payments & Disbursement (§19)
- Per-run **Files** action (Run Payroll tab when Approved/Paid; Payroll History when Paid).
- **Generic Bank Payment File** = single-sheet `.xlsx`: metadata block (company, period, description, currency) + header + one row per payable employee with columns `#, Employee ID, Employee Full Name, Department, Position, Account Number, Bank Name, Bank Sort Code, Bank Branch, Net Pay Amount, Payment Reference, Narration/Remarks, Email Address, Contact Number` + bold TOTAL row + "{n} Employee(s)" count.
- **Sort: bank name, then employee name.** MoMo shares Bank/Account columns (network/wallet). **Cash excluded**; missing-details excluded — skip reasons in API response, ⚠️ **not surfaced in Files modal UI** (§25).
- **Payment Reference left as dash** (manual). Every export recorded in audit.
- Per-employee payment status + **mark all paid**; **proof of payment** upload; per-run currency (default org currency).
- ⚠️ Standalone **Payments** menu = previews only.

### 6.16 Taxes, Forms & Filings (§20)
- On Approved → tax liabilities per authority + due dates from filing rules.
- **One form per filing period** (form type + authority + period bucket). Approving a run whose bucket has a **Pending** form → **attaches** + recomputes (no duplicate). Bucket has **locked** form (Pending Approval/Filed) → **supplementary** form (`-SUPP` + `is_supplementary`).
- **Files** modal lists 3: GRA PAYE Schedule (on income-tax form exists), SSNIT Tier 1 File (on social-security form), Generic Bank File (on run Approved/Paid). Muted note when not yet available.
- GRA PAYE Schedule export rebuilt for speed (bulk cleanup; byte-identical output).

### 6.17 Payslips (§21)
- Per paid-run employee → downloadable PDF from persisted snapshot (never recomputes).
- Admin: Paid run → employee row → **Download Payslip** (gated on run Paid + employee payment Paid).
- PDF contents: org header/logo, period, pay date, ref; identity (name/code/dept/position/TIN); payment details (method, bank/branch or network, masked account/wallet); **Earnings** (cash earnings + cash benefits, **BIK excluded**); **Statutory Deductions** + **Other Deductions** (two groups; same-name deductions e.g. multiple loans combined into one summed line); gross, total deductions, **net pay**, net in words.
- Self-service API (`/my/payslips/*`) scoped to own staff record (no admin perm): list/current/download/all. Real UI in **kedebah_v2_pim**. This app's Self-Service → My Payslips = unused placeholder.

### 6.18 Reports (§22) — 8 implemented, each PDF + Excel
Payroll Summary · Statutory Remittance · PAYE Reconciliation · Variance Comparison · Annual Payroll
· Year-End Tax · Audit & Compliance · Statutory Config Versions. Payslips are **not** a Reports Centre
export. Per-employee detail view matches calculation exactly (band-by-band + Download Payslip).

### 6.19 Compliance & Self-Service (§23)
Compliance (implemented): immutable dual audit trail (pay-run lifecycle log + system-wide), change
history, approval trails, statutory filing history, compliance alerts. Self-service: only Payslips
fully wired (via PIM); My Earnings / My Loans / Queries = placeholders.

---

## 7. Validation Rules (consolidated)

| Field / Condition | Rule | § |
|-------------------|------|---|
| Login identifier | 10-digit → phone; contains `@` → email; alphanumeric → username | §2 |
| Compensation rate/qty | zero/missing → **error** for that employee (flagged, not paid 0) | §13 |
| Bank Transfer details | Bank + Branch (from master list, no free text) + Account Number + Account Name required | §13 |
| Mobile Money details | Number + Network required; **Account Name NOT required** | §13 |
| Cash | nothing further | §13 |
| Account / MoMo numbers | masked (last 4, eye to reveal) | §13 |
| Bank name (new) | unique | §6 |
| Branch sort code (new) | unique | §6 |
| Bank delete | blocked if has branches | §6 |
| Branch delete | blocked if linked to employee payment details | §6 |
| Seeded bank/branch identity | name/sort code never editable/deletable; status only | §6 |
| Cost-center allocation | UI requires total 100% — but **not persisted** (preview) | §13, §25 |
| Income-tax engine resolution | none → **hard blocker** `missing_income_tax_engine` | §10, §18 |
| Net pay | negative → **error** | §14, §18 |
| Protected pay (hard block) | run cannot process until deductions reduced | §9 |
| Statutory exemption | requires documented reason | §10 |
| Missing TIN / tax profile | **soft warning** (PAYE still computes) | §13, §18 |
| Readiness to include in run | salary/rate set + payment method/details + mandatory statutory enrollment | §13 |

---

## 8. Calculations to Verify (high-risk, every value must be re-derived — §BUSINESS LOGIC)

Gross Pay · Net Pay · PAYE (band-by-band) · Tier 1 (5.5%/13%) · Tier 2 (0%/5%) · Tier 3 (per scheme)
· Benefits (Fixed / %Basic / %Cash Emoluments) · Deductions (incl. %-of-net second pass) · Employer
Contributions · Protected Pay (floor, trim, carryover) · Bonus Tax (5% within cap + marginal excess
+ reconciliation) · Overtime Tax (junior 5%/10% split, senior marginal) · Loans (loan BIK value +
repayment clamp + independent balance decrement) · Reliefs (4 types) · Pension Excess (35% cap
routing) · Rounding · Totals (incl. bank-file TOTAL row).

---

## 9. Dependencies & Sequencing Constraints

| Dependency | Detail | § |
|------------|--------|---|
| Pay Schedule → everything | Calendar must exist before runs | §3, §4 |
| Statutory items → calculation | No engine → run blocked | §3, §10 |
| Bank Setup → bank-transfer employees | Branch must exist before employee can bank there | §3, §6, §13 |
| Catalog → assignments | Items exist before scope assignment | §3, §7 |
| Pay group → run pre-population | Group membership drives run population | §5, §15 |
| Approval → forms/liabilities | Forms generated only on Approved | §16, §20 |
| Mark Paid → loan decrement + calendar advance | Only on real payment, Regular-only advance | §12, §16 |
| Reliefs → first in tax pipeline | Trims base before all engines | §11, §14 |
| BIK → before percentage statutory | Correct bases for Tier/PAYE | §8, §14 |
| Period bucket → form consolidation | Same bucket = one form (or -SUPP if locked) | §20 |

---

## 10. Constraints & Out-of-Scope (PRD §25 — documented gaps, NOT defects)

These are **explicitly not implemented**. Tests must assert the *documented gap behaviour* (preview /
redirect / not-saved), **not** full functionality. Reporting a gap as a functional bug would
contradict the PRD.

| Gap | Documented status | § |
|-----|-------------------|---|
| Employee Cost Center tab | UI preview, nothing saved, sample list | §13, §25 |
| Employee Payroll Overrides tab | UI preview, nothing saved | §13, §25 |
| Reports → Payslips | Not implemented; redirects to Reports Centre | §25 |
| Reports → Earnings & Deductions / Cost Center / Analytics | Redirect to Reports Centre | §25 |
| AI Insights | UI preview, no backend | §25 |
| Payments submenu (5 pages) | UI previews | §19, §25 |
| Loans submenu (5 pages) | UI previews | §12, §25 |
| Self-Service My Earnings / My Loans / Queries | Placeholders, no backend (both projects) | §23, §25 |
| Bank-file skip reasons in Files modal | Computed by API, not shown in UI | §19, §25 |
| Attendance (all pages) | Sample data, no payroll feed | §17, §25 |
| Bonuses & Commissions page | Sample data | §25 |
| Integrations pages | UI previews (Sync from HRIS works) | §25 |
| Journal posting to Finance | Flag logged only, no posting | §16, §25 |
| Deduction carryover auto-recovery | Recorded, not auto-recovered | §9, §25 |
| Overtime entry screen | API-only, no UI | §17, §25 |
| Mid-cycle salary proration | Not implemented; UI warns, engine pays full period | §13, §25 |

---

## 11. Risk Heat-Map (input to Phase 3 strategy)

| Area | Risk | Rationale |
|------|------|-----------|
| Tax pipeline / PAYE bands | **Critical** | Money + statutory/legal exposure; complex ordering; data-driven. |
| Bonus marginal method + reconciliation | **Critical** | Multi-run reconciliation invariant; easy to get wrong. |
| Protected pay trimming + carryover | **High** | Priority logic, statutory-never-trim invariant, known unimplemented recovery. |
| Pension 35% cap routing | **High** | Cross-tier aggregation feeding PAYE. |
| Pay calendar rolling/advance | **High** | Only Regular advances; weekend shift; frequency-change regeneration safety. |
| Loan BIK + independent balance decrement | **High** | Money, drafts-must-not-decrement invariant, payslip line combination. |
| Form consolidation (one-per-period / -SUPP) | **High** | Compliance correctness; must not mutate filed records. |
| Permissions / direct-URL / API authz | **High** | Security boundary is API, not UI. |
| Bank file correctness (sort codes, sort order, exclusions, totals) | **High** | Finance disbursement depends on it. |
| Employee readiness / payment validation | **Medium** | Gatekeeping for runs; MoMo-vs-Bank field differences. |
| Reports exports (PDF/Excel) | **Medium** | 8 reports × 2 formats. |
| Documented-gap pages | **Low** (verify-only) | Must confirm preview/redirect, not functionality. |

---

## 12. Open Questions (carried to engagement status)

1. **No running application** in this directory — only the PRD. Where is the testable target (URL, repo, build instructions, seeded test data)? *(Blocks Phases 6–9.)*
2. **Dashboard module** — a test-cases folder exists but the PRD has no dashboard section. Confirm scope (post-login landing? KPIs?).
3. **Credentials & roles** — need Payroll Admin, Payroll Manager, and a staff/self-service account for permission testing.
4. **Environment isolation** — is there a non-production environment safe for destructive CRUD and payroll-run testing?
5. **PIM portal** (`kedebah_v2_pim`) — in scope for self-service payslip verification, or test only at this app's `/my/payslips/*` API?
6. **Reference rate / voluntary scheme / overtime rule values** — seeded defaults needed to assert loan-BIK and overtime math.

---

*End of Phase 1 — Product Analysis. Next: Phase 2 — Requirement Extraction (`requirements/`).*
