# Phase 2 — Requirements Catalog

**Source of truth:** `qa-workspace/docs/PAYROLL_COMPLETE_SYSTEM_GUIDE.md`
**Rule:** Every requirement is traceable to a PRD section. No invented behaviour. Documented gaps
(PRD §25) are captured as **verify-only** requirements (assert the documented preview/redirect/not-saved
behaviour, never full functionality).

## Field legend
- **ID** `REQ-<MODULE>-<nnn>` · **Pri** P1 critical / P2 high / P3 medium / P4 low · **Risk** Critical/High/Medium/Low
- Each row encodes: Module (section) · Feature · Business Rule + Expected Behaviour · Validation · Dependencies · Acceptance Criteria · Priority · Risk.
- **AC** = Acceptance Criteria (the pass condition a test asserts).

---

## AUTH — Authentication & Access Control (PRD §2)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-AUTH-001 | Multi-identifier login | One identifier field accepts email/username/phone; auto-detect: 10-digit→phone, `@`→email, alphanumeric→username | Identifier type detection | — | Each identifier type logs in the same user with correct password | P1 | High |
| REQ-AUTH-002 | Successful login session | Stores access token + permission set in auth store (cookies + localStorage) | Token present post-login | AUTH-001 | After login, token + permissions persisted; protected routes accessible | P1 | High |
| REQ-AUTH-003 | Redirect after expiry | Router redirects to originally-requested page via `?redirect=` after re-login | redirect param honored | AUTH-002 | Mid-navigation expiry → re-login returns to original page | P2 | Medium |
| REQ-AUTH-004 | Logout | Calls logout endpoint, clears session, returns to Login | Session cleared | AUTH-002 | Post-logout, protected routes redirect to login; token gone | P1 | High |
| REQ-AUTH-005 | Invalid credentials | Wrong password / unknown identifier rejected | Negative auth | — | Invalid login shows error, no token issued | P1 | High |
| REQ-AUTH-006 | Permission set per resource | Each resource has `view/create/edit/delete-*` under named group | — | — | Permissions enumerated per module group | P2 | High |
| REQ-AUTH-007 | Role: Payroll Admin | Full 4-perm set on every module | — | AUTH-006 | Admin can view/create/edit/delete every module | P1 | High |
| REQ-AUTH-008 | Role: Payroll Manager | Full CRUD on operational modules; **view-only** on Banks (no edit/delete) | — | AUTH-006 | Manager cannot edit/delete Banks; can on operational modules | P1 | High |
| REQ-AUTH-009 | Frontend route/menu gating | UI hides menu items + blocks routes user lacks permission for | — | AUTH-006 | Unpermitted menu items hidden; route blocked in UI | P2 | Medium |
| REQ-AUTH-010 | Backend API enforcement | API independently enforces same permission on every route (security boundary) | Authorization | AUTH-006 | Direct API call without permission → 403 even when UI hid the button | P1 | Critical |
| REQ-AUTH-011 | Self-service gate | Staff self-service scoped to own staff record, no admin permission | Scope isolation | — | Employee reaches own pay info; cannot reach others' | P1 | High |

---

## CYCLE — Pay Schedules & Pay Calendar (PRD §4)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-CYCLE-001 | Frequency options | Weekly / Bi-Weekly / Semi-Monthly / Monthly / Quarterly | Enum | — | All 5 frequencies selectable and generate correct calendars | P1 | High |
| REQ-CYCLE-002 | First period anchor | First period start/end anchors calendar; preserves shape (calendar-aligned or custom e.g. 15th–14th) on roll forward | Date math | CYCLE-001 | Custom-shaped period preserved across rolls | P1 | High |
| REQ-CYCLE-003 | Pay date offset | N days after period end (0 = last day) | Numeric | CYCLE-002 | Pay date = period end + offset | P1 | High |
| REQ-CYCLE-004 | Cutoff days | N days before period end to lock changes | Numeric | CYCLE-002 | Cutoff computed from period end | P3 | Low |
| REQ-CYCLE-005 | Rolling horizon buffer | Always 1 Current + 3 Scheduled ahead; auto-created | — | CYCLE-001 | After setup, exactly 1 Current + 3 Scheduled exist | P1 | High |
| REQ-CYCLE-006 | Period lifecycle | Scheduled → Current → Completed | State machine | CYCLE-005 | Period status transitions follow lifecycle | P1 | High |
| REQ-CYCLE-007 | Regular-Paid advances calendar | Marking Regular run Paid → period Completed, next Scheduled promoted to Current, buffer topped | — | CYCLE-005, RUN, LIFE | Paying Regular run advances exactly one period + refills buffer | P1 | Critical |
| REQ-CYCLE-008 | Non-regular runs don't advance | Bonus/Off-Cycle/Termination Paid does NOT advance calendar | — | CYCLE-007 | Paying non-regular run leaves Current period unchanged | P1 | High |
| REQ-CYCLE-009 | Create-run default period | Create Regular Pay Run modal defaults to Current (next open) period | — | CYCLE-007 | Modal pre-selects Current period | P2 | Medium |
| REQ-CYCLE-010 | Weekend pay-date shift | Weekend pay date shifts back to preceding Friday | Date math | CYCLE-003 | Period ending Sun 31 May 2026 pays Fri 29 May | P2 | High |
| REQ-CYCLE-011 | Monthly month-end snap | Monthly snaps to month-end when month-aligned | Date math | CYCLE-001 | Jan→Feb→Mar end dates correct incl. 28/29/30/31 | P1 | High |
| REQ-CYCLE-012 | Semi-monthly split | Alternates 1st–15th / 16th–end, handles short Feb | Date math | CYCLE-001 | Feb 16–28/29 correct | P2 | High |
| REQ-CYCLE-013 | Quarterly +3 months | Quarterly adds three calendar months | Date math | CYCLE-001 | Q period spans 3 months | P3 | Medium |
| REQ-CYCLE-014 | Frequency change effective-dated | Only future Scheduled periods with no runs deleted/regenerated under new frequency | Guard | CYCLE-005 | Changing frequency regenerates only empty future Scheduled periods | P1 | High |
| REQ-CYCLE-015 | History preservation on change | Completed/Current/period-with-run never rewritten | Guard | CYCLE-014 | Periods with runs untouched after frequency change | P1 | High |

---

