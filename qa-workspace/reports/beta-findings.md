# BETA — Findings raised

> Kedebah Payroll · QA · BETA environment (`v2payroll.kedebahlite.com`, tenant "Glenn and Co").  
> Generated from `reports/beta-verification.html`. Every finding carries repro steps and the expected / pending outcome.  
> **candidate** = needs a dev ruling · **awaiting finance / product ruling** = QA observation confirmed, the correct behaviour is a business decision · **by design / withdrawn** = closed, no action.

## BETA-F-046 — Major · candidate · Phase 8 · security

**Switching enterprise user does not reset the Payroll session — the previous user's privileges persist.** Signed out of the enterprise portal (`v2.kedebahlite.com`), signed back in as a *different* user (ZZQA Reports Persona, `dwetornam+25`), and re-launched the **Payroll Manager** module. The portal correctly showed the new identity, but the Payroll app kept the **previous** user: `GET /api/v1/payrollApi/user` still returned `central_user` id 575 "Broni Danso" with `is_payroll_super_admin: true`, `payroll_permissions` in `localStorage` was still the full 56-permission admin set, and every payroll screen rendered Glenn and Co's data. The new user's `?auth=` SSO hand-off never replaced the stale bearer token. On a shared or kiosk machine, user B operates the payroll system as user A — here, as a super admin.

**Repro**

1. Sign into the portal as an admin, open **Payroll Manager**, confirm you're an admin (nav shows every section).
2. Top-right account menu → **Sign out**. On the sign-in page, log in as a *different* enterprise user.
3. From the module launcher click **Payroll Manager** again.
4. Open dev-tools → Application → Local Storage for `v2payroll.kedebahlite.com`: `auth:userData` / `payroll_permissions` are still the **first** user's. Call `GET /api/v1/payrollApi/user` with the stored token — it returns the first user.

**Expected:** launching Payroll after a user switch discards the prior session entirely and establishes a token scoped to the new user; a stale token is rejected, not honoured.

---

## BETA-F-045 — Minor · candidate · Phase 8

**The "Payroll Chat Assistant" is a non-functional mock presented as live.** The `/chat` route (redirects to `/ai/assistant`) shows a chat UI with a hard-coded conversation list (Abena Mensah, Kwame Asante, "February payslip", "Q4 PAYE returns") and a header reading **"Payroll Support — Online"**. Sending a message fires **no network request**; the reply is a canned string unrelated to the question ("I'll check the tax calculations and get back to you shortly.", "The SSNIT contribution rates are updated in the system. I can share the breakdown."). The seeded thread contains a fabricated action ("I've corrected the entry. The adjustment will reflect in your next payslip.").

**Repro**

1. Open `/chat`. Note the pre-populated conversations and the "Online" status.
2. Type "What is the SSNIT employee contribution rate in Ghana?" and send. Then "Calculate PAYE for a monthly salary of 8000 cedis."
3. Both get generic canned replies. Dev-tools → Network shows no request on send.

**Expected:** either a working assistant, or a clearly-labelled "coming soon / demo" placeholder — not a fake "Online" agent that fabricates reassurances.

---

## BETA-F-044 — Minor · candidate · Phase 8 · ui

**Attendance Payroll Impact has two filter dropdowns with the same label.** On `/reports/attendance-payroll-impact` the filter row shows two adjacent dropdowns both captioned **"Records"** — one defaulting to "All Records", the other to "Corrected & original". The second controls the corrections view and should be named accordingly. Also cosmetic: the KPI strip shows "Employees affected: 0" but "Overtime hours: —" — mixed zero/dash for the same empty state.

**Repro**

1. Open **Reports → Attendance Payroll Impact**. Open the **Filters** panel.
2. Two dropdowns are labelled "Records". Hover/expand each — one is status scope, the other original-vs-corrected.

**Expected:** distinct labels (e.g. "Records" and "Corrections"); consistent empty-value formatting across the KPI tiles.

---

## BETA-F-043 — Minor · candidate · Phase 8

**A Salary Adjustment's Preview keeps re-projecting after it's Applied.** Once an adjustment reaches **Applied**, its detail-page Preview panel still computes off the *current* salary: for the ZZQA Comp History Test round it showed **Old ₵3,450.00 → New ₵3,650.00, status "To update"** — i.e. another +₵200 on the already-raised figure — and the **Refresh** button stays enabled. No re-apply control is exposed, so there's no data impact, but the panel misrepresents an already-applied round as still pending.

**Repro**

1. Create a fixed-amount Salary Adjustment, Submit for Approval, Approve (it applies immediately).
2. Stay on the adjustment detail page. The Preview table shows the employee's *new* salary as the "Old Value" and projects the delta again, marked "To update".

