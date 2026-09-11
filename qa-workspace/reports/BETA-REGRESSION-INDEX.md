# Beta — Regression Spec Index

> 2026-09-10 · Maps every BETA test case (`evidence/beta/ledger.ndjson`, 180 checks — 95 PASS / 40 FAIL rows / 45 note). Distinct open candidate defects: **38** (BETA-F-032 retracted; BETA-F-011 by-design; BETA-F-012 & F-016 awaiting a finance/product ruling; +F-036 hire date, F-037 perf, F-038 responsive, F-039 a11y, F-040 doc download, F-041 profile-salary no-op, F-042 salary-adj self-approval, F-043 applied-adj preview re-projects, F-044 dup "Records" filter label, F-045 AI-chat mock, F-046 session not reset on enterprise-user switch). Maps each case to its permanent
> automation asset. New browser specs live in `automation/tests/browser/beta/` and run under the
> existing `browser` Playwright project. They are **guarded on `isBetaConfigured`** — set
> `BETA_BASE_URL`, `BETA_ADMIN`, `BETA_ADMIN_PASSWORD` (and optionally `BETA_BUSINESS`,
> `BETA_PAYROLL_URL`, `BETA_API_BASE_URL`) in `automation/.env`, then:
>
> ```
> npx playwright test --project=browser tests/browser/beta --workers=1
> ```

## Files added

| File | Covers |
|---|---|
| `tests/browser/beta/_beta-shell.ts` | Login helper: enterprise portal → module launcher → Payroll Manager; client-side nav (`betaReady`, `betaGo`, `betaGoUrl`). |
| `beta-employee-validation.browser.spec.ts` | Add-Employee wizard validation / negative / boundary. |
| `beta-payroll-calc.browser.spec.ts` | Oracle self-check + read-only assertions against the Paid September run; BETA-F-001. |
| `beta-bonus-and-combined.browser.spec.ts` | PRQ-012 standalone bonus (5% flat / above-cap stack); PRQ-013 combined **(pins current behaviour for BETA-F-012 — awaiting a finance ruling; the assertion is the trip-wire if the calc changes)**. |
| `beta-adjustments-and-exports.browser.spec.ts` | PRQ-016 salary adjustment + preview; BTL #5 bulk-adjust sheet; PRQ-014 statutory remittance + GRA PAYE schedule; BETA-F-013 (bank file missing). |
| `beta-benefits.browser.spec.ts` | BTL #4 (assigned benefit visible on profile), #6 (per-staff amount model), #7 (BIK seeding + rates). |
| `beta-state-machine.browser.spec.ts` | Next-open-period guard; Reject-needs-reason; file-type rejection; BTL #2 (no delete — fails today); BETA-F-008 (list filter hides runs — fails today). |
| `beta-run-types.browser.spec.ts` | **Phase 2** — Off-Cycle create validation + one-time calc (PAYE-only, no SSNIT); Termination severance-stacked calc + journal; BETA-F-016 (no proration to last working day — pins current behaviour, awaiting a finance/product ruling). Mutation-guarded on `BETA_ALLOW_MUTATION=1`. |
| `beta-eligibility-and-tax-lifecycle.browser.spec.ts` | **Phase 2** — BTL #1 (Regular locked to next period; Bonus back-date accepted — BETA-F-018, fails today); BTL #3 (In-active employee still in run — BETA-F-017, fails today); tax-liability Pending→Funded→Processing→Completed; GRA form aggregation + Mark as Filed. Mutation-guarded. |
| `beta-earnings-and-budgets.browser.spec.ts` | **Phase 3** — negative benefit amount rejected; Overtime-type benefit taxed as ordinary PAYE (no junior concession — see BETA-F-001); Recalculate doesn't re-pull benefit assignments (BETA-F-020, fails today); PRQ-007 budget create + validation + dashboard "Budget vs Actual"; PRQ-008 Employer Cost by Tier 8:5 split. Mutation-guarded. |
| `beta-reports-centre.browser.spec.ts` | **Phase 3** — read-only. Payroll Summary net-pay / off-cycle omission (BETA-F-024/025, fail today); Annual Payroll Report reconciliation (PASS); PAYE Reconciliation BIK omission (BETA-F-026, fails today); Statutory config history exposes the Tier 1 5.5/8 split + 20% Board rate. Guarded on `isBetaConfigured` only; self-skips with no data. |
| `beta-settings-modules.browser.spec.ts` | **Phase 3c** — Pay Schedule/PRQ-006 (all 5 frequencies), Approval Workflows (builder + **enforcement**: approval gated to the assigned approver, Admin cannot self-approve), Bank Setup (system-bank rename blocked — BUG-008 fixed), Finance Posting (GL connected), Attendance Integration (off by default), Organization Setup (blank Employer TIN — BETA-F-028, fails today), Users & Roles (4 seeded roles). Mutation block: pay-group member link (BUG-006 fixed), role→permission persistence. |
| `beta-rbac-personas.browser.spec.ts` | **Phase 4** — per-role access for the Payroll Employee / Reports personas: nav = Dashboard+Reports, privileged routes → `/forbidden`, `/setup/*` routes render without the permission (**asserts BETA-F-033 — fails today**), Create-Budget write → permission error, Reports Centre fully readable. Guarded on `isBetaConfigured`; self-skips per-persona when `BETA_EMPLOYEE` / `BETA_REPORT` absent. |
| `beta-approval-workflow-branches.browser.spec.ts` | **Phase 5** — reject / return-to-previous / safeguard-gate / off-cycle-through-workflow / audit-trail (BETA-F-034). Documentation + `test.fixme` guards; needs 3 personas in one run, so the live check is the manual ledger entry. |
| `beta-nonfunctional.browser.spec.ts` | **Phase 7** — axe-core sweep (BETA-F-039), dashboard time-to-content (BETA-F-037), 390 px responsive (BETA-F-038), unauthenticated API → 401 (pass). axe injected from cdnjs. The perf/responsive/a11y assertions **fail today** and flip green when the defects are fixed. |
| `beta-reports-and-session.browser.spec.ts` | **Phase 8** — Compensation Change History captures a Salary Adjustment (PASS), reversed date-range rejected (PASS), Leave/Attendance Payroll Impact schemas + dup "Records" label (BETA-F-044), AI-chat makes a real request (**fails today** — BETA-F-045), Penalties page shell. `test.fixme` for the session-switch (BETA-F-046) and profile-salary no-op (BETA-F-041) — both need multi-login / mutation. PII drill-down documented, blocked by F-046. |
| `config/env.ts` | `env.beta.*` block (now incl. `manager` / `employee` / `report` / `adminNew` personas) + `isBetaConfigured`. |