## PG — Pay Groups (PRD §5)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-PG-001 | Pre-populate run | Creating a run for a pay group adds its members automatically | — | EMP | Group run pre-loaded with members only | P1 | High |
| REQ-PG-002 | No-group regular run | Regular run with no pay group adds all employees with active salary (eligible at period end) | Eligibility | CYCLE, EMP | Expired-compensation employees excluded | P1 | High |
| REQ-PG-003 | Shared assignments | Pay-group benefit/deduction items apply to all members without per-employee enrollment | — | CAT | Group-assigned item appears for every member | P1 | High |
| REQ-PG-004 | Group protected-pay rule | A pay group can carry a protected-pay rule for all members | — | PROT | Group rule applies to members | P2 | Medium |
| REQ-PG-005 | Layered resolution | Resolution order all-employees → department → pay group → individual | — | CAT | "In Effect" view shows correct final set | P1 | High |
| REQ-PG-006 | Pay group CRUD | Create/edit/delete pay groups, manage membership | CRUD + perms | AUTH | CRUD respects permissions | P2 | Medium |

---

## BANK — Bank Setup (PRD §6)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-BANK-001 | Seeded reference data | 27 banks, 1,370+ branches, real 6-digit sort codes pre-loaded | Data integrity | — | Seed counts + sort codes present | P2 | Medium |
| REQ-BANK-002 | System-record identity lock | Seeded bank/branch name + sort code never editable/deletable | Guard | BANK-001 | Edit/delete of seeded identity blocked (UI + API) | P1 | High |
| REQ-BANK-003 | System-record status toggle | Only status (Active/Inactive) changeable on seeded records | — | BANK-002 | Status toggles; inactive branch removed from new selections | P2 | Medium |
| REQ-BANK-004 | Add bank/branch | Full CRUD modal: bank name/short name/institution code; branch sort code/name | CRUD | AUTH | New bank/branch created | P2 | Medium |
| REQ-BANK-005 | Bank name unique | Bank name validated unique | Uniqueness | BANK-004 | Duplicate bank name rejected | P2 | Medium |
| REQ-BANK-006 | Branch sort code unique | Branch sort code validated unique | Uniqueness | BANK-004 | Duplicate sort code rejected | P2 | High |
| REQ-BANK-007 | Non-seeded editable | Newly-added banks/branches fully editable/deletable | — | BANK-004 | Non-seeded record edits succeed | P3 | Low |
| REQ-BANK-008 | Delete-bank guard | Cannot delete a bank that still has branches | Relationship guard | BANK-004 | Delete blocked with branches present | P2 | Medium |
| REQ-BANK-009 | Delete-branch guard | Cannot delete a branch linked to an employee's payment details | Relationship guard | EMP | Delete blocked when linked to employee | P2 | High |
| REQ-BANK-010 | No free-text bank | Employee bank details = cascading Bank→Branch picker only, no free text | — | EMP | No free-text bank entry exists anywhere | P1 | High |
| REQ-BANK-011 | Manager view-only on Banks | Payroll Manager cannot edit/delete banks | Authz | AUTH-008 | Manager edit/delete blocked (UI + API) | P1 | High |

---

## CAT — Earnings, Benefits & Deductions Catalog (PRD §7)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-CAT-001 | Component category | Earning → gross + `earning` line; Benefit → `benefit` line; both add to pay | — | — | Category routes the line correctly | P1 | High |
| REQ-CAT-002 | Benefit nature | Cash → benefits engine; Non-Cash → BIK tax pipeline | — | BIK | Nature routes processing path | P1 | High |
| REQ-CAT-003 | Benefit calc methods | Fixed / %Basic / %Cash Emoluments (basic + fixed cash benefits) | Calc | — | Each method computes correct amount | P1 | Critical |
| REQ-CAT-004 | Benefit tax treatment | Taxable → PAYE base; Non-Taxable → excluded | — | CAL | Taxable flag affects PAYE base | P1 | Critical |
| REQ-CAT-005 | Effective window (catalog) | Effective From/To catalog lifecycle | Date | — | Out-of-window items skipped | P2 | Medium |
| REQ-CAT-006 | Status active/inactive | Inactive items skipped entirely | — | — | Inactive item never applied | P2 | Medium |
| REQ-CAT-007 | Alert thresholds | Optional caps raise soft warning when crossed during a run | — | ALRT | `*_threshold_breach` warning raised | P3 | Medium |
| REQ-CAT-008 | Deduction types | Statutory/Voluntary/Loan/Benefit/Custom classification | Enum | — | Type stored for reporting | P3 | Low |
| REQ-CAT-009 | Deduction calc methods | Fixed / %Basic / %Cash Emoluments / **%Net Pay** (second pass) | Calc | CAL | %Net computed after tax + protected pay | P1 | Critical |
| REQ-CAT-010 | Deduction tax treatment | Before Tax reduces PAYE base; After Tax net only; default After Tax | Default | CAL | Before-tax reduces PAYE; default applied when unspecified | P1 | Critical |
| REQ-CAT-011 | Deduction priority | Lower priority kept first; higher deferred first under protected pay | — | PROT | Trim order follows priority | P2 | High |
| REQ-CAT-012 | Eligibility scope | Narrow item to department/pay group/person | Scope | PG | Scoped item applies only to scope | P1 | High |
| REQ-CAT-013 | Per-employee override | Override amount/% + effective from/to per person | Date | EMP | Override window respected vs period | P1 | High |
| REQ-CAT-014 | Catalog approval workflow | Changes routed through approval before live, activity trail | Workflow | AUTH | Pending change not live until approved | P2 | Medium |
| REQ-CAT-015 | Catalog CRUD | Create/edit/delete catalog items | CRUD + perms | AUTH | CRUD respects permissions | P2 | Medium |

---