**Expected:** after Applied, the Preview shows the historical applied values (old → new, status Applied) and doesn't offer Refresh.

---

## BETA-F-042 — Minor · candidate · Phase 8 · governance

**Salary Adjustments use single-stage self-approval — unlike pay runs.** A Salary Adjustment goes Draft → Submit for Approval → **Approve**, where one click by the *same* admin who submitted it both approves and applies the change to employee salaries ("Approved and applied to employee salaries"). There is no maker/checker separation, no second stage, and no distinct apply step — in contrast to the 2-stage sequential Pay Run approval workflow. A single admin can raise everyone's pay and have it take effect with no independent review.

**Repro**

1. Management → Salary Adjustments → New. Build a round, **Create**, then **Submit for Approval**.
2. As the same user, click **Approve** → toast "Approved and applied to employee salaries"; status jumps straight to **Applied**.

**Pending:** product/finance to decide whether salary-change rounds should carry the same multi-stage approval governance as pay runs.

---

## BETA-F-041 — Major · candidate · Phase 8

**The employee-profile "Base salary" field is editable but silently discarded.** On the employee profile, **Edit Employee** exposes a "Base salary (GHS)" number field (and the Compensation section shows one too). Changing it and clicking **Save all changes** succeeds with no error — but the value is never sent. Verified twice on ZZQA MidHire: `POST /api/v1/payrollApi/employees/6` carries only identity/job fields (`employee_id, first_name, …, position_id, employment_type_id, employment_status_id`) — **no `base_salary`**. `GET /employees/6` and `/employees/6/salary/full` both keep the prior figure; `updated_at` doesn't move. Salary can only actually be changed via a Salary Adjustment. Same silent-no-op pattern as BETA-F-029 (wizard role picker).

**Repro**

1. Open an employee profile → **Edit Employee**. Change **Base salary (GHS)** to a new value. Click **Save all changes** — success toast, no error.
2. Reload the profile — the Compensation "Amount" is unchanged.
3. Confirm via `GET /api/v1/payrollApi/employees/<id>/salary/full` — `basic_salary` and `updated_at` are unchanged; the `POST /employees/<id>` request body has no salary field.

**Expected:** either the field persists the new base salary (writing a salary record + a Compensation Change History entry), or it's read-only with a link to "change via Salary Adjustment".

---

## BETA-F-033 — Major · candidate · Phase 4

**Config pages aren't behind the role guard.** A **Payroll Employee** or **Payroll Reports** user can't reach `/settings` or `/settings/roles` (both redirect to `/forbidden`), but the sibling `/setup/*` routes are not guarded the same way — `/setup/budgets`, `/setup/banks`, `/setup/pay-groups`, `/setup/statutory-rules` all render for them, complete with their **Create / Add / Edit** buttons. The Create Budget modal opens and accepts input; only the final submit is stopped, server-side, with "You do not have permission to perform this action". `/setup/budgets` also returns real data (budget name, ₵3,000,000 total) to these roles, while the other setup GETs 403 to an empty list — inconsistent. Least-privilege: a page and its actions shouldn't render for a role that can't use them.

**Repro**

1. Sign in at `v2.kedebahlite.com` as a **Payroll Employee** or **Payroll Reports** user (QA: `dwetornam+24` / `+25`) → open the **Payroll Manager** module.
2. Confirm the left nav shows only **Dashboard** and **Reports**.
3. In the address bar go to `/settings` — you land on `/forbidden` ("Access Denied"). Good.
4. Now go to `/setup/budgets` — the page renders, with a **Create Budget** button. Repeat for `/setup/banks`, `/setup/pay-groups`, `/setup/statutory-rules`.
5. On `/setup/budgets` note the real budget row is listed (name + ₵3,000,000). Click **Create Budget**, fill Name + a January amount, click **Create Budget** — only now does it fail with "You do not have permission to perform this action".

**Expected:** `/setup/*` redirects to `/forbidden` for these roles, exactly like `/settings` — the page, its data and its action buttons never render.

---

## BETA-F-034 — Major · candidate · Phase 4

**The compliance audit trail only records the last approval stage.** After the 2-stage Pay Run workflow ran end-to-end, the immutable Full Audit Log (advertised "read-only … 7-year retention") shows `Submitted_for_approval` (Broni, 11:05), `Approved · Pay Run #3` (Admin persona, stage 2, 12:26) and `Paid` (12:27) — but **no entry for the stage-1 approval** by the Manager persona at 11:48. Intermediate approvals appear only in the pay run's own Activity History, not the global trail an auditor would review. (Related: the log returned "1–25 of 25" for a full-year range that should include earlier-dated activity — possible cap.)