Also updated: `automation/.env` needs `BETA_API_BASE_URL=https://v2payroll.kedebahlite.com/api/v1/payrollApi` (the current value is the stale sandbox host).

> **Phase 2 mutation specs** create + process + pay real runs on "Glenn and Co". They self-skip unless `BETA_ALLOW_MUTATION=1` is set alongside the `BETA_*` credentials.

## Case → spec map

| TC-ID | Verdict | Spec |
|---|---|---|
| TC-BETA-ACCESS-001 | PASS | `_beta-shell.ts` (`betaReady`) exercised by every spec |
| TC-BETA-CFG-STAT-001 / PEN-001 / LOAN-001 | PASS | manual (BETA-02); `beta-payroll-calc` covers the items grid |
| TC-BETA-CFG-STAT-002 | **FAIL** BETA-F-001 | `beta-payroll-calc` › statutory items no-active-rate |
| TC-BETA-OBS-FONTS | **FAIL** BETA-F-003 | `bq.health()` console capture on any beta spec (font-decode errors) |
| TC-BETA-EMP-CREATE-001 | PASS | `beta-benefits` (creates + reads employee); factory pattern |
| TC-BETA-NEG-EMP-001..004, BND-EMP-007 | PASS | `beta-employee-validation` |
| TC-BETA-NEG-EMP-005 / 006 | PASS (UX gap) | manual (BETA-04) — dup-ID 422 only at final step |
| TC-BETA-RUN-001 / 002 / 003, LIFECYCLE-001 | PASS | manual walk-through (BETA-03) — mutation-heavy, kept out of regression |
| TC-BETA-CALC-SSNIT-001, PAYE-001/002, BIK-001, EMPLOYER-001 | PASS | `beta-payroll-calc` › oracle + Sept run |
| TC-BETA-BND-PAYE-TOP | PASS | `beta-payroll-calc` › oracle self-check (250k) |
| TC-BETA-JOURNAL-001 | PASS | manual (BETA-03) |
| TC-BETA-RUN-SAFEGUARD-001 | PASS | manual (BETA-03) |
| TC-BETA-PRQ001-001 / 011-00x / 015-001 | PASS | manual (BETA-03); file-type negative in `beta-state-machine` |
| TC-BETA-EDGE-BOARD-001 | **FAIL** BETA-F-007 | manual (BETA-04) — Board type not wired to Board tax |
| TC-BETA-NEG-RUN-001 | PASS | `beta-state-machine` |
| TC-BETA-NEG-RUN-002 | **FAIL** BETA-F-008 | `beta-state-machine` › active-list filter |
| TC-BETA-NEG-RUN-003 | PASS | `beta-state-machine` |
| TC-BETA-NEG-RUN-004 | ~~FAIL BETA-F-011~~ **CLOSED — by design** | user 2026-09-09: multiple regular runs per period are intentional (supplementary/corrective). Not a defect. |
| TC-BETA-BTL02-001 | **NOT BUILT** | `beta-state-machine` › draft cannot be deleted |
| TC-BETA-NEG-PRQ001-002 | PASS | `beta-state-machine` |
| TC-BETA-SEC-001 | NOTE (to verify) | manual — incognito re-test pending |
| TC-BETA-PRQ012-001, CALC-001/002/003 | PASS | `beta-bonus-and-combined` |
| TC-BETA-NEG-PRQ012-001 | **FAIL** BETA-F-010 | manual (BETA-04) — negative override silently ignored |
| TC-BETA-PRQ013-001 | **FINANCE RULING** BETA-F-012 | `beta-bonus-and-combined` — standalone vs combined bonus tax differ; finance to confirm correct treatment |
| TC-BETA-PRQ013-002 | NOTE | manual — Save-bonuses dialog doesn't self-close |
| TC-BETA-PRQ014-001 / 002 / 003 | PASS | `beta-adjustments-and-exports` |
| TC-BETA-PRQ014-004 | **FAIL** BETA-F-013 | `beta-adjustments-and-exports` › bank payment file missing |
| TC-BETA-NEG-PRQ014-001 | **FAIL** BETA-F-014 | manual (BETA-04) — generate with no period does nothing |
| TC-BETA-OBS-TAXBASIS | NOTE | manual — Tax Summary basis label "Gross Pay" vs config "Basic Salary" |
| TC-BETA-PRQ016-001 | PASS | `beta-adjustments-and-exports` |
| TC-BETA-NEG-PRQ016-001 | **FAIL** BETA-F-015 | manual (BETA-04) — empty create does nothing; sticky-bar overlap |
| TC-BETA-BTL04-001 | PASS (fix confirmed) | `beta-benefits` |
| TC-BETA-BTL05-001 | PASS | `beta-adjustments-and-exports` |
| TC-BETA-BTL06-001 | PASS (design) | `beta-benefits` |
| TC-BETA-BTL07-001 | PASS | `beta-benefits` |
| TC-BETA-NEG-OFC-001/002, EDGE-OFC-002 | PASS | `beta-run-types` — off-cycle create validation |
| TC-BETA-NEG-OFC-003 | NOTE | manual (Phase 2) — negative one-time amount: server 422, no UI error |
| TC-BETA-OFC-CALC-001 | PASS | `beta-run-types` — one-time = PAYE only, no SSNIT |
| TC-BETA-OFC-CALC-002 | NOTE | manual — off-cycle PAYE computed fresh from band 1 (stacking question) |
| TC-BETA-OFC-LIFECYCLE-001 | PASS | manual (Phase 2) — Draft→Processed→Approved→Paid |
| TC-BETA-NEG-TERM-001 | PASS | `beta-run-types` — Calculate/Save gated on employee + last working day |
| TC-BETA-TERM-CALC-001 | PASS | `beta-run-types` — severance stacked, SSNIT basic-only, journal 8,390 |
| TC-BETA-TERM-PRORATE-001 | **FINANCE + PRODUCT RULING** BETA-F-016 | `beta-run-types` — termination run pays full month basic; finance + product to decide if it should prorate |
| TC-BETA-TERM-LIFECYCLE-001 | PASS | manual (Phase 2) |
| TC-BETA-EMP-DEACTIVATE-001 | PASS | `beta-eligibility-and-tax-lifecycle` — status flips to In-active |
| TC-BETA-BTL03-001/002 | **FAIL** BETA-F-017 | `beta-eligibility-and-tax-lifecycle` — In-active employee still projected & paid |
| TC-BETA-BTL01-001 | PASS | `beta-eligibility-and-tax-lifecycle` — Regular locked to next open period |
| TC-BETA-BTL01-002 | **FAIL** BETA-F-018 | `beta-eligibility-and-tax-lifecycle` — Bonus accepts prior-tax-year pay date |
| TC-BETA-TAXLIAB-LIFECYCLE-001 | PASS | `beta-eligibility-and-tax-lifecycle` — Pending→Funded→Processing→Completed |
| TC-BETA-TAXLIAB-002 | NOTE | manual — no payment date / reference captured on transitions |
| TC-BETA-TAXLIAB-DUEDATE-001 | **FAIL** BETA-F-019 | manual (Phase 2) — termination due dates one month too late |
| TC-BETA-FORM-FILED-001 | PASS | `beta-eligibility-and-tax-lifecycle` — GRA form aggregation + Mark as Filed |
| TC-BETA-PRQ009-001 | PASS (design; not triggered) | manual — Penalties buckets present; needs a late-settlement scenario |
| TC-BETA-OT-001 | NOTE (superseded by OT-002) | manual — overtime entry path |
| TC-BETA-OT-002 | NOTE | `beta-earnings-and-budgets` — Overtime-type benefit taxed as ordinary income |
| TC-BETA-OT-CALC-001 | PASS | `beta-earnings-and-budgets` — oracle + fresh regular run |
| TC-BETA-RECALC-001 | **FAIL** BETA-F-020 | `beta-earnings-and-budgets` — Recalculate skips benefit assignments |
| TC-BETA-NEG-BEN-001 | PASS | `beta-earnings-and-budgets` — negative benefit amount |
| TC-BETA-NEG-PRQ007-001 / PRQ007-001 | PASS | `beta-earnings-and-budgets` — budget create + dashboard tile |
| TC-BETA-PRQ007-002 | **FAIL** BETA-F-021 | manual (Phase 3) — dashboard Actual YTD counts unpaid/duplicate drafts |
| TC-BETA-PRQ008-001 | PASS | `beta-earnings-and-budgets` — Tier 1:2 = 8:5 |
| TC-BETA-OBS-DASH-JS | NOTE BETA-F-022 | manual — uncaught TypeError on dashboard render |
| TC-BETA-RPT-INVENTORY | NOTE | manual — 7 categories / 12 report entries |
| TC-BETA-NEG-RPT-001 | **FAIL** (UX) | `beta-reports-centre` — Generate with no period = silent no-op |
| TC-BETA-RPT-SUMMARY-001 | **FAIL** BETA-F-024 | `beta-reports-centre` — Payroll Summary net pay nets out employer SSNIT |
| TC-BETA-RPT-SUMMARY-002 | **FAIL** BETA-F-025 | `beta-reports-centre` — Payroll Summary omits off-cycle run |
| TC-BETA-RPT-SUMMARY-003/004 | NOTE / PASS | manual — no benefits/deductions rows; xlsx export works (footer net contradicts body) |
| TC-BETA-RPT-PAYE-001/002 | **FAIL** BETA-F-026 / NOTE | `beta-reports-centre` — BIK excluded from chargeable while taxed; Tier1 relief differs from Payroll Summary |
| TC-BETA-RPT-ANNUAL-001 | PASS | `beta-reports-centre` — reconciles to every paid run |
| TC-BETA-RPT-YEAREND-001 | PASS | manual — reconciles; filing-status tracker; same BIK gap |
| TC-BETA-RPT-VARIANCE-001 | PASS | manual — same-period edge; net pay correct here |
| TC-BETA-RPT-COMPHIST-001 / ATTIMPACT-001 | NOTE | manual — both empty (no applied comp change / no attendance data) |
| TC-BETA-RPT-STATCFG-001 | PASS | `beta-reports-centre` — Tier1 5.5/8 + 20% Board visible; "BY" column empty |
| TC-BETA-PRQ006-001 | PASS | `beta-settings-modules` — Pay Schedule: 5 frequencies, Semi-Monthly per-half dates |
| TC-BETA-PG-001 / PG-MEMBER-001 | PASS (BUG-006 fixed) | `beta-settings-modules` — pay group + bi-directional member link |
| TC-BETA-APPR-001 | PASS | `beta-settings-modules` — 7 approval entities, all Inactive/0 stages |
| TC-BETA-BANK-001 | PASS (BUG-008 fixed) | `beta-settings-modules` — system bank name/code fields disabled |
| TC-BETA-FINPOST-001 | PASS | `beta-settings-modules` — 18 items + typed fallback; GL connected |
| TC-BETA-ATTINT-001 | PASS | `beta-settings-modules` — attendance master toggle Inactive |
| TC-BETA-ORG-001 | NOTE | manual — org form structure (skeleton-lag caveat) |
| TC-BETA-ORG-002 | **FAIL** BETA-F-028 | `beta-settings-modules` — "Completed" org with blank Employer TIN / SSNIT |
| TC-BETA-UR-001 | PASS | `beta-settings-modules` — 4 seeded roles |
| TC-BETA-UR-ROLEPERM-001 | PASS (silent no-op fixed) | `beta-settings-modules` — role keeps its permissions |
| TC-BETA-NEG-UR-002 | PASS | manual — Add User validation (required + email format) |
| TC-BETA-UR-CREATE-001 | **FAIL** BETA-F-029 / F-030 | manual — wizard role selection = silent no-op; post-create redirect 404s |
| TC-BETA-UR-USERTOROLE-001 | PASS | manual — Roles → role → Manage Users assigns 4 personas |
| TC-BETA-APPR-BUILD-001 | PASS | manual — 2-stage Pay Run workflow built + activated |
| TC-BETA-APPR-ENFORCE-001 / 002 | PASS | `beta-settings-modules` — approval gated to the current stage's assigned approver; a non-approver (Admin or non-current-stage user) has no Approve/Reject. Gating is real, not a render artifact. |
| TC-BETA-APPR-APPROVE-001/002 | ~~FAIL BETA-F-032~~ **RETRACTED** | manual — original "no Approve button" reading was pre-skeleton-render (BETA-F-002) + on a session reverted to the Admin user |
| TC-BETA-APPR-APPROVE-003 | PASS | manual — clean Manager-persona login (identity confirmed), Approve/Reject present, stage 1 approved → run advanced to stage 2 |
| TC-BETA-APPR-STAGE2-001/002 | NOTE (blocked) | manual — stage 2 assigned to ZZQA Admin Persona (+26, invite never completed); Broni (org owner) has no Approve button / no override on the stage-2 approval page |
| TC-BETA-APPR-REASSIGN-001 | **FAIL** BETA-F-031 | manual — editing the ACTIVE workflow to add a 2nd stage-2 approver → POST /approval-workflows/1 = 500 (org owner, even after stage 1 approved) |
| TC-BETA-USER-SETPW-001 | NOTE (gap) | manual — no admin reset-password / resend-invitation on the user detail page; can't provision a login for an uncompleted invite |
| TC-BETA-APPR-STAGE2-003 | PASS | manual — ZZQA Admin Persona (+26, BETA_ADMINNEW) approves stage 2; final confirm has a "Post Journal Entries" toggle; run → Approved |
| TC-BETA-APPR-PAID-001 | PASS | manual — Approved run → Mark Paid → Paid; shows in Payroll History. Full 2-stage workflow lifecycle verified end-to-end |
| TC-BETA-APPR-LOCKOUT-001 | **FAIL** BETA-F-031 | manual — active workflow with an in-flight run can't be deactivated/edited (raw 500, any role) + no recall path |
| TC-BETA-APPR-MULTIAPPROVER-001 | NOTE | manual — "Sequential (single approver)" stage accepts multiple approvers |
| TC-BETA-RBAC-MANAGER-001 | NOTE | manual — Payroll Manager persona has Settings + /settings/roles access (more than the role name implies) |
| TC-BETA-RBAC-EMPLOYEE-001 | NOTE | `beta-rbac-personas` — Payroll Employee: nav = Dashboard+Reports; sees whole-org dashboard + full Reports Centre (not self-service) |
| TC-BETA-RBAC-SETUP-GUARD-001 | **FAIL** BETA-F-033 | `beta-rbac-personas` — /setup/* routes render for Employee/Reports personas (Create/Add buttons shown); /settings correctly 403s |
| TC-BETA-RBAC-WRITE-NEG-001 | PASS | `beta-rbac-personas` — Create Budget as Employee → "You do not have permission to perform this action"; server-side write block holds |
| TC-BETA-RBAC-REPORTS-001 | NOTE | manual — Payroll Reports persona ≡ Payroll Employee persona at nav/dashboard/route level |
| TC-BETA-AUDIT-001 | NOTE / BETA-F-034 | manual — Full Audit Log records submit + final-stage approve + paid, but NOT the stage-1 (Manager) approval |
| TC-BETA-AUDIT-002 | **FAIL** BETA-F-035 | manual — "Approval Logs" tab filters action=approve but events are logged as "Approved" → tab always empty |
| TC-BETA-APPR-REJECT-001 | PASS | manual — stage-1 Reject: empty & whitespace reason blocked (trim); a real reason → run back to Processed; Reject not gated on safeguard ack |
| TC-BETA-APPR-RETURN-001 | PASS (+ UX note) | manual — stage-2 "Return to previous" bounces to the stage-1 approver (comment optional); pipeline still shows stage 1 "approved" — misleading |
| TC-BETA-APPR-SAFEGUARD-GATE-001 | PASS | manual — Approve button hidden until all soft tax-safeguard warnings acknowledged; acknowledgement carries across stages |
| TC-BETA-OFFCYCLE-WORKFLOW-001 | PASS | manual — off-cycle run through the 2-stage workflow incl. a reject + a return → Approved → Paid (GH₵ 499.50, calc exact) |
| TC-BETA-AUDIT-003 | **FAIL** BETA-F-034 | manual — run #11 trail logs Rejected + Returned_to_previous + final Approved + Paid, but NEITHER stage-1 approval (×2) |
| TC-BETA-APPR-ACTIVITY-HISTORY-001 | NOTE | manual — the per-run approval-page "Activity History" drops pre-reject events (scoped to the current submission cycle) |
| TC-BETA-APPR-SUBMIT-CONFIRM-001 | NOTE | manual — "Submit" submits into the workflow with no confirm dialog / no success toast (any role) |
| TC-BETA-PAYE-BANDEDGE-001 | PASS (9/9 exact) | manual — off-cycle one-time amount landed on every PAYE band ceiling (490/600/730/3896.67/19896.67/50416.67) + into 35% (100000→31082.84); all exact, round-half-up correct (731→18.68) |
| TC-BETA-OFFCYCLE-NEG-AMOUNT-001 | NOTE (BETA-F-010 family) | manual — negative one-time amount → server 422, no UI error, silently kept at 0 |
| TC-BETA-OFFCYCLE-DECIMALS-001 | PASS | manual — 3-decimal input (1000.567) rounded to 1000.57; no cap on the amount |
| TC-BETA-OFFCYCLE-GRID-REFRESH-001 | NOTE | manual — after Edit→Save the grid row / "Save & calculate" often don't refresh until a second Save (stale display) |
| TC-BETA-HIREDATE-FUTURE-001 | **FAIL** BETA-F-036 | manual — hire date can't be today/future; client says "≤ today", server says "< today"; blocks onboarding for the next actual pay period |
| TC-BETA-HIREDATE-BEFORE-PERIOD-001 | PASS | manual — ZZQA MidHire (hire 5 Sept, before Oct period) → full month basic 3,100 → net 2,526.09, exact (no proration, correctly) |
| TC-BETA-ADDEMP-WIZARD-LATEFAIL-001 | NOTE | manual — hire-date server rule only enforced on final "Save Employee", after all 6 steps; error is a top banner with no step nav |
| TC-BETA-NEGNET-001 | PASS | manual — deduction (1,500) > gross (1,000) → editor shows net −565.75 (no early warning), Process → HARD BLOCKER "Negative Net Pay"; run can't advance |
| TC-BETA-BONUS-CAP-BOUNDARY-001 | PASS | manual — bonus == exactly 15% cap on a clean employee (MidHire, 5,580) → GH₵ 279.00 = 5% flat, "Bonus Tax", exact |
| TC-BETA-BONUS-CAP-EXHAUSTED-001 | NOTE (dev check) | manual — same on AlphaOne (allowance used up): whole 5,400 → GH₵ 1,350 flat 25% "PAYE"; cumulative tracking works, flat-25% basis to confirm |
| TC-BETA-PERF-001 / 002 | **FAIL** BETA-F-037 | manual — cold load to content: /dashboard 14 s, /employees 32 s (GET /employees 26 s for 5 rows), /settings ~50 s (organization-data 3×); /user fetched 2× per route |
| TC-BETA-RESPONSIVE-001 | **FAIL** BETA-F-038 | manual — broken <1024 px: blank sidebar overlaps/clips content, no hamburger, horizontal scroll at 320/390 |
| TC-BETA-A11Y-001 | **FAIL** BETA-F-039 | manual — axe-core on /dashboard, /employees/add, /reports: critical button-name/label, serious link-name/contrast on every screen |
| TC-BETA-CONCURRENCY-001 | NOTE | manual — stale-tab double-submit → server 422 (guarded), client shows nothing |
| TC-BETA-SEC-001-API-AUTH | PASS | manual — payrollApi with no / garbage bearer → 401 on every endpoint |
| TC-BETA-SEC-001-DOC / TC-BETA-DOC-DOWNLOAD-001 | **FAIL** BETA-F-040 | manual — the API-advertised payment_documents[].url returns the SPA HTML shell (text/html, 5.5 KB), not the 451-byte PDF; download broken, security inconclusive |
| TC-BETA-RPT-COMPHIST-002 | PASS | manual — Salary Adjustment #2 (ZZQA MidHire +₵200) captured in Compensation Change History with old ₵3,250 → new ₵3,450, delta, linked source, actor (Broni Danso) |
| TC-BETA-EMPEDIT-SALARY-001 / -002 | **FAIL** BETA-F-041 | manual — profile Edit Employee "Base salary" field is a silent no-op: POST /employees/6 body omits base_salary; GET /salary/full unchanged (3450), updated_at stale |
| TC-BETA-ADJ-APPROVAL-001 | NOTE BETA-F-042 | manual — Salary Adjustment approval is single-stage self-approval (one click approves + applies), unlike the 2-stage pay-run workflow |
| TC-BETA-ADJ-PREVIEW-STALE-001 | NOTE BETA-F-043 | manual — after an adjustment is Applied, its Preview re-projects another +₵200 off the current salary, status "To update", Refresh stays enabled |
| TC-BETA-RPT-LEAVE-IMPACT-001 | NOTE | manual — Leave Payroll Impact renders (5 KPIs, filters, schema), /summary → 200 empty; needs a confirmed leave through a pay run |
| TC-BETA-RPT-ATT-IMPACT-001 | NOTE BETA-F-044 | manual — Attendance Payroll Impact renders; two filter dropdowns both labelled "Records"; KPI mixes 0 and "—"; needs OT/absence through a pay run |
| TC-BETA-RPT-DATERANGE-NEG-001 | PASS | manual — reversed from/to date range → inline error, Apply disabled, no query fired |
| TC-BETA-AI-CHAT-001 | NOTE BETA-F-045 | manual — /chat "Payroll Chat Assistant" is a front-end mock: no network on send, canned unrelated replies, fabricated actions in the seed thread, header says "Online" |
| TC-BETA-SEC-SESSION-SWITCH-001 | **FAIL** BETA-F-046 | manual — after portal sign-out + sign-in as a different user + re-launch Payroll, GET /payrollApi/user still returns the prior user (Broni, is_payroll_super_admin) with the full 56-permission set |
| TC-BETA-SEC-PERSONA-PROVISION-001 | NOTE | manual — ZZQA Reports Persona's ?auth= SSO handoff into Payroll never sets a bearer token (401 on /user); can't obtain an isolated payroll session |
| TC-BETA-RPT-COMPHIST-PII-001 | NOTE (blocked) | manual — Reports-persona PII drill-down blocked by BETA-F-046; re-run once the persona is provisioned as a payroll user |
| TC-BETA-PRQ009-PENALTIES-001 | NOTE | manual — Penalties page verified structurally (4 buckets, schema, empty state, auto-trigger copy); no overdue liability / backdated run available to trigger a real penalty + waiver flow |

## Findings register (candidate — need dev ruling)

| ID | Sev | One-liner |
|---|---|---|
| BETA-F-001 | Major | 3 mandatory statutory items ("Overtime Junior", "Pension Excess", "Tier 3") have no active rate on a "setup complete" tenant. |
| BETA-F-002 | Major | 8–30 s skeleton page loads across the app. |
| BETA-F-003 | Major | Bootstrap/Remix icon fonts fail to load app-wide → blank icons, icon-only controls with no accessible name. |
| BETA-F-007 | Major | Employment type "Board" is taxed as a regular employee (full PAYE + SSNIT), not the flat 20% Board WHT, unless a preset is applied — silently. |
| BETA-F-008 | Major | Active pay-run list's default date filter hides a processed run with a future pay date → misleading "No Active Payrolls". |
| ~~BETA-F-011~~ | ~~Major~~ **CLOSED — by design** | Multiple regular runs per period are intentional (supplementary/corrective). User-confirmed 2026-09-09. The cost-dashboard double-count remains open under BETA-F-021. |
| BETA-F-012 | **Finance ruling** | Standalone bonus run = 5% flat within the annual cap; the same bonus added to a regular run is taxed at marginal PAYE (GH₵ 150 vs ~GH₵ 670 on a 3,000 bonus). Finance to confirm which is correct and whether the paths must agree. |
| BETA-F-013 | Major | PRQ-014 bank payment / EFT disbursement file is not available anywhere. |
| BETA-F-016 | **Finance + product ruling** | Termination run pays the FULL month basic salary — no proration to the last working day, though the field help text says "used to prorate the final pay period". Finance + product to decide intended behaviour / day-count basis, or fix the copy. |
| BETA-F-017 | Major | An In-active / deactivated employee (profile: "Payroll: Excluded — employment status") is still projected into and PAID by a Regular run. (BTL #3 — not fixed.) |
| BETA-F-019 | Major | Termination-run statutory liabilities & forms are dated 15th/14th of the month **two** months after the period (Oct period → shown Dec), suppressing overdue status and penalties. |
| BETA-F-018 | Minor/Major | A Bonus run accepts a pay date in a prior/closed tax year (2025-01-15) with no warning — corrupts the cumulative 15%-cap tracking. Regular runs are correctly locked. |
| BETA-F-020 | Minor/Major | "Recalculate" on a Processed pay run re-pulls tax profile / salary but NOT benefit/deduction assignments — a newly assigned benefit is silently omitted; a fresh run includes it. |
| BETA-F-021 | Major | Dashboard "Budget vs Actual / Actual YTD", "Employer Cost by Tier" and "Payroll Cost Summary" count every Processed run (incl. unpaid duplicate drafts) — Actual YTD inflated ~65× (GH₵1.2M vs ~GH₵18k real). Fix = sum paid amounts, not every Processed draft (multiple runs per period are legitimate — see BETA-F-011). |
| BETA-F-022 | Minor | Uncaught `TypeError: Cannot read properties of undefined (reading 'org')` during dashboard/benefits render. |
| BETA-F-023 | Note | Overtime earnings are taxed as ordinary PAYE — the Ghana junior-staff overtime concession (5% / 10%) is never applied; the "Overtime Tax (Junior)" engine has no active rate (BETA-F-001) and there is no employee junior/senior designation. |
| BETA-F-024 | Major | Payroll Summary Report "Net Pay" nets out the full Tier 1 + Tier 2 (incl. employer contributions) → GH₵ 5,228.37 shown vs GH₵ 6,268.37 correct; the report's own xlsx footer says 6,268.37, so it is internally inconsistent. |
| BETA-F-025 | Major | Payroll Summary / PAYE Reconciliation / Variance reports omit the off-cycle run from a period (Sept gross shown 8,000, should be 9,000; PAYE 1,291.63 vs 1,357.38). The Annual & Year-End reports include it. |
| BETA-F-026 | Minor/Major | PAYE Reconciliation & Year-End exclude benefits-in-kind from "Chargeable Income" while the PAYE figure taxes it → the reports do not reconcile (chargeable 7,560 / 16,395 vs correct 8,060 / 16,895). |
| BETA-F-028 | Major | Organization Setup is marked "Completed" (and "Payroll setup completed") with a blank Employer TIN and blank Employer SSNIT Number — statutory exports (GRA PAYE schedule header, SSNIT returns) are generated without the mandatory employer identifiers, with no warning. Neither field is marked required. |
| BETA-F-029 | Major | The "Add User" wizard's role selection is a silent no-op — users are created with "No roles" even when a role is ticked. Roles must be attached afterwards via Roles → role → Manage Users. |
| ~~BETA-F-032~~ | ~~Critical~~ **RETRACTED** | Withdrawn 2026-09-09 on re-test. "No Approve button for the assigned approver" was an artifact of the approval page's ~10 s skeleton render (BETA-F-002) read too early, on a session that had reverted to the Admin user. On a clean Manager-persona login the Approve/Reject buttons are present; stage 1 was approved and the run advanced to stage 2. Covered now by passing TC-BETA-APPR-APPROVE-003 / ENFORCE-002. |
| BETA-F-031 | Major | An active approval workflow with any in-flight pay run cannot be deactivated (`POST …/status` → 500, any role) or edited (`PUT …` → 500) — raw 500s, no user-facing error. A submitted run has no recall path. So a stuck run can't be re-pointed to a different approver or cleared without a server-side fix. |
| BETA-F-030 | Minor | After "Add User" the wizard redirects to the wrong user id (`/users/576` → GET 404) instead of the new user's detail page. |
| BETA-F-033 | Major | `/setup/*` config routes (budgets, banks, pay-groups, statutory-rules) are NOT behind the role guard that protects `/settings` — a Payroll Employee / Reports persona can open them and see the Create/Add/Edit controls. Writes are blocked server-side; `/setup/budgets` GET also leaks real budget data to these roles. |
| BETA-F-034 | Major (compliance) | The immutable audit trail records only the FINAL approval stage of a multi-stage workflow — stage-1 (Manager) approval of Pay Run #3 is absent from the Full Audit Log (present only in the run's own Activity History). Possible 25-row cap on the log query too. |
| BETA-F-035 | Minor | The "Approval Logs" audit tab queries `filter[action]=approve` but events are stored as `Approved` / `Submitted_for_approval`, so the tab is permanently empty. |
| BETA-F-036 | Major | Employee hire date can't be today or later — client rule "today or earlier" (allows ==today) vs server rule "before today" (rejects ==today); the mismatch means the whole 6-step wizard fails only at the end. Blocks onboarding for the current/next pay period (pay calendar is Oct, clock is 9 Sept) and makes mid-period new-hire proration unreachable. Two hire-date fields ("First Day of Work" / "Hire date") for one concept. |
| BETA-F-037 | Major (perf) | Time-to-content: /dashboard 14 s, /employees 32 s (GET /employees = 26 s for 5 rows), /settings ~50 s (GET /organization-data fired 3× — 9/18/28 s). DOM shell ready in ~400 ms, transfer ~10 KB — pure backend/orchestration latency. GET /user fetched twice per route; /setup-completion on routes that don't need it. Quantified form of BETA-F-002. |
| BETA-F-038 | Major (responsive) | No mobile/tablet layout — below 1024 px a phantom ~240 px blank sidebar overlaps and clips the main content (~200 px lost on the left), no hamburger, top-nav collides with header icons, horizontal scroll at 320/390 px. Desktop-only. |
| BETA-F-039 | Major (a11y) | axe-core (WCAG2 A/AA + best-practice) on /dashboard, /employees/add, /reports — critical/serious on every screen: button-name (critical), link-name (serious ×3), label (critical — unlabelled date/number inputs), color-contrast (serious, 9-25 nodes), landmark-one-main + region (moderate), heading-order. Compounded by BETA-F-003 (icon fonts fail → blank + unnamed controls). |
| BETA-F-040 | Major | The payment_documents[].url the API returns for an uploaded proof-of-payment resolves to the SPA catch-all — fetching it (authed or not) returns text/html (the 5.5 KB app shell), not the 451-byte PDF. The "download" link is broken; BETA-SEC-001 file-authorization stays inconclusive (no file handler reachable). |
| BETA-F-041 | Major | The employee-profile "Base salary (GHS)" field (Edit Employee form + Compensation section) is editable but its value is never sent — POST /employees/6 carries only identity/job fields; GET /employees/6/salary/full keeps the old basic_salary, updated_at doesn't move. Success toast, no error. Salary can only be changed via a Salary Adjustment. Same silent-no-op pattern as BETA-F-029. |
| BETA-F-042 | Minor (governance) | Salary Adjustments use single-stage self-approval — Draft → Submit → one "Approve" click by the same admin both approves and applies the change ("Approved and applied to employee salaries"). No maker/checker, no second stage, no distinct apply step — unlike the 2-stage Pay Run approval workflow. Product/finance to decide if salary rounds need the same governance. |
| BETA-F-043 | Minor | After a Salary Adjustment reaches Applied, its detail-page Preview keeps computing off the current salary — showed old ₵3,450 → new ₵3,650, status "To update" (another +₵200 on the already-raised figure), Refresh still enabled. No re-apply control is exposed so no data impact, but it misrepresents an applied round as pending. |
| BETA-F-044 | Minor (UI) | Attendance Payroll Impact has two adjacent filter dropdowns both labelled "Records" (one "All Records", one "Corrected & original"). Also the KPI strip mixes formats — "Employees affected: 0" but "Overtime hours: —". |
| BETA-F-045 | Minor | The "/chat" → "/ai/assistant" "Payroll Chat Assistant" is a front-end-only mock: hard-coded conversation list, header "Payroll Support — Online", sending a message fires no network request, replies are canned strings unrelated to the question, and the seed thread contains a fabricated action ("I've corrected the entry"). Ship a "demo/placeholder" label or a working assistant. |
| BETA-F-046 | Major (security) | Switching enterprise user does not reset the Payroll session. After portal sign-out + sign-in as a different user (ZZQA Reports Persona) + re-launching Payroll Manager, GET /api/v1/payrollApi/user still returns central_user id 575 "Broni Danso" with is_payroll_super_admin:true and localStorage payroll_permissions still the full 56-perm admin set; the new user's ?auth= SSO handoff never replaces the stale bearer token. On a shared machine, user B operates as user A (a super admin). Also blocks the Reports-persona PII drill-down test. |
| BETA-F-006 | Minor | Payslip PDF omits employer SSNIT. |
| BETA-F-004 | Minor | Tier 1 config panel hides the EE/ER split. |
| BETA-F-009 | Minor (copy) | "is required" shown for out-of-range salary; "Bank and branch" error renders 3×. |
| BETA-F-010 | Minor | Negative per-employee bonus override silently ignored. |
| BETA-F-014 | Minor | Statutory Remittance "Generate Report" with no period does nothing (no error). |
| BETA-F-015 | Minor | Salary Adjustment empty-create does nothing; sticky action bar overlaps the LINES header. |
| BETA-F-005 | Trivial | CSS bundles preloaded but "not used". |
| BTL #2 | Not built | No delete/discard for a payroll draft. |
| BETA-SEC-001 | To verify | Payment-doc download URL is a predictable tenant path — incognito IDOR re-test pending. |