## BIK — Benefits in Kind (PRD §8)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-BIK-001 | BIK = non-cash benefit | Benefit with Nature=Non-Cash; params on the benefit (rate %, base, monthly cap, tax treatment) | — | CAT | Non-cash benefit treated as BIK | P1 | High |
| REQ-BIK-002 | BIK value formula | Fixed amount OR rate% × base | Calc | — | Value = configured formula | P1 | Critical |
| REQ-BIK-003 | BIK base options | Base ∈ {Basic, Cash Emoluments excl BIK, Cash Emoluments incl BIK, Qualifying Employment Income} | Calc | CAL | Each base option computes correctly | P1 | Critical |
| REQ-BIK-004 | Monthly cap | Value capped at monthly cap when set | Calc | — | Capped value applied when computed > cap | P1 | High |
| REQ-BIK-005 | Cap warning | `bik_cap_applied` soft warning shows computed vs applied | — | ALRT | Warning raised on cap bite | P2 | Medium |
| REQ-BIK-006 | Taxable BIK not paid | Adds to PAYE base, never paid in cash; `bik` line inflates chargeable income not net | — | CAL, SLIP | BIK increases tax, not net pay; excluded from payslip earnings | P1 | Critical |
| REQ-BIK-007 | BIK eligibility resolve | Same eligibility engine; country-scoped BIK only for matching tax profile | Scope | CAT | Scoped/auto-enrolled BIK applies without per-employee row | P2 | Medium |
| REQ-BIK-008 | BIK pipeline position | Processed inside tax pipeline before percentage statutory items | Sequence | CAL | Tier/PAYE see correct bases | P1 | Critical |

---

## PROT — Protected Pay Rules (PRD §9)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-PROT-001 | Floor modes | Absolute amount / %gross / %basic | Calc | — | Each mode computes correct floor | P1 | High |
| REQ-PROT-002 | Hard Block enforcement | Employee errors out; run cannot process until deductions reduced | Block | CAL | Hard-block employee blocks until fixed | P1 | Critical |
| REQ-PROT-003 | Partial Apply + Alert | Trim deductions by priority until floor met; carryovers recorded; alert raised | Calc | CAT-011 | Net ≥ floor after trim; carryover recorded; alert raised | P1 | Critical |
| REQ-PROT-004 | Alert Only | Nothing changed, warning raised | — | ALRT | Net unchanged; warning present | P2 | Medium |
| REQ-PROT-005 | Statutory never trimmed | PAYE, Tier 1 never trimmed — only catalog deductions deferrable | Invariant | CAL | Statutory amounts intact after trim | P1 | Critical |
| REQ-PROT-006 | Priority trim order | Highest-priority deductions survive longest | — | CAT-011 | Trim removes lowest priority first | P1 | High |
| REQ-PROT-007 | Carryover recording | Deferred amounts recorded as deduction carryovers | — | — | Carryover stored against run | P2 | High |
| REQ-PROT-008 | Carryover auto-recovery NOT done | ⚠️ Documented gap: not auto-recovered (manual run adjustment) | Verify-only | §25 | System does NOT auto-recover; matches PRD | P3 | Medium |
| REQ-PROT-009 | Audit storage | Rule, floor, net before/after, amount deferred stored per employee | — | CAL | Protected-pay block present in snapshot | P2 | Medium |

---

## TAX — Tax & Statutory Configuration (PRD §10, §24)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-TAX-001 | Statutory item config | Engine key, stage+sequence, base amount type, behaviour switches, cumulative tracking+window, rate versions, bands | — | — | All fields configurable | P1 | High |
| REQ-TAX-002 | Ghana seed verification | PAYE 7 bands, Tier1 5.5/13, Tier2 0/5, Bonus, Overtime, Casual 5%, Pension Excess pre-loaded | Data integrity | — | Seed values match §10/§24 exactly | P1 | Critical |
| REQ-TAX-003 | Rate versions dated | Rate changes dated, not overwritten | — | TAX-001 | New rate version preserves history | P2 | High |
| REQ-TAX-004 | Assignment resolver | mandatory + auto-enrolled (matching) + explicit enroll − explicit exempt | Resolver | EMP | Resolved item set matches formula | P1 | Critical |
| REQ-TAX-005 | No silent fallback | No income-tax engine → hard blocker `missing_income_tax_engine` | Block | CAL, ALRT | Employee with no engine blocks run | P1 | Critical |
| REQ-TAX-006 | Eligibility OR rules | Scope by country/employment type/pay group/department/staff; combine with OR | Scope | — | Any matching rule enrolls item | P2 | High |
| REQ-TAX-007 | Tax presets | Bundle items with Enroll/Exempt/Suggest; one-click new-hire setup | — | EMP | Preset enrolls all items in one action | P1 | High |
| REQ-TAX-008 | Per-employee rate override | Override rate per enrollment | Calc | EMP | Override rate used in calc | P2 | High |
| REQ-TAX-009 | Voluntary schemes (Tier 3) | Configure trustees, rates, min/max contributions | Calc | — | Scheme params drive Tier 3 | P2 | Medium |
| REQ-TAX-010 | Exemption requires reason | Explicit exemption needs documented reason | Validation | TAX-004 | Exemption without reason rejected | P2 | Medium |
| REQ-TAX-011 | Mandatory exemption warning | Exempting mandatory item → `mandatory_item_exempted` soft warning | — | ALRT | Warning raised | P3 | Medium |
| REQ-TAX-012 | Filing rules | GRA 15th, SSNIT/NPRA 14th of following month, monthly | Date | FORM | Due dates derived correctly | P2 | High |
| REQ-TAX-013 | Statutory config CRUD + perms | CRUD gated by tax-setup permissions | CRUD + perms | AUTH | CRUD respects permissions | P2 | Medium |

---

## RELF — Tax Reliefs (PRD §11)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-RELF-001 | Fixed Annual relief | annual ÷ 12 | Calc | — | GH₵1,200/yr → GH₵100/mo | P1 | High |
| REQ-RELF-002 | Per Unit Annual relief | annual × units ÷ 12, capped at max units | Calc | — | GH₵600/child × 3 max → GH₵150/mo at 3 | P1 | High |
| REQ-RELF-003 | % Assessable Income relief | % of month's assessable income | Calc | CAL | Disability 25% of assessable | P1 | High |
| REQ-RELF-004 | SSF Contribution relief | Auto from actual Tier1+Tier2 EE contributions this month (no manual) | Calc | CAL | SSF relief = Tier1+Tier2 EE | P1 | High |
| REQ-RELF-005 | Reliefs run first | Reliefs step runs first; later engines see trimmed base | Sequence | CAL | Base reduced before all engines | P1 | Critical |
| REQ-RELF-006 | Per-employee assignment | Reliefs assigned per employee (Tax & Pension tab) | — | EMP | Relief tied to individual | P2 | Medium |

---