**Repro**

1. Have a 2-stage Pay Run approval workflow active. Submit a run, approve **stage 1** as approver A, then approve **stage 2** as approver B, then Mark Paid.
2. Open the run's own **Activity History** — all three events (stage-1 approve, stage-2 approve, paid) are listed with the right actors.
3. Go to **Reports → Audit & Compliance → Full Audit Log**. Set the date range wide (e.g. 2025-01-01 → 2026-12-31).
4. Scan the rows for that Pay Run: you see `Submitted_for_approval`, `Approved` (stage 2 only) and `Paid` — the **stage-1 approval is missing**.
5. Note the footer reads "Showing 1–25 of 25" even though older activity exists in range.

**Expected:** every approval stage writes its own immutable audit-trail entry (actor, stage, timestamp); the list pages rather than capping at 25.

---

## BETA-F-035 — Minor · candidate · Phase 4

**The "Approval Logs" audit tab is always empty.** It queries `/audit-trails?filter[action]=approve`, but approval events are stored with action `Approved` / `Submitted_for_approval`. The filter value never matches, so the tab shows "No records" even when approvals exist and are visible in the Full Audit Log.

**Repro**

1. Approve at least one pay run so approval events exist (verify them in **Full Audit Log**).
2. Go to **Reports → Audit & Compliance** and open the **Approval Logs** tab.
3. Widen the date range. The table stays "No records / No audit logs match your current filter criteria".
4. Check the network call: `GET /audit-trails?…&filter[action]=approve` returns 200 with an empty list; the stored actions are `Approved` / `Submitted_for_approval`.

**Expected:** the Approval Logs tab filters on the action values actually stored, so approvals show up.

---

## BETA-F-032 — Withdrawn on re-test

**Retracted.** Originally raised (Critical) as "no Approve/Reject button for the assigned approver". On a clean re-test — logged in as the assigned stage-1 approver (`ZZQA Manager Persona`), session identity confirmed in the profile menu, navigating by link clicks only — the **Approve and Reject buttons are present and work**. The run was approved through stage 1 (toast: "Payroll approved successfully. Awaiting next approval stage.") and the activity log records "ZZQA Manager Persona approved". The earlier readings were taken before the approval page finished its ~10 s skeleton render (**BETA-F-002**) and on a session that had reverted to the Admin user via hard URL navigation. Approval-workflow enforcement is now covered by a passing spec; **BETA-F-031** (below) stands on its own.

---

## BETA-F-012 — Major · awaiting finance ruling

**A bonus paid together with regular salary is taxed differently from a standalone bonus run.** The standalone Bonus Payroll run applies 5% flat on the first 15% of annual basic. When the same bonus is added to a regular run via "Add bonuses", the whole amount is folded into chargeable income and taxed at marginal PAYE — for a GH₵ 3,000 bonus the employee tax is ~GH₵ 670 vs GH₵ 150. The "Add bonuses" dialog's help text promises "5% within the annual cap". **Finance to confirm which treatment is correct** and whether the two paths should agree.

**Repro**

1. Take an employee on GH₵ 3,000/mo basic (annual 36,000; 15% cap = 5,400).
2. **Baseline:** create a standalone **Bonus Payroll** run, GH₵ 3,000 bonus → process → bonus tax = **GH₵ 150.00** (5% flat).
3. Now create a **Regular Payroll** run for the same employee. On the run, use **Add bonuses** → GH₵ 3,000 → process.
4. Open the employee's tax breakdown: the GH₵ 3,000 is added to chargeable income and taxed at marginal PAYE — employee tax is ~GH₵ 670 higher than salary-only, not GH₵ 150.

**Pending:** finance to rule on the correct treatment for a bonus paid alongside salary, and whether the standalone and combined paths must match.

---

## BETA-F-011 — By design — not a defect

**Closed.** Originally raised as "a period can hold two regular pay runs". **Confirmed intended** — multiple regular runs per period are supported on purpose (e.g. a supplementary or corrective run). No fix needed. The knock-on where the cost dashboard *double-counts* those runs is a separate, still-open issue — see **BETA-F-021**.

---

## BETA-F-013 — Major · candidate

**No bank payment file.** PRQ-014's bank / EFT disbursement file — the one a payroll clerk hands the bank — is not available on the paid run, in Reports, or under Taxes & Forms. The GRA and SSNIT filing exports are all present; the bank file is the missing third leg.

**Repro**

