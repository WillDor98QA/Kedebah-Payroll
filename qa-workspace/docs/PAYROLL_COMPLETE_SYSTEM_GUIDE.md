# Kedebah Payroll — Complete System Guide

This is the master guide to how the payroll system works end-to-end: login & access, company setup, bank setup, tax & statutory configuration, benefits, deductions, benefits-in-kind (BIK), employer loans, employee setup, and how every payroll run type (Regular, Bonus, Off-Cycle, Termination) applies all of these during calculation — through to payslips, statutory filings, and disbursement.

It documents the most recent system behaviour, including the rolling pay calendar, the bonus-excess marginal PAYE method, off-cycle inclusion flags, protected pay, loans-as-BIK, the payment-method rules, the Bank Setup master data + bank payment export, one-form-per-filing-period tax form consolidation, and payslip generation (admin + self-service).

---

## Table of Contents

1. [The Big Picture](#1-the-big-picture)
2. [Logging In & Access Control](#2-logging-in--access-control)
3. [Setup Order — What to Configure First](#3-setup-order)
4. [Pay Schedules & the Pay Calendar](#4-pay-schedules--the-pay-calendar)
5. [Pay Groups](#5-pay-groups)
6. [Bank Setup](#6-bank-setup)
7. [Earnings, Benefits & Deductions Catalog](#7-earnings-benefits--deductions-catalog)
8. [Benefits in Kind (BIK)](#8-benefits-in-kind-bik)
9. [Protected Pay Rules](#9-protected-pay-rules)
10. [Tax & Statutory Configuration](#10-tax--statutory-configuration)
11. [Tax Reliefs](#11-tax-reliefs)
12. [Employer Loans](#12-employer-loans)
13. [Employee Setup](#13-employee-setup)
14. [The Calculation Engine — Step by Step](#14-the-calculation-engine--step-by-step)
15. [Payroll Run Types](#15-payroll-run-types)
16. [Pay Run Lifecycle & Approval](#16-pay-run-lifecycle--approval)
17. [Special Tax Engines](#17-special-tax-engines)
18. [Alerts & Validation](#18-alerts--validation)
19. [Payments & Disbursement](#19-payments--disbursement)
20. [Taxes, Forms & Filings](#20-taxes-forms--filings)
21. [Payslips](#21-payslips)
22. [Reports & Exports](#22-reports--exports)
23. [Self-Service & Compliance](#23-self-service--compliance)
24. [Quick Reference Tables](#24-quick-reference-tables)
25. [Implementation Status — What Is Not Yet Functional](#25-implementation-status--what-is-not-yet-functional)

---

## 1. The Big Picture

The payroll module turns **configuration** (schedules, statutory rules, benefit/deduction catalogs, bank master data, employee setups) into **pay runs** that compute every employee's gross pay, taxes, deductions, and net pay, then carries the result through **approval → payment → filing → payslips → reporting**.

```
CONFIGURATION                          EXECUTION                       AFTERMATH
─────────────────────────────         ─────────────────────────       ─────────────────────
Pay Schedule → Pay Calendar            Create Pay Run (4 types)        Mark as Paid
Pay Groups                             → engine calculates each        → period rolls forward
Bank Setup                               employee (gross, taxes,       → loan balances reduce
Benefits / Deductions catalog            BIK, reliefs, net pay)        Files: PAYE / SSNIT / Bank
Statutory items + tax bands            Review draft + warnings         Payslips (admin + self-service)
Eligibility rules / presets            Process → Approve               Reports & breakdowns
Tax reliefs                            (multi-stage approval)          Audit trail
Voluntary schemes (Tier 3)
Protected pay rules
Employer loans
Employee setup (7 tabs)
```

Everything statutory (PAYE, Tier 1/2/3, bonus tax, overtime tax, pension cap) is **data-driven**: the engine reads the statutory items, bands, and rates you configure — there are no hard-coded tax rates. Ghana's full setup ships pre-loaded by the seeders.

---

## 2. Logging In & Access Control

Every session starts with a login, and every screen and API call afterwards is gated by the logged-in user's permissions.

### Logging in

- The Login screen takes a single **identifier** field that accepts an email, username, or phone number interchangeably — the frontend auto-detects which kind it is (a 10-digit number is treated as a phone number, an `@`-containing string as an email, anything alphanumeric as a username) and a password.
- A successful login stores the access token and the user's permission set in the auth store (cookies + localStorage). The router redirects back to whatever page was originally requested (`?redirect=...`) if the session had expired mid-navigation.
- **Logout** calls the logout endpoint, clears the stored session, and returns to the Login screen.

### Permissions & roles

- Every payroll resource — Pay Groups, **Banks**, Benefits, Deductions, Tax Setup, Pay Runs, Employees, Loans, Taxes & Forms, and so on — has its own 4-permission set: `view-*` / `create-*` / `edit-*` / `delete-*`, grouped under a named module (e.g. the **Banks** group → `payroll.view-banks`, `payroll.create-banks`, `payroll.edit-banks`, `payroll.delete-banks`).
- Permission groups are bundled into **roles**. **Payroll Admin** holds the full set on every module; **Payroll Manager** typically gets full CRUD on day-to-day operational modules but view-only on sensitive/structural master data such as Banks — full edit rights there stay with Admin.
- The frontend hides menu items and blocks routes a user doesn't have permission for; the backend independently enforces the same permission on every API route. The UI not showing a button is a convenience, not the security boundary — the API-level permission check is what actually protects the data.
- Staff **self-service** routes (e.g. My Payslips, §21) use a separate gate: they're scoped to the logged-in user's own staff record, with no admin permission required at all, since an employee should always be able to reach their own pay information.

---

## 3. Setup Order

Configure the system in this order before running your first payroll:

| # | What | Where | Why first |
|---|------|-------|-----------|
| 1 | **Pay Schedule** (frequency, first period, pay date offset) | Payroll Setup → Cycles | Generates the pay calendar everything else books against. |
| 2 | **Statutory items, tax bands, filing rules** | Settings → Tax & Statutory Configuration | The engine refuses to compute income tax for an employee with no assigned tax engine. Ghana data is pre-seeded — verify it. |
| 3 | **Tax presets** (e.g. "Ghana Full-Time") | Tax & Statutory → Tax Presets | Lets you enroll each new employee in all statutory items with one click. |
| 4 | **Benefits & Deductions catalog** (incl. BIK items) | Payroll Setup → Earnings & Deductions / Benefits | Recurring allowances and deductions employees will inherit. |
| 5 | **Pay Groups** (optional) | Payroll Setup → Pay Groups | Group employees who share benefits/deductions and run together. |
| 6 | **Protected pay rules** (optional) | Setup → Protected Pay Rules | Net-pay floors that limit how much can be deducted. |
| 7 | **Overtime rules** | Setup → Overtime Rules | Junior/senior thresholds and rates for overtime taxation. |
| 8 | **Bank Setup** (optional, but needed before onboarding bank-transfer employees) | Settings → Bank Setup | Employees can only select a bank + branch from this list — there's no free-text fallback (§6). Add any bank/branch not already in the seeded Ghana list before adding an employee who banks there. |
| 9 | **Employees** | Employees → Add / Import / Sync | Personal data, salary, payment details (bank/branch selection, §13), tax & pension enrollment. |
| 10 | **Employer loans** (as needed) | Management → Loans | Staff loans with BIK fringe-benefit treatment and payroll repayments. |

---

## 4. Pay Schedules & the Pay Calendar

### The Pay Schedule

The pay schedule defines the company's payroll rhythm:

| Field | Meaning |
|-------|---------|
| **Frequency** | Weekly, Bi-Weekly, Semi-Monthly (1st–15th / 16th–end), Monthly, or Quarterly. |
| **First period start/end** | Anchors the calendar. A monthly period can be calendar-aligned (1st–31st) or custom (e.g. 15th–14th) — the system preserves the shape when rolling forward. |
| **Pay date offset** | How many days after period end the pay date falls (0 = pay on the last day). |
| **Cutoff days** | How many days before period end changes must be locked in. |

### The Rolling Pay Calendar (current behaviour)

The calendar is a **rolling horizon** — the model used by standard payroll platforms:

- The system always keeps **one Current period plus a buffer of 3 Scheduled periods** ahead. Periods are created automatically; you never have to add the next month by hand.
- Each period has a status lifecycle: **Scheduled → Current → Completed**.
- **When a Regular pay run is marked Paid**, its period flips to *Completed*, the next Scheduled period is promoted to *Current*, and the buffer is topped back up. Bonus, off-cycle, and termination runs do **not** advance the calendar — only the regular run closes a period.
- The **Create Regular Pay Run** modal always defaults to the *Current* (next open) period — after you pay May, the modal offers June automatically.
- **Weekend pay dates shift back to the preceding Friday** (e.g. a period ending Sunday 31 May 2026 pays on Friday 29 May).
- Period date math respects each frequency: monthly snaps to month-end when the schedule is month-aligned, semi-monthly alternates 1st–15th / 16th–end (handling short Februaries), quarterly adds three calendar months.

### Changing the Frequency Mid-Year

Schedule changes are **effective-dated from the next open period**:

- Only future *Scheduled* periods that have **no pay runs attached** are deleted and regenerated under the new frequency.
- Completed periods, the Current period, and any period with a draft/processed run attached are never rewritten — history stays intact.

---

## 5. Pay Groups

A pay group is a named set of employees that:

1. **Pre-populates a pay run** — creating a run for a pay group adds its members automatically. A regular run with *no* pay group adds **all employees with an active salary** (eligibility-checked against the period end so expired compensation is excluded).
2. **Carries shared benefit/deduction assignments** — items assigned at the pay-group level apply to every member without per-employee enrollment.
3. **Can carry a protected-pay rule** that applies to all members.

Assignments resolve in layers: *all-employees* scope → department → pay group → individual. The employee's **"In Effect"** view (Benefits & Deductions tab) shows the final resolved set.

---

## 6. Bank Setup

A Bank Setup master list backs every employee's bank-transfer payment details and the bank payment export (§19) — it replaces what used to be a hardcoded, free-text bank name field with no way to capture a real sort code.

### What's seeded

- Settings → **Bank Setup** ships pre-loaded with Ghana's authoritative bank/branch/sort-code reference data: 27 banks and over 1,370 branches, each branch carrying its real 6-digit sort code.
- Seeded banks and branches are marked as **system** records: their identity fields (name, sort code) can never be edited or deleted — only their **status** (Active/Inactive) can be changed. This lets a closed branch be retired from new selections without anyone being able to silently corrupt the reference data a bank payment file depends on for correctness.

### Adding banks/branches not in the seed

- Bank Setup is full CRUD, not a read-only reference list — if a bank or branch your company actually uses isn't in the seeded set, add it from the same screen (a modal form: bank name / short name / institution code, or branch sort code / name). Bank name and branch sort code are both validated as unique.
- Newly-added (non-seeded) banks/branches stay fully editable and deletable, subject to the usual relationship guards: you can't delete a bank that still has branches, or a branch still linked to an employee's payment details.

### How employees use it

- Employee Payment Details (Bank Transfer) is a cascading **Bank → Branch** picker, not a free-text field — pick the bank first, then its branch, which is what supplies the sort code printed on the bank payment file. There is no free-text escape hatch for new or edited bank-transfer details (§13).

---

## 7. Earnings, Benefits & Deductions Catalog

The catalog holds every recurring pay component. Each item is configured once and then assigned by scope (all employees, department, pay group, or individual).

### Benefits (and Earnings)

| Field | Options & Meaning |
|-------|-------------------|
| **Component Category** | **Earning** — cash compensation that counts toward gross pay (allowances, commissions, salary supplements); emitted as an `earning` line. **Benefit** — a fringe perk; emitted as a `benefit` line. Both add to the employee's pay; the category controls where the amount is grouped in summaries. |
| **Benefit Nature** | **Cash** — paid in money, handled by the benefits engine. **Non-Cash** — a BIK, handled exclusively by the tax pipeline (see [§8](#8-benefits-in-kind-bik)). |
| **Calculation Method** | **Fixed Amount**, **Percentage of Basic Salary**, or **Percentage of Cash Emoluments** (basic + fixed cash benefits). |
| **Tax Treatment** | **Taxable** — added to the PAYE base. **Non-Taxable** — paid but excluded from the PAYE base. (Before-Tax / After-Tax apply to deductions.) |
| **Effective From / To** | Catalog-level lifecycle window. |
| **Status** | Active / Inactive — inactive items are skipped entirely. |
| **Alert Thresholds** | Optional caps that raise a soft warning when a computed amount crosses the threshold during a run. |

### Deductions

| Field | Options & Meaning |
|-------|-------------------|
| **Deduction Type** | Statutory, Voluntary, Loan, Benefit, Custom — classification for reporting. |
| **Calculation Method** | Fixed Amount, Percentage of Basic, Percentage of Cash Emoluments, or **Percentage of Net Pay** (computed in a second pass *after* taxes and protected-pay so the percentage applies to a realistic net figure). |
| **Tax Treatment** | **Before Tax** — subtracted from income before PAYE is computed (reduces tax). **After Tax** — deducted from net pay only. **Non-Taxable / Taxable** — control whether the line affects the taxable base. Default when unspecified: After Tax. |
| **Priority** | When protected pay forces deductions to be trimmed, lower-priority deductions are kept first and higher numbers deferred first. |
| **Eligibility Rules** | Same scope model as benefits — narrow an item to a department, pay group, or person. |

### Per-Employee Overrides

Assigning a catalog item to a specific employee (Employee → Benefits & Deductions) lets you set an **override amount/percentage** and **effective from/to dates** for that person. The engine checks the override window against the pay run's period: not-yet-effective and expired assignments are skipped.

### Catalog Approval

Benefit and deduction catalog changes can be routed through the **approval workflow** (Setup → Benefits/Deductions → Approval) before they go live, with a full activity trail.

---

## 8. Benefits in Kind (BIK)

A BIK is a **non-cash perk** (company vehicle, fuel, accommodation) with a taxable value per Ghana law. In this system, a BIK is simply a catalog benefit with **Benefit Nature = Non-Cash**.

How BIK works:

- Each BIK variant is its own catalog row — e.g. "Vehicle Only", "Vehicle + Fuel", "Accommodation". The BIK parameters live directly on the benefit: **rate (%)**, **applies-to base**, **monthly cap amount**, **tax treatment**.
- The **value** is either a fixed amount or `rate % × base`, where the base can be **Basic Salary**, **Cash Emoluments (excluding BIK)**, **Cash Emoluments (including BIK)**, or **Qualifying Employment Income**.
- The value is then **capped** at the monthly cap if one is set; when the cap bites, the run raises a `bik_cap_applied` soft warning showing the computed vs applied value.
- A **Taxable** BIK adds its value to the PAYE base (the employee pays tax on the perk) but is **never paid out in cash** — it appears on the calculation as a `bik` line and inflates chargeable income, not net pay.
- BIK resolves through the same eligibility engine as cash benefits, so a BIK scoped to a pay group or auto-enrolled applies without a per-employee row. Country-scoped BIK only applies to employees whose tax profile matches that country.
- BIK is processed **inside the tax pipeline** (not the benefits engine), before the percentage statutory items run, so Tier 1/2/3 and PAYE see the correct bases.

Employer **loan fringe benefits** are a second source of BIK — see [§12](#12-employer-loans).

---

## 9. Protected Pay Rules

Protected pay guarantees an employee a minimum take-home even when deductions pile up (loans + union dues + garnishments).

| Setting | Options |
|---------|---------|
| **Floor mode** | **Absolute amount** (e.g. net pay must be ≥ GH₵1,000), **Percent of gross**, or **Percent of basic**. |
| **Enforcement** | **Hard Block** — the employee errors out and the run cannot be processed until deductions are reduced. **Partial Apply with Alert** — deductions are trimmed (by priority) until the floor is satisfied; trimmed amounts are recorded as **carryovers** to recover in later periods; an alert is raised. **Alert Only** — nothing is changed, a warning is raised. |

Important behaviours:

- Statutory amounts (PAYE, Tier 1) are **never** trimmed — only catalog deductions are deferrable.
- In partial mode, deductions are trimmed in **priority order** (highest-priority deductions survive longest).
- Deferred amounts are recorded as **deduction carryovers** against the run for visibility and follow-up. ⚠️ *Automatic recovery of carryovers in later runs is not yet implemented — recovered amounts must currently be applied manually (e.g. as a run adjustment).*
- The protected-pay details (rule, floor amount, net before/after, amount deferred) are stored with each employee's calculation for audit.

---

## 10. Tax & Statutory Configuration

### Statutory Items

Every government-mandated tax/contribution is a **statutory item** with:

- An **engine key** describing the math: Progressive Bands (PAYE), Flat Rate (casual worker 5%), Percentage Split (Tier 1/2/3 employee+employer split), Bonus Tax, Overtime Junior, Pension Excess.
- A **calculation stage** + **sequence** (when in the pipeline it runs) and a **base amount type** (what it is computed on — basic salary, qualifying employment income, bonus amount, etc.).
- Behaviour switches: **reduces taxable income** (pre-tax pension behaviour), **is mandatory**, **requires enrollment**, **counts toward pension cap**.
- **Cumulative tracking** for threshold engines (bonus 15% of annual basic, overtime GH₵18,000 YTD, pension 35% cap) with a configurable window.
- **Rate versions** so rate changes are dated rather than overwritten, and **tax bands** for progressive engines.

### Ghana's pre-loaded items

| Item | Engine | Base | Rate |
|------|--------|------|------|
| PAYE | Progressive Bands | Qualifying Employment Income | 7 monthly bands: 0% to 490 · 5% to 600 · 10% to 730 · 17.5% to 3,896.67 · 25% to 19,896.67 · 30% to 50,416.67 · 35% above |
| Tier 1 (SSNIT) | Percentage Split | Basic Salary | 5.5% employee / 13% employer |
| Tier 2 (NPRA) | Percentage Split | Basic Salary | 0% employee / 5% employer |
| Tier 3 (voluntary) | Percentage Split | Basic Salary | Per voluntary scheme |
| Bonus Tax | Bonus Tax | Bonus Amount | 5% final within cap; excess → marginal PAYE |
| Overtime Tax (Junior) | Overtime Junior | Overtime Amount | 5% / 10% final |
| Casual Worker Flat Tax | Flat Rate | Daily Pay Total | 5% |
| Pension Excess | Pension Excess | Qualifying Employment Income | 35% cap |

### Who gets which items — the assignment resolver

For each employee, on every run, the system resolves the applicable statutory items as:

```
mandatory items (the floor)
+ auto-enrolled items whose eligibility rules the employee matches
+ explicit enrollments (Employee → Tax & Pension)
−  explicit exemptions (with documented reason)
```

There is **no silent fallback**: if an employee resolves to no income-tax engine at all, the run raises a **hard-blocker alert** (`missing_income_tax_engine`) so HR fixes the setup rather than paying untaxed.

**Eligibility rules** scope an item by country, employment type, pay group, department, or a single staff member; multiple rules combine with OR. **Tax presets** bundle items with Enroll/Exempt/Suggest actions so a new hire is set up in one click. **Per-employee rate overrides** are supported on each enrollment. **Voluntary schemes** configure Tier 3 trustees, rates, and min/max contributions.

### Filing Rules

Filing rules drive the compliance calendar (not the math): GRA filings due the 15th of the following month, SSNIT and NPRA the 14th, monthly. When a run is **approved**, tax liabilities are generated per authority and rolled into that period's tax forms — see [§20](#20-taxes-forms--filings).

---

## 11. Tax Reliefs

Reliefs reduce the PAYE base before the bands are applied. They are assigned **per employee** (Tax & Pension tab) since they depend on personal circumstances.

| Relief Type | How the monthly value is derived |
|-------------|----------------------------------|
| **Fixed Annual** | Annual amount ÷ 12 (e.g. Dependent Relief GH₵1,200/yr → GH₵100/mo). |
| **Per Unit Annual** | Annual amount × units ÷ 12, capped at a max unit count (e.g. Children's Education GH₵600/child, max 3). |
| **Percent of Assessable Income** | A percentage of the month's assessable income (e.g. Disability Relief 25%). |
| **SSF Contribution** | Auto-calculated from the employee's actual Tier 1 + Tier 2 employee contributions this month — no manual amount. |

The reliefs step runs **first** in the tax pipeline so every later engine sees the trimmed base.

---

## 12. Employer Loans

Staff loans issued by the company are managed in **Management → Loans** and integrate with payroll in two ways:

1. **Loan BIK (fringe benefit):** if the loan's interest rate is below the reference rate, the monthly subsidy is a taxable benefit. The engine computes a monthly taxable value per active loan and adds it to chargeable income as a `bik` line ("Employer Loan BIK") — taxed, not paid.
2. **Repayments:** the loan's per-period repayment is deducted from net pay (after tax) each run, clamped to the remaining balance. Loans can **auto-stop when repaid**; otherwise they continue while a balance remains.

When a pay run is **marked Paid**, loan balances are decremented by the repayments actually taken in that run — balances only move on real payment, never on drafts. Each loan's balance is tracked and decremented **independently**, even though an employee with multiple active loans sees them combined into a single "Employer Loan Repayment" line on their payslip — see [§21](#21-payslips). The full per-loan detail (balances, individual repayment amounts) is always available in the audit trail regardless of how the payslip displays it.

Loan **exemption assessments** (eligibility resolver) determine whether a given loan arrangement is exempt from BIK treatment.

> ⚠️ The Loans **submenu pages** (Loan Requests, Eligibility, Approval, Active Loans, Repayments) are *UI previews only*. The functional loan management lives at **Management → Loans**, where loans are created and tracked and from which the payroll BIK/repayment behaviour above operates.

---

## 13. Employee Setup

### Three ways in

- **Add Employee** — multi-step form (personal → job → compensation → payment). Creates the employee in HR and payroll.
- **Bulk Import** — Excel template with reference dropdown tabs; validated preview, then background processing in chunks (10,000+ rows); tracked in Import History.
- **Sync from HRIS** — registers existing HR staff for payroll.

### Compensation types

| Type | Basic earning per period | Required fields |
|------|--------------------------|------------------|
| **Monthly** | `basic_salary` | Base Salary |
| **Daily** | `daily_rate × days_per_pay_period` | Daily Rate + Days per Pay Period |
| **Hourly** | `hourly_rate × hours_per_pay_period` | Hourly Rate + Hours per Pay Period |

A zero/missing rate or quantity produces a calculation **error** for that employee (they are flagged in the draft, not silently paid 0).

### Payment methods — current validation

| Method | Required fields |
|--------|------------------|
| **Bank Transfer** | **Bank + Branch** (selected from the Bank Setup master list, §6 — no free text), Account Number, Account Name |
| **Mobile Money** | Mobile Money Number, Mobile Network — **Account Name is NOT required** (the MoMo UI collects network + number only) |
| **Cash** | Nothing further |

Bank selection is a cascading **Bank → Branch** picker — typing a bank name directly is no longer possible. Picking the branch also captures its real sort code, which is what lets the bank payment file (§19) carry a correct sort code for every employee. Account and mobile money numbers are masked in the UI (last 4 digits; eye icon to reveal).

### The seven detail tabs

1. **Payroll Profile** — readiness indicator + missing-field checklist.
2. **Salary Assignment** — base salary / rates, structure, effective dates. A mid-cycle effective date shows a warning; ⚠️ *the engine does not automatically prorate* — it pays the full period at the salary in effect, so handle a true mid-period split manually (e.g. via an off-cycle adjustment).
3. **Bank & Payment Details** — per the table above.
4. **Tax & Pension** — TIN, NHIS, tax profile (with contract tracking + renewal alerts), statutory enrollment/exemption (or one-click preset), per-employee rate overrides, Tier 3 scheme opt-in, and tax reliefs.
5. **Cost Center** — ⚠️ *UI preview only, not yet functional.* The tab renders allocation entry (must total 100%) but nothing is persisted to the backend yet, and the cost-center list is sample data. Cost-center allocation and Finance journal posting are pending implementation.
6. **Benefits & Deductions** — direct assignments plus the resolved **"In Effect"** view (direct + pay group + department + auto-enrolled).
7. **Payroll Overrides** — ⚠️ *UI preview only, not yet functional.* The tab does not persist overrides to the backend. The working way to make a one-time adjustment today is a **run adjustment** (an ad-hoc earning/deduction line on an Off-Cycle or Termination run, or an overtime adjustment on a Regular/Bonus run) — see [§15](#15-payroll-run-types).

### Readiness

Before a pay run can include an employee: salary/rate set, payment method + details complete, enrolled in the mandatory statutory items. Missing TIN raises a warning (not blocking). The **Process** step can optionally **exclude incomplete employees** instead of blocking the whole run.

---

## 14. The Calculation Engine — Step by Step

When a pay run is processed, the engine computes each employee independently. The exact sequence:

```
 1. Resolve basic earning           From compensation type (monthly amount, or
                                    daily/hourly rate × period quantity).

 2. Resolve run-type flags          Which of {basic, benefits, deductions} this
                                    run type includes — see §15 table.

 3. Bonus amount (bonus runs)       Fixed amount, or % of each employee's basic.

 4. Recurring BENEFITS              Catalog cash benefits/earnings resolved by scope
                                    (all/department/pay group/individual), respecting
                                    employee override windows. Earnings vs benefits
                                    categorized; taxable amounts tracked for PAYE base.

 5. Recurring DEDUCTIONS            Same resolution. Before-tax vs after-tax split.
                                    (%-of-net-pay deductions wait for pass 2.)

 6. Ad-hoc EARNINGS                 Off-cycle one-time amount per employee + run
                                    adjustments (incl. overtime rows with hours).
                                    Duplicates of already-applied catalog items are
                                    skipped; catalog-linked rows with no amount
                                    inherit the catalog amount.

 7. GROSS PAY                       basic + bonus + extra earnings + cash benefits.

 8. Ad-hoc DEDUCTIONS               Off-cycle/termination adjustment deductions,
                                    each with its tax treatment.

 9. TAX PIPELINE (statutory)        In this order:
      a. Reliefs                    Trim the PAYE base (incl. auto SSF relief).
      b. BIK                        Non-cash benefits valued, capped, added to base.
      c. Employer loans             Loan BIK + after-tax repayment lines.
      d. Percentage items           Tier 1 / Tier 2 / Tier 3 on their bases;
                                    pre-tax ones reduce taxable income.
      e. Bonus tax                  5% final within cap; excess routed to PAYE base
                                    at the marginal rate (see §17).
      f. Overtime tax               Junior 5%/10% final, or routed to PAYE (see §17).
      g. Pension excess             Contributions above 35% cap routed back to PAYE base.
      h. Progressive items          PAYE bands applied to the final chargeable income.
      i. Flat-rate items            e.g. casual worker 5% — additive on top.
      j. Alerts                     Consolidated (missing TIN, missing engine, etc.).

10. PROTECTED PAY floor             If breached: block, trim by priority with
                                    carryovers, or alert — per the rule (§9).

11. %-of-net-pay deductions         Second pass on the now-known approximate net.

12. NET PAY                         gross − total deductions − employee statutory.
                                    Negative net pay is an error.

13. EMPLOYER COST                   gross + employer statutory (Tier 1 13%, Tier 2 5%,
                                    Tier 3 employer share) + employer-only benefits.
```

Every employee ends in a status: **Calculated**, **Warning** (paid but flagged), or **Error** (blocked). All line items, totals, and a full diagnostics block (chargeable income, qualifying income, BIK values, reliefs, protected-pay details, pipeline traces) are stored per employee — this is what powers the detail modal's band-by-band PAYE breakdown and the generated payslip (§21), both of which read this stored snapshot rather than recomputing it.

---

## 15. Payroll Run Types

Four run types, each with a precise inclusion contract:

| | **Regular** | **Bonus** | **Off-Cycle** | **Termination** |
|---|---|---|---|---|
| Basic salary | ✅ Always | ❌ Never (bonus only) | ⚙️ Optional flag (default **No**) | ✅ Always |
| Recurring benefits | ✅ | ❌ | ⚙️ Optional flag | ❌ |
| Recurring deductions | ✅ | ❌ | ⚙️ Optional flag | ❌ |
| Statutory items | ✅ Full pipeline | ✅ (bonus tax; Tier 1/2 = 0 since no basic) | ✅ on whatever is included | ✅ |
| Ad-hoc earnings/deductions | Overtime adjustments only | Overtime adjustments only | ✅ One-time amount + any adjustments | ✅ Adjustments (final entitlements/recoveries) |
| Period | Booked to the **Current** pay period | Period optional — booked under the pay-date month | Carries its own entered date range | Carries last working day |
| Advances the pay calendar when Paid | ✅ **Yes** | ❌ | ❌ | ❌ |

### Regular

The standard cycle run. Defaults to the Current period from the rolling calendar; with no pay group selected, all employees with an active salary (eligible as of period end) are added. Includes everything: basic, recurring benefits/deductions, all statutory, loans, BIK, reliefs. Paying it closes the period and rolls the calendar forward.

### Bonus

Pays a bonus only — basic salary belongs to the regular run. Configure either a **fixed amount** per employee or a **percentage of base salary**. No recurring benefits/deductions apply; Tier 1/2/3 are basic-based so they correctly compute to zero. Bonus tax applies per [§17](#17-special-tax-engines). The run can omit a payroll period entirely — the bonus tax keys off the pay date's year for the annual cap.

### Off-Cycle

An ad-hoc payment between cycles (corrections, advances, special payments). By default it pays **only the amounts you enter** (the standard for ad-hoc runs) — a one-time amount per employee plus any itemized adjustments. Three creation-time switches, shown as badges on the create page and the draft review:

- **Benefits: Yes/No** — include recurring benefits.
- **Deductions: Yes/No** — include recurring deductions.
- **Regular salary: Yes/No** — include basic salary (when Yes, every basic-derived figure — Tier 1/2, %-of-basic items, PAYE base — follows).

### Termination

The final-pay run for a leaving employee. Includes basic salary and the full statutory pipeline, but **no recurring benefits/deductions** — final entitlements (leave payout, severance) and recoveries are entered as explicit adjustments so the final payment is deliberate line by line. Records the **last working day**.

---

## 16. Pay Run Lifecycle & Approval

```
Draft ──► Processing ──► Processed ──► Pending Approval ──► Approved ──► Paid
  │                                          │       ▲
  └────────────── Cancelled ◄────── Reject ──┘       └── Return to previous stage
```

| Stage | What happens |
|-------|--------------|
| **Draft** | Employees, adjustments, and configuration are editable. Draft preview computes everything live so you see totals, warnings, and per-employee detail before committing. |
| **Process** | Runs the engine for every employee and persists results. Pre-process validation lists blockers; you may **exclude incomplete employees** to proceed with the rest. Hard-blocker alerts (missing tax engine, protected-pay hard block, negative net) stop the affected employees. |
| **Submit for Approval** | Enters the configured multi-stage **approval workflow** (per entity type, with stage approvers). Approvers can **Approve**, **Reject** (with reason, back to draft), or **Return to previous** stage. The moment a run is **Approved**, tax liabilities are generated per authority and rolled into that period's PAYE/SSNIT/NPRA tax forms (§20) — they're downloadable immediately via the run's **Files** action (§19, §20), not gated on payment. The approve action accepts a "post journal entries" flag which is recorded in the audit log — ⚠️ *the actual journal posting to the Finance module is not yet implemented.* |
| **Mark as Paid** | The terminal action. Triggers: loan balance decrements (per loan, only on real payment — never on drafts), pay-calendar advance (Regular runs only), and payment status updates. |
| **Cancel** | With reason, recorded in the audit log. |

Every transition writes an immutable **pay run audit log** entry (who, when, from-status, to-status, message), and the dedicated payroll log channel captures structured context.

---

## 17. Special Tax Engines

### Bonus Tax (Ghana Act 896 §5.1)

1. The annual cap is **15% of annual basic salary** (12 × monthly basic).
2. Bonuses **within** the cap (tracked cumulatively year-to-date) are taxed at a **5% final rate** — done, never touches PAYE.
3. The **excess** above the cap is added to the month's chargeable income and taxed at the **marginal PAYE rate** — the standard "add the excess to chargeable income" method, computed as `tax(reference + excess) − tax(reference)`.
4. The **reference** chargeable income (what the excess stacks on) is computed by running the full engine over a synthetic regular run for the bonus month — so it includes benefits, BIK, loan BIK, before-tax deductions, SSF, and reliefs with exact parity. The split across the regular run and the bonus run always reconciles to the single-pass total: *regular-run PAYE + bonus-run marginal PAYE = the PAYE you'd get taxing salary + excess together*.
5. The employee detail modal shows this transparently: a band-by-band table (income range, rate, regular income, regular PAYE, bonus excess this run, tax withheld this run) plus a reconciliation strip — **Regular run PAYE + This bonus run = Month total PAYE**.

### Overtime Tax

Overtime is carried as **earning adjustments flagged as overtime** (with hours) on a run; the engine then routes the tax:

- **Junior employee** (qualifying YTD income ≤ GH₵18,000): final tax of **5% on overtime up to 50% of monthly basic**, **10% on the portion above** — never enters PAYE.
- **Senior employee** (above the threshold): the overtime amount is **added to chargeable income** and taxed at PAYE marginal rates.
- The thresholds and rates come from the configured statutory item (Setup → Overtime Rules); a statutory fallback applies if the engine is not configured.

> ⚠️ The tax engine is fully functional, but there is **no pay-run screen yet for entering overtime** — overtime adjustment rows currently reach the engine via the API only. The Attendance → Overtime Records page is a *UI preview* (sample data) and does not feed payroll.

### Pension Excess (35% cap)

Total pension contributions (Tier 1 + 2 + 3, employee + employer, for items that *count toward the cap*) are compared to **35% of qualifying employment income**. Anything above the cap loses its pre-tax privilege: the excess is **routed back into chargeable income** and PAYE'd, with a `pension_threshold` alert.

---

## 18. Alerts & Validation

The engine separates **hard blockers** (the employee errors out) from **soft warnings** (paid, but flagged for review):

| Alert | Severity | Meaning |
|-------|----------|---------|
| `missing_income_tax_engine` | Hard | Employee resolves to no income-tax statutory item — fix Tax & Pension enrollment. |
| `protected_pay_floor_breach` | Hard or Soft | Per the rule's enforcement mode (§9). |
| Negative net pay | Hard | Deductions exceed gross. |
| Missing/zero salary or rate | Hard | Compensation setup incomplete. |
| `missing_tax_profile` / `missing_tin` | Soft | Tax profile gaps — PAYE still computes; filings will be incomplete. |
| `bik_cap_applied` | Soft | A BIK was capped at its monthly cap. |
| `bonus_threshold_breach` | Soft | YTD bonuses passed 15% of annual basic; excess routed to PAYE. |
| `junior_employee_threshold` | Soft | Overtime junior threshold reached. |
| `pension_threshold` | Soft | 35% pension cap exceeded; excess routed to PAYE. |
| `benefit/deduction_threshold_breach` | Soft | A configured catalog alert threshold was crossed. |
| `mandatory_item_exempted` | Soft | A mandatory statutory item is exempted for this employee. |
| `contract_renewal_warning` | Soft | Tracked contract is expiring within the alert threshold. |

Tax alerts are also persisted as first-class records (Pay run → alerts) with **acknowledgement** support, so finance can sign off on each flagged condition.

---

## 19. Payments & Disbursement

Disbursement is handled per pay run, via the **Files** action (Run Payroll tab once the run is Approved/Paid, or Payroll History tab once Paid) — not from a separate payments module.

### Generating the bank payment file

- **Files → Generic Bank Payment File** generates and downloads a single-sheet `.xlsx` matching the standard generic bank-upload template: a metadata block (company name, payroll period, payment description, currency), a header row, then one row per payable employee — `#, Employee ID, Employee Full Name, Department, Position, Account Number, Bank Name, Bank Sort Code, Bank Branch, Net Pay Amount, Payment Reference, Narration / Remarks, Email Address, Contact Number` — a bold TOTAL row, and a "{n} Employee(s)" count row.
- **Rows are sorted by bank name, then employee name**, so every payment going to the same bank sits together — easier for finance to verify or split by bank before submission.
- Mobile money payments share the same Bank Name / Account Number columns (network name in place of bank, wallet number in place of account number), so they sort into the same list naturally.
- **Cash-paid employees are excluded** from the file entirely (there's no bank destination to encode); employees missing required bank or mobile-money details are also excluded. Both are reported back as skip reasons in the generation response — not yet surfaced inside the Files modal itself (see §25).
- **Payment Reference is left as a dash** for finance to fill in manually — it's the company's own batch/payment reference, not a synthetic per-employee code.
- Every bank-file export is recorded in the pay run's audit trail.

### Other per-run payment actions

- **Per-employee payment status** — view and update each employee's payment status on the run; **mark all as paid** in one action.
- **Proof of payment** — upload payment evidence documents onto a paid run (stored on the run for audit).
- **Currency** — each run carries a currency code (defaults to the organization currency).

Marking the run **Paid** finalizes loan balances, advances the pay calendar (Regular runs only), and updates payment status — it does **not** gate PAYE/SSNIT/bank-file downloads, which are available the moment the run is **Approved** (§16, §20).

> ⚠️ The standalone **Payments** menu pages (Payment Batches, Bank Files, Mobile Money, Multi-Currency, Failed Payments) are still *UI previews only* — not wired to the backend. The real path for every payment-related download is the per-run **Files** action described above.

---

## 20. Taxes, Forms & Filings

When a pay run is **Approved**, the system generates **tax liabilities** — how much is owed to each authority (GRA, SSNIT, NPRA) for the period — with due dates derived from the **filing rules** (GRA 15th, SSNIT/NPRA 14th of the following month).

### One form per filing period, not one per pay run

A tax form aggregates **every pay run that shares the same reporting period** (by form type + statutory authority + period bucket) into a single form — e.g. a regular April run and a bonus run paid the same month both roll into one `GRA-PAYE-Apr-2026` form, matching how GRA/SSNIT actually expect one consolidated return per employer per month:

- Approving a pay run whose period bucket already has a **Pending** (not-yet-submitted) form for that authority **attaches** its liabilities to the existing form and recomputes the form's totals/employee lines from the full combined set — it does not create a duplicate.
- Approving a pay run whose period bucket already has a form that's **already locked** (Pending Approval or Filed) instead creates a clearly-flagged **supplementary** form (a `-SUPP` suffix on the form code, plus an `is_supplementary` flag) — an addendum to manually combine with the already-filed return, rather than silently mutating a submitted compliance record.

### Downloading PAYE / SSNIT / the bank file together

The **Files** action on a pay run (Run Payroll tab for Approved/Paid runs, Payroll History tab for Paid runs) opens one modal listing all three outputs for that run's filing period:

1. **GRA PAYE Schedule** — enabled the moment the period's income-tax form exists (i.e. right after approval).
2. **SSNIT Tier 1 File** — same, for the social-security form.
3. **Generic Bank Payment File** — enabled whenever the run itself is Approved/Paid (§19).

A muted note explains PAYE/SSNIT are "Generated automatically once this payroll is approved" when not yet available. Tax forms still flow through their own approval before submission, and the Taxes & Forms screens track each filing as pending/submitted/overdue, with Compliance → Statutory Filings showing the filing history.

> The GRA PAYE Schedule export was rebuilt for speed: large tax forms used to take minutes (and sometimes time out) clearing the template's unused placeholder rows one at a time. That cleanup is now a single bulk operation — near-instant, with byte-for-byte identical output.

---

## 21. Payslips

Payslips are fully implemented — every paid pay run employee has a downloadable PDF, generated on demand from the same persisted calculation snapshot the engine produced when the run was processed (it never recomputes).

### Downloading a payslip (admin path)

Open a **Paid** pay run → click an employee row to open their detail modal → **Download Payslip** (shown once the run is Paid and that employee's own payment status is Paid). The PDF includes:

- Organisation header/logo, pay period, pay date, payroll reference.
- Employee identity (name, code, department, position, TIN).
- Payment details (method, bank/branch or mobile network, masked account/wallet number).
- **Earnings** — cash earnings + cash benefits (BIK is excluded — it's taxed, never paid out).
- **Statutory Deductions** and **Other Deductions** shown as two separate groups. Deductions sharing the same name — most commonly **multiple active employer loans, which all post under the generic label "Employer Loan Repayment"** — are combined into one summed line, so the payslip doesn't show what looks like a duplicate row. The full per-loan balance and audit trail underneath (§12) is unaffected; this only changes the printed line.
- Gross pay, total deductions, **net pay**, and net pay spelled out in words.

### Self-service payslips

- The backend has a complete self-service payslip API scoped to the logged-in employee's own staff record (no admin permission required): list past payslips, view the current period's, and download any one of them — or all of them — as PDF.
- This is fully wired and working — just from a **different project**. The real "My Payslips" page lives in **kedebah_v2_pim**, the employee self-service portal (Payroll → Payslips): Current Payslip with a one-click download, plus Payslip History with period/pay-date/run-type filters, per-row download, and a "Download all matching (PDF)" bulk export. It calls this app's `/my/payslips/*` endpoints directly. (The Self-Service → My Payslips entry inside *this* app's own router is an unrelated, unused placeholder — the real page is the one in PIM.)

---

## 22. Reports & Exports

Available under **Reports** (each exportable to **PDF and Excel** via the Export dropdown):

| Report | What it answers |
|--------|------------------|
| **Payroll Summary** | Gross/net/statutory totals for a run or period. |
| **Statutory Remittance** | Amounts due per authority (GRA/SSNIT/NPRA) for remittance. |
| **PAYE Reconciliation** | Per-employee PAYE detail vs remitted. |
| **Variance Comparison** | Period-over-period differences (who changed and by how much). |
| **Annual Payroll** | Full-year totals per employee. |
| **Year-End Tax** | Year-end tax statements. |
| **Audit & Compliance** | Action trail across payroll, filterable and exportable. |
| **Statutory Config Versions** | History of statutory configuration changes (who changed which rate/band when). |

Payslips are **not** one of these Reports Centre exports — they're generated per employee from the pay run / self-service flow described in [§21](#21-payslips), not from this screen. The full per-employee calculation breakdown — basic, each benefit/earning, each BIK (taxed, not paid), each deduction, Tier 1, PAYE, bonus/overtime tax, loan repayment, and net pay — also lives on the **pay run employee detail view** (click an employee on any run), which matches the calculation exactly, including the band-by-band PAYE table and the **Download Payslip** action.

---

## 23. Self-Service & Compliance

- **Compliance** (implemented): audit logs (every mutation attributed and timestamped), change history, approval trails, statutory filing history, and compliance alerts — all backed by the payroll audit trail. The dual audit trail (pay-run lifecycle log + system-wide audit trail) is immutable by design.
- **Employee self-service — partially implemented.** **Payslips work end-to-end**: a real backend API (list / current / download, scoped to the logged-in employee — §21) plus a real working frontend — but that frontend is the **kedebah_v2_pim** employee portal's Payroll → Payslips page, not anything inside this app. **My Earnings**, **My Loans**, and **Queries** remain placeholder pages with no backend behind them at all, in either project. The employee-facing portal overall is still partial, with payslips the one fully-connected piece.

---

## 24. Quick Reference Tables

### What each run type includes

| Component | Regular | Bonus | Off-Cycle | Termination |
|-----------|---------|-------|-----------|-------------|
| Basic salary | ✅ | ❌ | flag (default ❌) | ✅ |
| Recurring benefits | ✅ | ❌ | flag | ❌ |
| Recurring deductions | ✅ | ❌ | flag | ❌ |
| BIK + loan BIK + repayments | ✅ | benefits-off ⇒ no BIK; loans still resolve on included pay | per flags | ✅ loans |
| Reliefs | ✅ | ✅ (via reference) | ✅ | ✅ |
| Tier 1/2/3 | ✅ | 0 (no basic) | per basic flag | ✅ |
| PAYE | ✅ | excess only (marginal) | on included income | ✅ |
| Bonus tax | — | ✅ | — | — |
| Overtime tax | on overtime adjustments | on overtime adjustments | per adjustments | per adjustments |
| One-time/adjustment lines | overtime only | overtime only | ✅ | ✅ |
| Advances the calendar on Paid | ✅ | ❌ | ❌ | ❌ |

### Where things are configured

| I want to… | Go to |
|------------|-------|
| Change pay frequency / pay dates | Payroll Setup → Cycles (effective from next open period) |
| Add an allowance everyone gets | Setup → Earnings/Benefits (scope: all employees) |
| Add a company-car taxable benefit | Setup → Benefits, Nature = Non-Cash, set rate/base/cap |
| Add a bank/branch not in the seeded list | Settings → Bank Setup → Add Bank / Add Branch |
| Guarantee minimum take-home | Setup → Protected Pay Rules |
| Change a tax rate or band | Settings → Tax & Statutory → Statutory Items (rate versions/bands) |
| Exempt an expatriate from SSNIT | Employee → Tax & Pension → Exempt (reason required) |
| Give a personal tax relief | Employee → Tax & Pension → Tax Reliefs |
| Pay overtime | Overtime adjustment on the run — tax rules in Setup → Overtime Rules (⚠️ no entry screen yet, API-only — see §25) |
| Issue a staff loan | Management → Loans (BIK + repayments are automatic) |
| One-time correction for one month | An Off-Cycle run with the amounts entered as one-time lines |
| Download PAYE / SSNIT / the bank payment file | Pay run → **Files** action (Run Payroll tab once Approved/Paid, or Payroll History tab once Paid) |
| Download an employee's payslip | A Paid pay run → employee row → **Download Payslip** |
| See why a PAYE figure is what it is | Pay run → employee row → detail modal (band-by-band breakdown) |

### Key Ghana figures (pre-loaded, monthly)

- PAYE bands: 0% ≤ 490 · 5% ≤ 600 · 10% ≤ 730 · 17.5% ≤ 3,896.67 · 25% ≤ 19,896.67 · 30% ≤ 50,416.67 · 35% above.
- Tier 1: 5.5% employee / 13% employer of basic. Tier 2: 0% / 5%. Tier 3: per scheme.
- Bonus: 5% final within 15% of annual basic; excess at marginal PAYE.
- Overtime junior threshold: GH₵18,000 qualifying YTD; 5% within 50% of basic, 10% above.
- Pension cap: 35% of qualifying employment income.
- Filings: GRA by the 15th, SSNIT/NPRA by the 14th of the following month.

---

## 25. Implementation Status — What Is Not Yet Functional

Everything described in sections 1–24 is implemented and working **except** the items below. These appear in the application menu (some show sample data so the intended design is visible) but are **not yet wired to the backend** — do not rely on them for real payroll operations.

| Area | Pages / Features | Status | What to use instead (today) |
|------|------------------|--------|------------------------------|
| **Employee — Cost Center tab** | Cost-center / project allocations per employee | UI preview; nothing is saved, cost-center list is sample data | — (pending; cost accounting not yet active) |
| **Employee — Payroll Overrides tab** | One-time period-scoped overrides | UI preview; nothing is saved | Run adjustments: ad-hoc earning/deduction lines on an Off-Cycle or Termination run |
| **Reports — Payslips page** | Reports → Payslips | Not implemented — calls a report endpoint that doesn't exist; the menu link otherwise just redirects to the Reports Centre | Real payslips: pay run → employee detail → **Download Payslip** (§21) |
| **Reports — Earnings & Deductions / Cost Center / Analytics** | Report pages under Reports | Not implemented — these menu links redirect to the Reports Centre | The 8 implemented reports in §22, all with PDF/Excel export |
| **AI Insights** | AI Insights report/chat | UI preview; no backend | — |
| **Payments submenu** | Payment Batches, Bank Files, Mobile Money, Multi-Currency, Failed Payments pages | UI previews | Per-run payment actions: **Files** action for the bank payment file, per-employee payment status, mark all paid, proof-of-payment upload (§19) |
| **Loans submenu** | Loan Requests, Eligibility, Approval, Active Loans, Repayments pages | UI previews | Management → Loans (fully functional, drives BIK + repayments in payroll) |
| **Self-service — My Earnings / My Loans / Queries** | Self-Service menu (this app and kedebah_v2_pim) | Placeholder pages, no backend at all in either project | — (employee-facing portal pending; My Payslips is the one piece that's fully working, via kedebah_v2_pim — §21, §23) |
| **Bank payment file — skip reasons** | Employees excluded from the generated bank file (missing bank details, cash payment, etc.) | The reasons are computed by the API but not yet displayed in the Files modal UI | Check the employee's Payment Details, or the pay run's employee list/status, to see why they were excluded |
| **Attendance** | Attendance Summary, Overtime Records, Leave Without Pay, Shifts, Imports | Sample data; does not feed payroll | Overtime reaches the engine via run adjustments (currently API-only — no entry screen yet) |
| **Bonuses & Commissions page** | Employees → Bonuses & Commissions | Sample data | Bonus pay runs (§15) — fully functional |
| **Integrations pages** | HR/PIM, Finance ERP, Banks, Statutory APIs, Attendance, Import/Export, AI | UI previews | Employee Sync from HRIS works (Employees → Sync) |
| **Journal posting to Finance** | "Post journal entries" on approval | Flag is recorded in the audit log only; no entries are posted to Finance yet | — |
| **Deduction carryover recovery** | Auto-recovering protected-pay-deferred deductions in later runs | Carryovers are recorded but not auto-recovered | Apply the recovery manually as a run adjustment |
| **Overtime entry screen** | Adding overtime to a pay run from the UI | Not yet built — overtime adjustments are API-only | — (engine + Overtime Rules config are fully functional) |
| **Mid-cycle salary proration** | Automatic old/new salary split when a change takes effect mid-period | Not implemented — the UI warns, but the engine pays the full period at the effective salary | Handle the split manually via an off-cycle adjustment |