## LOAN — Employer Loans (PRD §12)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-LOAN-001 | Loan management | Loans created/tracked at Management → Loans | CRUD | AUTH | Loan CRUD functional | P1 | High |
| REQ-LOAN-002 | Loan BIK | Interest below reference rate → monthly taxable subsidy as `bik` line "Employer Loan BIK" (taxed, not paid) | Calc | BIK, CAL | Loan BIK adds to chargeable income only | P1 | Critical |
| REQ-LOAN-003 | Repayment deduction | Per-period repayment deducted from net (after tax), clamped to remaining balance | Calc | CAL | Repayment ≤ remaining balance | P1 | Critical |
| REQ-LOAN-004 | Auto-stop when repaid | Loan can auto-stop when repaid; else continues while balance remains | — | LOAN-003 | No repayment after balance 0 | P2 | High |
| REQ-LOAN-005 | Balance decrement on Paid only | On Mark Paid, balances decrement by repayments actually taken; never on drafts | Invariant | LIFE | Draft does not move balance; Paid does | P1 | Critical |
| REQ-LOAN-006 | Independent per-loan tracking | Each loan balance decremented independently | — | LOAN-005 | Multiple loans tracked separately | P1 | High |
| REQ-LOAN-007 | Combined payslip line | Multiple loans show as one "Employer Loan Repayment" line; per-loan detail in audit | — | SLIP | Payslip combines; audit splits | P2 | Medium |
| REQ-LOAN-008 | Loan exemption assessment | Eligibility resolver determines BIK exemption | Resolver | — | Exempt loan → no BIK | P2 | Medium |
| REQ-LOAN-009 | Loans submenu preview | ⚠️ Gap: Requests/Eligibility/Approval/Active/Repayments are UI previews only | Verify-only | §25 | Submenu pages are previews; real fn at Management→Loans | P3 | Low |

---

## EMP — Employee Setup (PRD §13)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-EMP-001 | Add Employee (multi-step) | personal → job → compensation → payment; creates in HR + payroll | Form validation | — | Employee created end-to-end | P1 | High |
| REQ-EMP-002 | Bulk Import | Excel template w/ reference dropdown tabs; validated preview; background chunked (10,000+); Import History | Validation | — | Preview validates; chunked processing; history tracked | P2 | High |
| REQ-EMP-003 | Sync from HRIS | Registers existing HR staff for payroll | — | — | Synced staff appear in payroll | P2 | Medium |
| REQ-EMP-004 | Monthly compensation | basic earning = basic_salary; requires Base Salary | Required | CAL | Monthly basic = base salary | P1 | High |
| REQ-EMP-005 | Daily compensation | daily_rate × days_per_pay_period; requires both | Calc | CAL | Daily basic computed | P1 | High |
| REQ-EMP-006 | Hourly compensation | hourly_rate × hours_per_pay_period; requires both | Calc | CAL | Hourly basic computed | P1 | High |
| REQ-EMP-007 | Zero/missing rate error | Zero/missing rate or qty → calculation error (flagged, not paid 0) | Validation | CAL, ALRT | Employee flagged Error, not paid 0 | P1 | Critical |
| REQ-EMP-008 | Bank Transfer payment | Requires Bank+Branch (master list, no free text) + Account Number + Account Name | Required | BANK | All four required; no free text | P1 | High |
| REQ-EMP-009 | Mobile Money payment | Requires Number + Network; **Account Name NOT required** | Required | — | MoMo accepts without account name | P1 | High |
| REQ-EMP-010 | Cash payment | Nothing further required | — | — | Cash employee saves with no extra fields | P2 | Low |
| REQ-EMP-011 | Cascading Bank→Branch picker | Pick bank first then branch; branch supplies sort code | — | BANK | Branch selection captures sort code | P1 | High |
| REQ-EMP-012 | Masked sensitive numbers | Account/MoMo numbers masked (last 4, eye to reveal) | Masking | — | Numbers masked by default | P2 | Medium |
| REQ-EMP-013 | Tab: Payroll Profile | Readiness indicator + missing-field checklist | — | EMP-019 | Checklist reflects missing fields | P2 | Medium |
| REQ-EMP-014 | Tab: Salary Assignment | Base/rates, structure, effective dates; mid-cycle date warns; ⚠️ no auto-proration (full period at effective salary) | Verify-only(proration) | §25 | Mid-cycle warns; engine pays full period | P1 | High |
| REQ-EMP-015 | Tab: Bank & Payment | Per payment-method validation (EMP-008/009/010) | Validation | EMP-008 | Validation matches method | P1 | High |
| REQ-EMP-016 | Tab: Tax & Pension | TIN, NHIS, tax profile (contract tracking + renewal alerts), enroll/exempt/preset, rate overrides, Tier 3 opt-in, reliefs | — | TAX, RELF | All sub-features present | P1 | High |
| REQ-EMP-017 | Tab: Cost Center | ⚠️ Gap: UI preview, allocations must total 100% but NOT persisted; sample list | Verify-only | §25 | Nothing saved; matches PRD | P3 | Low |
| REQ-EMP-018 | Tab: Benefits & Deductions | Direct assignments + resolved "In Effect" view (direct + group + dept + auto) | Resolver | CAT, PG | In Effect shows resolved set | P1 | High |
| REQ-EMP-019 | Tab: Payroll Overrides | ⚠️ Gap: UI preview, not persisted; use run adjustment instead | Verify-only | §25 | Nothing saved; matches PRD | P3 | Low |
| REQ-EMP-020 | Readiness gating | Needs salary/rate + payment method/details + mandatory statutory; missing TIN = warning not blocking | Validation | TAX | Incomplete employee not run-ready; TIN warns only | P1 | High |
| REQ-EMP-021 | Exclude incomplete on Process | Process can exclude incomplete employees instead of blocking whole run | — | LIFE | Incomplete excluded, rest proceed | P2 | High |

---