1. Take a pay run all the way to **Paid** with employees set to **Bank Transfer**.
2. On the paid run, look for a bank / EFT / ACH disbursement export — check the run detail, its Export menu, **Reports**, and **Taxes & Forms**.
3. Only the GRA PAYE Schedule, SSNIT/pension forms and the Statutory Remittance report are available — there is no payment file to hand the bank.

**Expected:** a paid run produces a bank payment file (per PRQ-014) listing payee account, sort code and net amount.

---

## BETA-F-016 — Major · awaiting finance + product ruling · Phase 2

**A termination run pays a full month's salary regardless of the last working day.** The "Last working day" field's help text says it is "used to prorate the final pay period", but a leaver dated 15 October still had the full GH₵ 3,000 basic in the processed run — no proration, no warning. **Finance and product to discuss** whether the final period should auto-prorate to the last working day, and if so, on what day-count basis.

**Repro**

1. **Run Payroll → Create Pay Run → Termination**. Pick an employee on GH₵ 3,000/mo basic.
2. Set **Last working day** to the 15th of the pay month (its help text: "used to prorate the final pay period").
3. Add any severance amount, click **Calculate**, then process.
4. The basic-salary line is the **full GH₵ 3,000**, not ~GH₵ 1,500 — no proration, no warning.

**Pending:** finance + product to decide whether the final period prorates to the last working day (and the day-count method), or whether the field's help text should be corrected.

---

## BETA-F-017 — Major · candidate · Phase 2 · BTL #3

**A deactivated employee is still paid.** After ZZQA AlphaOne was set to In-active (confirm dialog: "removes this employee from payroll processing"), the profile's own summary read `"Payroll: Excluded — employment status"` — yet a Regular run created afterwards projected them as "Ready" and processed a full GH₵ 3,108.12 payslip. Only generic TIN warnings surfaced; nothing flags the employee as inactive. BTL onboarding item #3 is not fixed.

**Repro**

1. Open an active employee's profile → **Deactivate** (confirm dialog says "removes this employee from payroll processing"). Their profile summary then reads "Payroll: Excluded — employment status".
2. Go to **Run Payroll → Create Pay Run → Regular** for the next open period.
3. The deactivated employee is still listed and projected as **Ready**; process the run and they get a full payslip.

**Expected:** an In-active employee is excluded from new runs (not selectable, or shown as Ineligible with a clear reason).

---

## BETA-F-019 — Major · candidate · Phase 2

**Termination-run statutory due dates are a month too late.** A termination for the October period produced PAYE due **Dec 15** and Tier 1 / Tier 2 due **Dec 14** — the same liabilities from the September regular run are correctly dated Oct 15 / Oct 14. The termination path adds two months to the period instead of one, so the org would treat an already-overdue filing as not yet due and the late-payment penalty would never fire.

**Repro**

1. Process and approve a **Termination** run for the **October** period.
2. Go to **Taxes & Forms → Taxes** and open the liabilities it generated.
3. PAYE shows **due Dec 15** and Tier 1 / Tier 2 **due Dec 14**.
4. Compare with the same liabilities from a **Regular** October run — those are correctly **Oct 15 / Oct 14**.

**Expected:** statutory due dates are the 15th / 14th of the month *after* the pay period, regardless of run type.

---

## BETA-F-018 — Minor / Major · candidate · Phase 2

**A bonus run accepts a pay date in a closed tax year.** Creating a Bonus Payroll with pay date 15 Jan 2025 (≈20 months in the past) was accepted with no warning — the dialog even showed "Tax year: 2025" and built the run for a Jan 2025 period. Because the 5% concession is cumulative across the tax year, a back-dated bonus corrupts that year's tracking. Regular runs are correctly locked to the open period; bonus / off-cycle / termination pay dates are free-form.

**Repro**

1. **Run Payroll → Create Pay Run → Bonus**.
2. Set the **pay date** to `15 Jan 2025` (a prior, closed tax year).
3. The dialog accepts it — it even shows "Tax year: 2025" — and creates the run for a Jan 2025 period with no warning.

**Expected:** a pay date in a closed tax year (or more than N months in the past) is rejected or at least warns, for every run type — because the 5% bonus concession is tracked cumulatively per tax year.

---

## BETA-F-021 — Major · candidate · Phase 3

**The cost dashboard counts unpaid drafts.** With a primary budget in place, "Budget vs Actual" reported **Actual YTD GH₵ 1,202,190** against roughly **GH₵ 18k** of genuinely paid 2026 runs. It sums every *Processed* pay run — including the three duplicate, unpaid "Regular Payroll · October 2026" drafts (~GH₵ 292k employer cost each). "Employer Cost by Tier" and "Payroll Cost Summary" are inflated the same way. A cost figure should reflect committed (Approved / Paid) spend and de-duplicate correctly — multiple runs per period are legitimate (BETA-F-011), so the dashboard must sum *paid* amounts rather than every Processed draft.