## CAL — Calculation Engine (PRD §14) — money-critical

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-CAL-001 | Basic earning resolution | From compensation type (monthly / daily×days / hourly×hours) | Calc | EMP | Basic matches type formula | P1 | Critical |
| REQ-CAL-002 | Run-type flag resolution | {basic, benefits, deductions} inclusion per run type | — | RUN | Flags match run-type table | P1 | High |
| REQ-CAL-003 | Bonus amount | Fixed or % of basic (bonus runs) | Calc | RUN | Bonus = configured | P1 | High |
| REQ-CAL-004 | Recurring benefits resolution | Scope-resolved, override windows; earnings vs benefits; taxable tracked | Calc | CAT | Correct benefits applied | P1 | Critical |
| REQ-CAL-005 | Recurring deductions resolution | Before/after-tax split; %-of-net deferred to pass 2 | Calc | CAT | Correct deductions; %-net deferred | P1 | Critical |
| REQ-CAL-006 | Ad-hoc earnings | Off-cycle one-time + adjustments (overtime rows); dedupe catalog; no-amount catalog rows inherit catalog amount | Calc | RUN | Dedup + inherit behaviour correct | P1 | High |
| REQ-CAL-007 | Gross pay | basic + bonus + extra earnings + cash benefits | Calc | CAL-001..006 | Gross = sum exactly | P1 | Critical |
| REQ-CAL-008 | Ad-hoc deductions | Off-cycle/termination with tax treatment | Calc | RUN | Applied with correct treatment | P1 | High |
| REQ-CAL-009 | Tax pipeline order | a Reliefs → b BIK → c Loans → d %items → e Bonus → f Overtime → g Pension excess → h PAYE → i Flat → j Alerts | Sequence | RELF,BIK,LOAN,STAX,PAYE | Pipeline executes in exact order | P1 | Critical |
| REQ-CAL-010 | Protected pay floor step | Block / trim+carryover / alert per rule | Calc | PROT | Floor enforced per rule | P1 | Critical |
| REQ-CAL-011 | %-of-net second pass | Computed on approximate net after tax/protected pay | Calc | CAT-009 | %-net uses post-tax net | P1 | High |
| REQ-CAL-012 | Net pay | gross − total deductions − employee statutory; negative = error | Calc | — | Net exact; negative blocks | P1 | Critical |
| REQ-CAL-013 | Employer cost | gross + employer statutory (Tier1 13%, Tier2 5%, Tier3 ER) + employer-only benefits | Calc | — | Employer cost exact | P1 | High |
| REQ-CAL-014 | Per-employee status | Calculated / Warning / Error | — | ALRT | Status reflects outcome | P1 | High |
| REQ-CAL-015 | Snapshot storage | Full snapshot (chargeable/qualifying income, BIK, reliefs, protected-pay, traces) stored; modal + payslip read it | — | SLIP | Snapshot powers modal + payslip; no recompute | P1 | High |
| REQ-CAL-016 | Rounding consistency | Rounding applied consistently across components/totals | Calc | — | Totals = sum of rounded lines | P2 | High |

---

## RUN — Payroll Run Types (PRD §15, §24)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-RUN-001 | Regular run inclusion | basic ✅, benefits ✅, deductions ✅, full statutory, loans, BIK, reliefs; overtime adj only | Contract | CAL | Matches Regular column | P1 | Critical |
| REQ-RUN-002 | Regular population | No pay group → all active-salary employees eligible at period end | Eligibility | PG | Population correct | P1 | High |
| REQ-RUN-003 | Bonus run inclusion | basic ❌, benefits ❌, deductions ❌; bonus tax; Tier1/2/3 = 0 (no basic) | Contract | STAX | Matches Bonus column | P1 | Critical |
| REQ-RUN-004 | Bonus period optional | May omit period; bonus tax keys off pay-date year for annual cap | — | STAX | No-period bonus run computes | P2 | High |
| REQ-RUN-005 | Off-cycle default | Pays only amounts entered (one-time + adjustments) | Contract | CAL | Defaults to entered-only | P1 | High |
| REQ-RUN-006 | Off-cycle flags | Benefits Yes/No, Deductions Yes/No, Regular salary Yes/No (badges) | Flags | CAL | Each flag includes the component | P1 | High |
| REQ-RUN-007 | Off-cycle date range | Carries its own entered date range | Date | — | Range stored on run | P2 | Medium |
| REQ-RUN-008 | Termination inclusion | basic ✅, full statutory; NO recurring benefits/deductions; entitlements/recoveries as explicit adjustments; records last working day | Contract | CAL | Matches Termination column | P1 | High |
| REQ-RUN-009 | Run-type calendar advance | Only Regular advances calendar on Paid | — | CYCLE-007/008 | Only Regular advances | P1 | Critical |

---

## LIFE — Pay Run Lifecycle & Approval (PRD §16)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-LIFE-001 | Status flow | Draft→Processing→Processed→Pending Approval→Approved→Paid; Reject→draft; Cancelled; Return to previous | State machine | — | Only valid transitions allowed | P1 | High |
| REQ-LIFE-002 | Draft editable + live preview | Employees/adjustments/config editable; preview computes live | — | CAL | Draft preview shows totals/warnings | P1 | High |
| REQ-LIFE-003 | Process step | Runs engine, persists; pre-process validation lists blockers; can exclude incomplete; hard blockers stop affected employees | Validation | CAL, EMP-021 | Process persists; blockers handled | P1 | Critical |
| REQ-LIFE-004 | Multi-stage approval | Per-entity workflow w/ stage approvers; Approve/Reject(reason→draft)/Return-to-previous | Workflow | AUTH | Stages enforced; reject needs reason | P1 | High |
| REQ-LIFE-005 | On-Approve liabilities/forms | Tax liabilities + period forms generated; PAYE/SSNIT/bank file downloadable immediately (not gated on payment) | — | FORM, PAYM | Files available right after approval | P1 | Critical |
| REQ-LIFE-006 | Journal flag recorded only | "Post journal entries" flag recorded in audit; ⚠️ actual posting NOT implemented | Verify-only | §25 | Flag logged; no Finance posting | P3 | Medium |
| REQ-LIFE-007 | Mark as Paid terminal | Triggers loan decrement + calendar advance (Regular) + payment status updates | — | LOAN, CYCLE | All three side-effects fire | P1 | Critical |
| REQ-LIFE-008 | Cancel with reason | Cancel records reason in audit | Validation | — | Cancel requires/records reason | P2 | Medium |
| REQ-LIFE-009 | Immutable audit log | Every transition writes who/when/from/to/message; structured log channel | — | COMP | Audit entry per transition | P1 | High |

---

## STAX — Special Tax Engines (PRD §17)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-STAX-001 | Bonus annual cap | 15% of annual basic (12× monthly basic) | Calc | — | Cap computed correctly | P1 | Critical |
| REQ-STAX-002 | Bonus within cap 5% final | YTD-cumulative within cap → 5% final, never PAYE | Calc | — | Within-cap bonus taxed 5% only | P1 | Critical |
| REQ-STAX-003 | Bonus excess marginal | Excess added to chargeable income at marginal = `tax(ref+excess) − tax(ref)` | Calc | PAYE | Excess marginal tax correct | P1 | Critical |
| REQ-STAX-004 | Bonus reference run | Reference = full synthetic regular run for bonus month (benefits, BIK, loan BIK, before-tax deductions, SSF, reliefs) | Calc | CAL | Reference includes all components | P1 | Critical |
| REQ-STAX-005 | Bonus reconciliation | regular PAYE + bonus marginal PAYE = single-pass total | Invariant | — | Reconciliation holds exactly | P1 | Critical |
| REQ-STAX-006 | Bonus detail modal | Band-by-band table + reconciliation strip | UI | SLIP | Modal shows breakdown + strip | P2 | Medium |
| REQ-STAX-007 | Bonus threshold alert | YTD past 15% → `bonus_threshold_breach` soft warning | — | ALRT | Warning raised on breach | P2 | High |
| REQ-STAX-008 | Overtime junior tax | Junior (qualifying YTD ≤ GH₵18,000): 5% up to 50% of basic, 10% above; never PAYE | Calc | — | Junior OT split correct | P1 | Critical |
| REQ-STAX-009 | Overtime senior tax | Senior: OT added to chargeable income at PAYE marginal | Calc | PAYE | Senior OT marginal correct | P1 | High |
| REQ-STAX-010 | Overtime config + fallback | Thresholds/rates from Setup→Overtime Rules; statutory fallback if unconfigured | — | TAX | Config drives OT; fallback works | P2 | Medium |
| REQ-STAX-011 | Overtime junior alert | Threshold reached → `junior_employee_threshold` soft warning | — | ALRT | Warning raised | P3 | Medium |
| REQ-STAX-012 | Overtime entry gap | ⚠️ No pay-run OT entry screen — API only; Attendance OT is sample data | Verify-only | §25 | No UI entry; engine via API only | P3 | Medium |
| REQ-STAX-013 | Pension 35% cap | Total pension (Tier1+2+3, EE+ER, counting items) vs 35% qualifying income; excess routed to PAYE + `pension_threshold` alert | Calc | CAL, ALRT | Excess routed + alert raised | P1 | High |

---

## PAYE — PAYE Progressive Bands (PRD §10, §24) — split out for assertion granularity

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-PAYE-001 | Band 1 0% | ≤ 490 → 0% | Calc | — | Chargeable ≤490 → 0 tax | P1 | Critical |
| REQ-PAYE-002 | Band 2 5% | next to 600 → 5% | Calc | — | Marginal 5% on 490–600 slice | P1 | Critical |
| REQ-PAYE-003 | Band 3 10% | next to 730 → 10% | Calc | — | 10% on 600–730 slice | P1 | Critical |
| REQ-PAYE-004 | Band 4 17.5% | next to 3,896.67 → 17.5% | Calc | — | 17.5% on slice | P1 | Critical |
| REQ-PAYE-005 | Band 5 25% | next to 19,896.67 → 25% | Calc | — | 25% on slice | P1 | Critical |
| REQ-PAYE-006 | Band 6 30% | next to 50,416.67 → 30% | Calc | — | 30% on slice | P1 | Critical |
| REQ-PAYE-007 | Band 7 35% | above 50,416.67 → 35% | Calc | — | 35% on top slice | P1 | Critical |
| REQ-PAYE-008 | Cumulative banding | Tax = sum of per-band marginal amounts on chargeable income | Calc | PAYE-001..007 | Full progressive sum correct at boundaries | P1 | Critical |
| REQ-PAYE-009 | Chargeable income base | Qualifying Employment Income after reliefs/BIK/before-tax deductions | Calc | CAL, RELF, BIK | Base correctly assembled | P1 | Critical |
| REQ-PAYE-010 | Band-by-band breakdown UI | Detail modal shows income range, rate, regular income, regular PAYE | UI | CAL-015 | Modal table matches calc | P2 | Medium |

---

## ALRT — Alerts & Validation (PRD §18)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-ALRT-001 | Hard vs soft separation | Hard blockers error employee; soft warnings paid-but-flagged | — | CAL | Severity routed correctly | P1 | High |
| REQ-ALRT-002 | `missing_income_tax_engine` | Hard | — | TAX-005 | Employee errors out | P1 | Critical |
| REQ-ALRT-003 | `protected_pay_floor_breach` | Hard or Soft per rule | — | PROT | Severity per enforcement | P1 | High |
| REQ-ALRT-004 | Negative net pay | Hard | — | CAL-012 | Employee errors out | P1 | Critical |
| REQ-ALRT-005 | Missing/zero salary | Hard | — | EMP-007 | Employee errors out | P1 | High |
| REQ-ALRT-006 | `missing_tax_profile`/`missing_tin` | Soft (PAYE still computes; filings incomplete) | — | EMP-020 | Warning, still computes | P2 | Medium |
| REQ-ALRT-007 | `bik_cap_applied` | Soft | — | BIK-005 | Warning on cap | P2 | Medium |
| REQ-ALRT-008 | `bonus_threshold_breach` | Soft | — | STAX-007 | Warning on breach | P2 | High |
| REQ-ALRT-009 | `junior_employee_threshold` | Soft | — | STAX-011 | Warning on threshold | P3 | Medium |
| REQ-ALRT-010 | `pension_threshold` | Soft | — | STAX-013 | Warning on cap exceed | P2 | High |
| REQ-ALRT-011 | `benefit/deduction_threshold_breach` | Soft | — | CAT-007 | Warning on catalog threshold | P3 | Medium |
| REQ-ALRT-012 | `mandatory_item_exempted` | Soft | — | TAX-011 | Warning on exemption | P3 | Medium |
| REQ-ALRT-013 | `contract_renewal_warning` | Soft | — | EMP-016 | Warning within threshold | P3 | Low |
| REQ-ALRT-014 | Alert acknowledgement | Alerts persisted as first-class records with acknowledgement | — | — | Finance can acknowledge each | P2 | Medium |

---