**Repro**

1. Create a primary org-wide budget (**Settings → Budgets**).
2. Create several **Regular** runs for the same future period and **process** them (don't pay) — as allowed by BETA-F-011.
3. Open the **Dashboard**. "Budget vs Actual → Actual YTD", "Employer Cost by Tier" and "Payroll Cost Summary" all include those unpaid Processed drafts — Actual YTD is many times the value of the genuinely paid runs.

**Expected:** cost widgets count only committed spend (Approved / Paid) and de-duplicate per period.

---

## BETA-F-024 — Major · candidate · Phase 3

**The Payroll Summary Report understates take-home pay.** Its "Net Pay" line subtracts the full Tier 1 (GH₵ 1,080 = employee 440 + *employer* 640) and Tier 2 (GH₵ 400, employer-only) from gross, giving GH₵ 5,228.37 ("65.35% of Gross"). Employee net pay for the same Sept run is GH₵ 6,268.37 — and the report's own Excel export footer says exactly that. The report is internally inconsistent, and its "Total Statutory Deductions" overstates the employee figure by the GH₵ 1,040 of employer contributions.

**Repro**

1. Have a paid September run (single employee on GH₵ 8,000 gross is enough).
2. **Reports → Payroll Summary Report**. Period = September, scope = All Employees → **Generate Report**.
3. "Net Pay" shows **GH₵ 5,228.37 (65.35% of Gross)** and "Total Statutory Deductions" = GH₵ 2,771.63 (includes Tier 1 *employer* 640 + Tier 2 employer 400).
4. Compare with the employee's actual net on the pay run / payslip: **GH₵ 6,268.37**. Export the report to Excel — its own footer says 6,268.37.

**Expected:** "Net Pay" = gross − employee-side deductions only (PAYE + employee SSNIT); employer contributions are an employer-cost line, not a deduction from take-home.

---

## BETA-F-025 — Major · candidate · Phase 3

**Period reports drop the off-cycle run.** The Payroll Summary, PAYE Reconciliation and Variance reports for September show gross GH₵ 8,000 and PAYE GH₵ 1,291.63 — the regular run only. The paid off-cycle run (GH₵ 1,000, PAYE 65.75) is missing, so a September summary understates cost by that amount. The Annual and Year-End reports *do* include it, and the GRA PAYE Schedule aggregates it correctly.

**Repro**

1. For one month, pay **both** a Regular run and an Off-Cycle run (e.g. Sept: regular GH₵ 8,000 / PAYE 1,291.63, off-cycle GH₵ 1,000 / PAYE 65.75).
2. **Reports → Payroll Summary Report** (also PAYE Reconciliation, Variance) for September → Generate.
3. Gross shows **8,000** and PAYE **1,291.63** — the off-cycle GH₵ 1,000 / 65.75 is missing.
4. Run the **Annual Payroll Report** and the **GRA PAYE Schedule** for the same period — those include the off-cycle amount.

**Expected:** every period report sums all paid runs whose pay date falls in that period, regardless of run type.

---

## BETA-F-026 — Minor / Major · candidate · Phase 3

**PAYE reconciliation reports don't reconcile.** The PAYE Annual Reconciliation and Year-End Tax Filing reports leave benefits-in-kind out of "Chargeable Income" (GH₵ 7,560 / 16,395) while the PAYE figure they show is computed *with* the BIK in the base (GH₵ 8,060 / 16,895). The chargeable amount on the page does not produce the tax on the page.

**Repro**

1. Pay an employee who has a **benefit-in-kind** assigned (e.g. GH₵ 500 BIK on top of GH₵ 5,000 basic).
2. **Reports → PAYE Annual Reconciliation** (and Year-End Tax Filing) → Generate.
3. Read "Chargeable Income" (e.g. GH₵ 7,560) and the "PAYE" figure on the same row.
4. Recompute PAYE from the shown chargeable income — it doesn't match; the PAYE was calculated with the BIK *included* in the base (chargeable ≈ 8,060), which the report doesn't show.

**Expected:** "Chargeable Income" on the report is the exact base the displayed PAYE was computed from (BIK included).

---

## BETA-F-028 — Major · candidate · Phase 3c

**The organisation has no Employer TIN or SSNIT number, yet setup reads "Completed".** Organization Setup shows both "Employer TIN" (its own help text: "Used on the GRA PAYE schedule header") and "Employer SSNIT Number" ("Used for SSNIT contribution filings") blank, and neither is marked required. The Settings hub still says "Payroll setup completed", so the GRA PAYE schedule and SSNIT returns are produced without the mandatory employer identifiers — while a *missing employee* TIN raises a soft warning on every run.

**Repro**

1. **Settings → Organization Setup**. Wait out the skeleton load (BETA-F-002).
2. The **Employer Tax Identification Number** and **Employer SSNIT Number** fields are blank and not marked required.
3. Go back to the **Settings** hub — it still shows "Payroll setup completed" and the Organization Setup card reads "Completed".
4. Generate the **GRA PAYE Schedule** — its header is produced with no employer TIN.

**Expected:** Employer TIN + SSNIT number are required before Organization Setup can be "Completed" / before statutory exports are allowed.

---

## BETA-F-031 — Major · candidate · Phase 3c

**An active approval workflow can't be deactivated or edited while it has a run in flight.** Deactivating it (`POST …/status`) and editing its stages/approvers (`POST …/approval-workflows/1`) both return a bare HTTP 500 — no message, the card stays "Active" — for *every* role including the org owner, and *even after* the first stage is approved. A submitted run also has no recall or withdraw. This nearly stranded "ZZQA Bonus Test Sep 2026": stage 2 was assigned to a persona whose invitation hadn't been completed, the org admin couldn't approve it or re-point the stage, and there is no admin "reset password / resend invitation" on the user page — the run only completed once that persona's invite was finished out-of-band. The approval path itself is sound (both stages approved, run reached Paid); the defect is that a misconfigured active workflow has no safe escape hatch.

**Repro**

1. **Settings → Approval Workflows → Pay Run Approval Workflow**. Build 2 stages, assign approvers, **Activate**.
2. Submit any pay run for approval (it's now mid-workflow).
3. Back on the workflow card, click **Deactivate** → toast never appears, card stays "Active"; network shows `POST /approval-workflows/1/status` → **500**.
4. Open the workflow editor, change an approver, **Save Workflow** → `POST /approval-workflows/1` → **500**, stays on the Summary step. Same result as the org owner, and after stage 1 is approved.
5. On the submitted run, look for a recall / withdraw action — there is none.

**Expected:** an active workflow can be edited or deactivated with a clear rule for in-flight runs (block with a message, or apply to new runs only), and a submitter can withdraw a run that hasn't been approved yet.

---

## BETA-F-029 — Major · candidate · Phase 3c

**The "Add User" wizard ignores the role you pick.** Step 2 of the wizard lets you tick roles "applied immediately when the account is created" — but every user created this way lands with `Roles: 0 / No roles`. The role only attaches when set afterwards from Roles → the role → Manage Users. A new hire created through the wizard has no access until someone notices and fixes it.

**Repro**

1. **Settings → Users → Add User**. Fill name / email / phone.
2. On step 2, **tick a role** ("applied immediately when the account is created").
3. Finish the wizard, then open the new user's detail — **Roles: 0 / No roles**.
4. Attach it manually via **Roles → the role → Manage Users → check the user → Save** — that path works.

**Expected:** the role ticked in the wizard is attached when the user is created.

---

## BETA-F-030 — Minor · Phase 3c

Right after "Add User" the wizard navigates to `/settings/users/576` — a nonexistent id — and the page 404s (`No query results for model User 576`). The user was really created with id 2–5; the redirect just uses the wrong number.

**Repro**

1. **Settings → Users → Add User** and complete the wizard.
2. On finish it redirects to `/settings/users/576`, which shows "No query results for model User 576".
3. Go back to **Users** — the account is there, with a real id (2–5).

**Expected:** the wizard redirects to the newly-created user's actual detail page.

---

## BETA-F-020 — Minor / Major · candidate · Phase 3

**"Recalculate" doesn't re-pull benefit assignments.** A benefit newly assigned to an employee already in a Processed run does not appear after Recalculate — the confirm text promises "fresh results based on current employee data … tax profiles, statutory enrollments, salary", and benefit / deduction assignments are silently not in that list. A fresh run for the same period does include it. An approver who fixes a benefit and re-calculates believes the run is current when it is not.

**Repro**

1. Create and **process** a Regular run that includes employee X.
2. Now assign a new **benefit** to employee X from their profile.
3. Back on the processed run, click **Recalculate** (confirm text: "fresh results based on current employee data … tax profiles, statutory enrollments, salary").
4. Employee X's gross / net is unchanged — the new benefit isn't picked up. Create a fresh run for the same period and it *is* included.

**Expected:** Recalculate re-pulls benefit and deduction assignments too, or the confirm text says it won't.

---

## BETA-F-023 — Note · Phase 3

**Overtime gets no concessionary tax.** Overtime entered via an "Overtime"-type benefit is folded into chargeable income and taxed at full marginal PAYE — the Ghana junior-staff overtime relief (5% up to 50% of basic, 10% above) is never applied. The "Overtime Tax (Junior)" engine has no active rate (BETA-F-001) and there is no employee junior/senior designation to gate the relief. The arithmetic is correct *for the "ordinary income" interpretation*; whether that is the right treatment is a compliance question.

**Repro**

1. Create a benefit of **Type = Overtime** and assign it to a lower-paid employee.
2. Run a Regular payroll that includes them; process it.
3. Open the tax breakdown — the overtime amount is added to chargeable income and taxed at the employee's marginal PAYE rate; no 5% / 10% concessionary line appears.
4. Cross-check **Settings → Tax & Statutory → "Overtime Tax (Junior)"** — it shows "No active rate" (BETA-F-001), and there is no junior/senior field on the employee.

**Expected (pending compliance ruling):** for a qualifying junior employee, overtime up to 50% of basic is taxed at 5% and the excess at 10%.

---

## BETA-F-022 — Minor · Phase 3

An uncaught `TypeError: Cannot read properties of undefined (reading 'org')` fires during dashboard / benefits render. The page still paints — the framework swallows it — but it points to an unguarded access to an org object.

**Repro**

1. Open dev-tools console.
2. Load the **Dashboard** (or the Benefits screen) from cold.
3. Watch for `TypeError: Cannot read properties of undefined (reading 'org')` during render.

**Expected:** no uncaught exceptions on a normal page load.

---

## BETA-F-001 — Major · candidate

Three mandatory / automatic statutory items — Overtime Tax (Junior), Pension Excess, Tier 3 — show **"No active rate"** on a tenant the setup wizard reports as complete. Payroll runs anyway; those items would silently compute at 0%. Real impact unconfirmed (this run had no overtime or bonus).

**Repro**

1. **Settings → Tax & Statutory Configuration → Statutory Items**.
2. Look at **Overtime Tax (Junior)**, **Pension Excess**, and **Tier 3** — each shows **"No active rate"**.
3. Go back to the **Settings** hub — "Tax & Statutory Setup" is marked "Completed" and payroll runs are allowed.

**Expected:** mandatory/automatic statutory engines have an active rate before setup is "Completed", or the run warns when one would compute at 0%.

---

## BETA-F-002 — Major · candidate

Every module and settings page renders skeleton loaders for **8–30 seconds** on cold load. Consistent and reproducible.

**Repro**

1. Sign in and open the Payroll Manager module.
2. Navigate to any settings / setup page (e.g. **Settings → Organization Setup**, or the approval page for a run).
3. Time from route change to real content — it's routinely 8–30 s of skeleton placeholders. Hard-refresh to repeat.

**Expected:** content-ready within ~2–3 s; skeletons for a second or two at most.

---

## BETA-F-003 — Major · candidate

Bootstrap-Icons and RemixIcon web fonts **fail to load app-wide** (`OTS parsing error`, decode failures). Nav icons, button glyphs and status icons render blank; many icon-only controls have **no accessible name**. ~100 font errors per session.

**Repro**

1. Open dev-tools (Console + Network) and load any authenticated payroll page.
2. Console fills with `OTS parsing error` / font decode failures for Bootstrap-Icons and RemixIcon (~100 per session).
3. Visually: left-nav icons, button glyphs and status chips render as blank boxes or nothing.
4. Tab through the header — several icon-only controls announce no name to a screen reader.

**Expected:** icon fonts load; every icon-only control has an `aria-label` / accessible name.

---

## BETA-F-007 — Major · candidate

An employee whose **employment type is "Board"** is taxed as a regular employee — full graduated PAYE plus employee and employer SSNIT — unless someone separately applies the "Ghana Board Member" tax preset. Nothing warns that a Board member is being taxed the wrong way. (Confirms the earlier "employment type not wired to the tax engine" concern.)

**Repro**

1. Add an employee with **Employment type = Board** and a salary, without applying the "Ghana Board Member" tax preset.
2. Include them in a Regular run and process it.
3. Their tax = full graduated PAYE + employee & employer SSNIT — the same as an ordinary employee — not the flat 20% board-member withholding.
4. No warning appears that the employment type isn't matched to a tax treatment.

**Expected:** employment type drives (or at least prompts for) the correct tax preset; a Board member defaults to the 20% board rate or the run flags the mismatch.

---

## BETA-F-008 — Major · candidate

The **active pay-run list hides valid runs.** Its pay-date filter defaults to a window ending today, so a processed-but-unpaid run with a normal future pay date disappears and the tab reads `"No Active Payrolls — you don't have any payrolls in draft or approved status."` Clearing the filter brings it back.

**Repro**

1. Create a Regular run whose **pay date is in the future** (e.g. end of next month) and process it — don't pay.
2. Go to **Run Payroll** and stay on the default (Active) tab.
3. The tab reads "No Active Payrolls — you don't have any payrolls in draft or approved status", even though the run exists.
4. Open **Filters** and clear the "Pay date to" value → the run reappears.

**Expected:** the Active tab shows all non-paid runs regardless of pay date; the default date filter doesn't hide draft/approved runs.

---

## BETA-F-006 — Minor

The downloaded payslip **PDF** omits the employer SSNIT contribution, which PRQ-011's acceptance criteria call for. The in-app payslip modal does show it.

**Repro**

1. Open a paid run → an employee → **view payslip**. The in-app modal shows the employer SSNIT line.
2. Click **Download** and open the PDF.
3. The employer SSNIT contribution line is not in the PDF.

**Expected:** the PDF payslip carries the same employer-contribution detail as the in-app view (PRQ-011).

---

## BETA-F-004 — Minor

The Tier 1 config panel exposes only the combined 13.5% — an admin cannot verify the employee / employer split from Settings.

**Repro**

1. **Settings → Tax & Statutory Configuration** → open the **Tier 1** / SSNIT item.
2. Only the combined **13.5%** is shown — there is no employee 5.5% / employer 8% breakdown.
3. The split is only visible via **Reports → "Statutory & tax configuration history"**.

**Expected:** the config panel shows the EE / ER split it actually applies.

---

## BETA-F-009 — Minor · copy

A rejected salary value (negative or zero) reports "Base salary amount **is required**" rather than a range message; the "Bank and branch are required" error renders three times under one field group.

**Repro**

1. **Employees → Add Employee**. In the compensation step enter a base salary of `0` or `-1000` → the error says "is required" (not "must be greater than 0").
2. In the payment step, choose **Bank Transfer** and leave bank / branch / account blank → submit. "Bank and branch are required" renders three times under the one field group.

**Expected:** a value-range message for out-of-range salary; each validation error shown once.

---

## BETA-F-010 — Minor

A negative per-employee bonus override (e.g. −500) is silently ignored — the row keeps its default amount with no error, so the user isn't told their entry was rejected.

**Repro**

1. Create a **Bonus Payroll** run with a default per-employee amount.
2. On one employee row, override the amount to `-500` and move focus away.
3. The row silently snaps back to the default — no inline error, no toast.

**Expected:** a rejected override shows an inline error explaining why.

---

## BTL-#2 — Not built

There is **no way to delete or discard a payroll draft** — neither the list card nor the run detail offers it. Rejecting a submitted run only returns it to Processed. This matches the item still being on the backlog.

**Repro**

1. Create a Regular run (Draft or Processed).
2. Look for a delete / discard / cancel action — on the run list card, and on the run detail page.
3. None exists. Submitting then Rejecting only moves it back to Processed.

**Expected:** a draft / processed run can be deleted or cancelled (BTL onboarding #2).

---

## BETA-SEC-001 — To verify

The payment-document download link is a predictable tenant-scoped path (`/tenant/glenn_and_co/3/<file>`). A direct fetch returns the SPA shell rather than the file, so authorisation could not be judged from outside — re-test by capturing the real download request in an unauthenticated session.

**Repro (to complete)**

1. As an authed user, on a paid run with an attached payment document, open dev-tools Network and click **Download**. Copy the actual file request URL (and note any auth header / signed-token query param).
2. In a fresh **incognito** window (not signed in), request that exact URL.
3. Record the response: the file bytes (vuln), a 401/403 (safe), or a redirect to login.
4. Repeat with a signed-in user from a *different tenant* and with an incremented id in the path (IDOR).

**Expected:** the document is only served to authenticated users entitled to that tenant / run.

---

## BETA-F-005 — Trivial

Two CSS bundles are preloaded but reported "not used within a few seconds" — a preload misconfiguration.

**Repro**

1. Load any authenticated page with the dev-tools Console open.
2. See the browser warning: two `<link rel="preload">` CSS resources "not used within a few seconds".

**Expected:** preloaded resources are actually consumed on that page, or the preload hints are removed.

---

_34 findings. Full context, coverage %, calc traces and regression-spec mapping: the Claude artifact (`reports/beta-verification.html`) and `reports/BETA-REGRESSION-INDEX.md`._