## PAYM — Payments & Disbursement (PRD §19)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-PAYM-001 | Files action access | Run Payroll tab (Approved/Paid) + Payroll History tab (Paid) | — | LIFE | Files action present in both contexts | P2 | Medium |
| REQ-PAYM-002 | Bank file structure | Single-sheet xlsx: metadata block + header + per-employee rows + bold TOTAL + "{n} Employee(s)" | Output | — | Structure matches §19 exactly | P1 | High |
| REQ-PAYM-003 | Bank file columns | `#, Employee ID, Full Name, Department, Position, Account Number, Bank Name, Bank Sort Code, Bank Branch, Net Pay, Payment Reference, Narration/Remarks, Email, Contact Number` | Output | — | All 14 columns in order | P1 | High |
| REQ-PAYM-004 | Bank file sort order | Sort by bank name, then employee name | Output | — | Rows sorted correctly | P1 | High |
| REQ-PAYM-005 | MoMo in bank file | Network in Bank Name, wallet in Account Number; sorts into list | Output | — | MoMo rows present + sorted | P2 | Medium |
| REQ-PAYM-006 | Cash excluded | Cash-paid employees excluded entirely | Output | — | No cash employees in file | P1 | High |
| REQ-PAYM-007 | Missing-details excluded | Employees missing bank/MoMo details excluded | Output | — | Incomplete-details excluded | P1 | High |
| REQ-PAYM-008 | Skip reasons gap | ⚠️ Skip reasons in API response, NOT in Files modal UI | Verify-only | §25 | Reasons not shown in modal | P3 | Low |
| REQ-PAYM-009 | Payment reference dash | Left as dash for manual fill | Output | — | Reference column = "-" | P3 | Low |
| REQ-PAYM-010 | Sort code from branch | Sort code carried from employee's selected branch | Output | BANK, EMP | Correct sort code per employee | P1 | High |
| REQ-PAYM-011 | Per-employee payment status | View/update status; mark all paid | — | LIFE | Status updatable; bulk works | P2 | Medium |
| REQ-PAYM-012 | Proof of payment | Upload evidence onto paid run (stored for audit) | Upload | — | Document stored on run | P3 | Low |
| REQ-PAYM-013 | Run currency | Each run carries currency (default org) | — | — | Currency stored | P3 | Low |
| REQ-PAYM-014 | Export recorded in audit | Every bank-file export recorded | — | COMP | Audit entry per export | P2 | Medium |
| REQ-PAYM-015 | Payments submenu preview | ⚠️ Batches/Bank Files/Mobile Money/Multi-Currency/Failed = previews | Verify-only | §25 | Submenu previews only | P3 | Low |

---

## FORM — Taxes, Forms & Filings (PRD §20)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-FORM-001 | Liabilities on approve | Tax liabilities per authority (GRA/SSNIT/NPRA) generated on Approved with due dates | — | LIFE-005, TAX-012 | Liabilities generated on approve | P1 | High |
| REQ-FORM-002 | One form per period | Aggregates all runs sharing form type + authority + period bucket into one form | — | — | Multiple runs → one form | P1 | High |
| REQ-FORM-003 | Attach to Pending form | Approving run whose bucket has Pending form attaches + recomputes totals/lines (no duplicate) | — | FORM-002 | Pending form updated, not duplicated | P1 | High |
| REQ-FORM-004 | Supplementary on locked | Bucket with locked form (Pending Approval/Filed) → `-SUPP` + `is_supplementary` form | — | FORM-002 | SUPP form created, original untouched | P1 | Critical |
| REQ-FORM-005 | Files modal 3 outputs | GRA PAYE Schedule (on income-tax form), SSNIT Tier 1 (on social-security form), Bank File (on Approved/Paid) | — | PAYM | All three listed with correct enablement | P1 | High |
| REQ-FORM-006 | Muted unavailable note | "Generated automatically once approved" when not yet available | UI | — | Note shown pre-approval | P3 | Low |
| REQ-FORM-007 | Forms approval flow | Tax forms flow through own approval before submission | Workflow | — | Form approval enforced | P2 | Medium |
| REQ-FORM-008 | Filing status tracking | Taxes & Forms track pending/submitted/overdue; Compliance shows history | — | COMP | Statuses tracked | P2 | Medium |
| REQ-FORM-009 | GRA PAYE export integrity | Bulk-cleanup export; byte-identical output, near-instant | Output | — | Export fast + correct | P2 | Medium |

---

## SLIP — Payslips (PRD §21)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-SLIP-001 | Admin payslip download | Paid run → employee row → Download Payslip (gated run Paid + employee payment Paid) | — | LIFE, PAYM | Download available only when both Paid | P1 | High |
| REQ-SLIP-002 | Snapshot-based PDF | Generated from persisted snapshot, never recomputes | — | CAL-015 | PDF = stored snapshot | P1 | High |
| REQ-SLIP-003 | PDF identity/header | Org header/logo, period, pay date, ref; name/code/dept/position/TIN | Output | — | All present | P2 | Medium |
| REQ-SLIP-004 | PDF payment details | Method, bank/branch or network, masked account/wallet | Output | EMP-012 | Masked details present | P2 | Medium |
| REQ-SLIP-005 | PDF earnings (BIK excluded) | Cash earnings + cash benefits; BIK excluded | Output | BIK-006 | No BIK in earnings | P1 | High |
| REQ-SLIP-006 | PDF deduction groups | Statutory Deductions + Other Deductions as two groups | Output | — | Two groups present | P2 | Medium |
| REQ-SLIP-007 | Same-name combine | Same-name deductions (e.g. multiple loans) combined into one summed line | Output | LOAN-007 | Combined line; audit unaffected | P2 | Medium |
| REQ-SLIP-008 | PDF totals | Gross, total deductions, net pay, net in words | Output | CAL | Totals + words correct | P1 | High |
| REQ-SLIP-009 | Self-service API | `/my/payslips/*` scoped to own staff record (list/current/download/all), no admin perm | Scope | AUTH-011 | API returns only own payslips | P1 | High |
| REQ-SLIP-010 | This-app My Payslips placeholder | ⚠️ This app's Self-Service→My Payslips is unused placeholder; real UI in kedebah_v2_pim | Verify-only | §23 | Placeholder confirmed | P3 | Low |

---

## RPT — Reports & Exports (PRD §22)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-RPT-001 | Payroll Summary | Gross/net/statutory totals for run/period; PDF+Excel | Output | — | Report + both exports | P2 | Medium |
| REQ-RPT-002 | Statutory Remittance | Amounts due per authority; PDF+Excel | Output | FORM | Correct per-authority totals | P2 | High |
| REQ-RPT-003 | PAYE Reconciliation | Per-employee PAYE vs remitted; PDF+Excel | Output | PAYE | Matches calc | P2 | High |
| REQ-RPT-004 | Variance Comparison | Period-over-period differences; PDF+Excel | Output | — | Diffs correct | P3 | Medium |
| REQ-RPT-005 | Annual Payroll | Full-year totals per employee; PDF+Excel | Output | — | Year totals correct | P3 | Medium |
| REQ-RPT-006 | Year-End Tax | Year-end tax statements; PDF+Excel | Output | — | Statements generated | P3 | Medium |
| REQ-RPT-007 | Audit & Compliance | Action trail, filterable+exportable; PDF+Excel | Output | COMP | Trail exports | P2 | Medium |
| REQ-RPT-008 | Statutory Config Versions | History of config changes (who/what/when); PDF+Excel | Output | TAX-003 | Version history exports | P2 | Medium |
| REQ-RPT-009 | Payslips not a report | Payslips NOT in Reports Centre | Verify-only | §22 | Not listed as report export | P3 | Low |
| REQ-RPT-010 | Per-employee detail view | Detail view matches calculation (band-by-band + Download Payslip) | — | CAL-015 | Detail = calc | P2 | Medium |
| REQ-RPT-011 | Reports gaps | ⚠️ Payslips/Earnings&Deductions/Cost Center/Analytics pages redirect/unimplemented; AI Insights preview | Verify-only | §25 | Redirect/preview confirmed | P3 | Low |

---

## COMP — Compliance & Self-Service (PRD §23)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-COMP-001 | Audit logs | Every mutation attributed + timestamped | — | LIFE-009 | All mutations logged | P1 | High |
| REQ-COMP-002 | Change history | Change history tracked | — | — | History viewable | P2 | Medium |
| REQ-COMP-003 | Approval trails | Approval trails captured | — | LIFE-004 | Trails viewable | P2 | Medium |
| REQ-COMP-004 | Statutory filing history | Filing history (Compliance→Statutory Filings) | — | FORM | History shown | P2 | Medium |
| REQ-COMP-005 | Compliance alerts | Compliance alerts backed by audit trail | — | ALRT | Alerts surfaced | P3 | Medium |
| REQ-COMP-006 | Dual immutable audit trail | Pay-run lifecycle log + system-wide audit trail, immutable | Invariant | — | Neither trail mutable | P1 | High |
| REQ-COMP-007 | Self-service gaps | ⚠️ My Earnings/My Loans/Queries = placeholders, no backend (both projects) | Verify-only | §25 | Placeholders confirmed | P3 | Low |

---

## SEC — Security (cross-cutting, PRD §2 + §BUSINESS LOGIC/SECURITY)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-SEC-001 | Permission enforcement (API) | API enforces permission on every route independent of UI | Authz | AUTH-010 | Unpermitted API call → 403 | P1 | Critical |
| REQ-SEC-002 | Direct URL access | Routes user lacks permission for blocked even via direct URL | Authz | AUTH-009 | Direct URL → blocked/redirect | P1 | High |
| REQ-SEC-003 | Session validation | Expired/invalid session rejected; redirect to login | Session | AUTH-003 | Invalid session → login | P1 | High |
| REQ-SEC-004 | Unauthorized navigation | Cross-role access denied (Manager → bank edit, staff → admin) | Authz | AUTH-008/011 | Denied per role | P1 | High |
| REQ-SEC-005 | SQL injection | Inputs sanitised; injection payloads rejected/escaped | Sanitisation | — | No injection effect | P1 | High |
| REQ-SEC-006 | XSS | Stored/reflected XSS payloads escaped | Sanitisation | — | Script not executed | P1 | High |
| REQ-SEC-007 | Malformed input | Malformed/oversized/type-mismatch inputs handled gracefully | Validation | — | No crash; validation error | P2 | Medium |
| REQ-SEC-008 | Duplicate submission | Double-submit (e.g. approve, mark paid) does not double-apply | Idempotency | LIFE | No duplicate side-effects | P1 | High |
| REQ-SEC-009 | Self-service scope isolation | Employee cannot access another employee's payslips via ID manipulation | Authz | SLIP-009 | Cross-record access denied | P1 | Critical |
| REQ-SEC-010 | Sensitive data masking | Account/MoMo numbers masked by default | Masking | EMP-012 | Masked unless revealed | P2 | Medium |

---

## SETUP — Setup Order (PRD §3) — workflow-level

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-SETUP-001 | Ordered configuration | 10-step setup order; each step depends on prior | Sequence | all | Following order yields runnable system | P1 | High |
| REQ-SETUP-002 | Engine refuses untaxed | No assigned tax engine → income tax cannot compute (hard block) | Block | TAX-005 | Confirms no untaxed pay | P1 | Critical |

---

## DASH — Dashboard (no PRD section — scope unconfirmed)

| ID | Feature | Business Rule / Expected Behaviour | Validation | Dependencies | Acceptance Criteria | Pri | Risk |
|----|---------|-----------------------------------|-----------|--------------|---------------------|-----|------|
| REQ-DASH-001 | Post-login landing | (UNCONFIRMED) Dashboard as landing/overview | — | AUTH | **Scope TBD — open question #2** | P3 | Low |

---

## Summary counts

| Module | Reqs | P1 | Critical-risk |
|--------|------|----|----|
| AUTH | 11 | 8 | 1 |
| CYCLE | 15 | 9 | 1 |
| PG | 6 | 4 | 0 |
| BANK | 11 | 4 | 0 |
| CAT | 15 | 8 | 4 |
| BIK | 8 | 6 | 4 |
| PROT | 9 | 5 | 3 |
| TAX | 13 | 6 | 3 |
| RELF | 6 | 5 | 1 |
| LOAN | 9 | 5 | 3 |
| EMP | 21 | 13 | 1 |
| CAL | 16 | 14 | 8 |
| RUN | 9 | 7 | 3 |
| LIFE | 9 | 6 | 3 |
| STAX | 13 | 8 | 6 |
| PAYE | 10 | 9 | 8 |
| ALRT | 14 | 6 | 2 |
| PAYM | 15 | 6 | 0 |
| FORM | 9 | 5 | 1 |
| SLIP | 10 | 5 | 0 |
| RPT | 11 | 0 | 0 |
| COMP | 7 | 3 | 0 |
| SEC | 10 | 8 | 2 |
| SETUP | 2 | 2 | 1 |
| DASH | 1 | 0 | 0 |
| **Total** | **~260** | **~165** | **~57** |

> Counts are approximate aggregates for planning. The traceability matrix
> (`requirements/01-traceability-matrix.md`) is the authoritative coverage tracker.

*End of Phase 2 — Requirements Catalog. Next: Phase 3 — Test Strategy.*
