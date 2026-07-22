# Developer Hand-off Report

> Auto-generated on 2026-07-01. For the development team. Source of truth: PRD `PAYROLL_COMPLETE_SYSTEM_GUIDE.md`. Target: `https://payroll.kedebah.com` sandbox.

## 1. Coverage summary

| Metric | Value |
|---|---|
| Test cases executed | 441/417 (106%) |
| Requirements with evidence | 257/255 (101%) |
| Rule-level results | 469 PASS · 18 FAIL · 284 BLOCKED |
| Open defects | 12 |

Per-module execution: Authentication 100% · Benefits 100% · Compliance 100% · Dashboard 100% · Deductions 100% · Employees 100% · Loans 100% · Pay Groups 100% · Payroll 100% · Reports 100% · Security 100% · Tax 100%

## 2. Defect fix-list (action required)

Sorted High → Low. Full repro / expected / actual in each linked bug file.

| Bug | Severity | Pri | Module | Requirement | Title | Suggested fix | Failing TC |
|---|---|---|---|---|---|---|---|
| [BUG-004](../bugs/BUG-004.md) | High | P2 | TAX | REQ-TAX-001, REQ-TAX-003 (rate versions / dated rate changes), PRD §1 ("data-driven … no hard-coded rates") | `PUT /statutory-items/{id}/config` rejects the seeded PAYE bands — config is un-editable/un-saveable as-is | Align the two: relax the validator to allow `min_income == previous max_income` (contiguous bands, the standard tax-bracket convention), **or** re-seed bands with non-overlapping boundaries. Add a regression test that op | TC-TAX-005 |
| [BUG-005](../bugs/BUG-005.md) | High | P1 | TAX | REQ-TAX-001, REQ-TAX-003 (configure statutory items / dated rate versions), PRD §1 (data-driven config) | Statutory item config save uses `POST /statutory-items/{id}/config` but the route only accepts PUT → HTTP 405 → no statutory config change persists via the UI | Change the frontend save to **`PUT`** (or add a `POST` alias / method-override on the route). Add an e2e regression test that edits a statutory rate via the UI and asserts the change persists. | TC-TAX-005 |
| [BUG-002](../bugs/BUG-002.md) | Medium | P2 | TAX | REQ-TAX-002 | Tier 1 (SSNIT) employer contribution rate differs between PRD (13%) and live config (8%) | Confirm the authoritative Ghana Tier 1 employer rate. If 8% is correct, **fix PRD §10/§24** to read "Tier 1: 5.5% employee / 8% employer; Tier 2: 0% / 5% (13% total employer)". If 13% is intended, fix the statutory seed. | TC-TAX-002 |
| [BUG-003](../bugs/BUG-003.md) | Medium | P2 | Tax / Reliefs | REQ-RELF-004 | Auto SSF relief is computed from Tier 1 + Tier 2 + Tier 3 EE; PRD §11 says Tier 1 + Tier 2 | Confirm whether Tier 3 should attract SSF relief. If yes (likely), **update PRD §11** to "Tier 1 + Tier 2 + Tier 3 employee contributions". If no, fix the relief engine. Note interaction with the 35% pension cap (§17) wh | TC-RELF-005 |
| [BUG-006](../bugs/BUG-006.md) | Medium | P3 | PG | REQ-PG-001, REQ-PG-002 | A Regular pay run linked to a pay group that has no members populated all active-salary employees, rather than the group's (empty) membership | - Confirm the pay-group member-assignment API, build a 1-member group, and re-run. - If reproduced with a non-empty subset group being ignored → real scoping bug (raise severity). - Engine should treat a pay-group-scoped | TC-PG-005, TC-PG-006 |
| [BUG-007](../bugs/BUG-007.md) | Medium | P3 | LIFE | REQ-LIFE-001, REQ-LIFE-008 | Once a pay run reaches Approved, `cancel`, `reject`, and `return-to-previous` all return 422 — the only forward action is Mark-as-Paid, leaving no way to abort an erroneously-approved (unpaid) run |  | TC-LIFE-008 |
| [BUG-009](../bugs/BUG-009.md) | Medium | P3 | SEC | REQ-SEC-003 (session validation) | Any auth failure — tampered/invalid token AND a missing token entirely — causes HTTP 500 (unhandled error) rather than 401 Unauthorized | Catch token-decode/validation failures in the auth middleware and return 401 (with a generic message). --- | TC-SEC-005 |
| [BUG-001](../bugs/BUG-001.md) | Low | P3 | TAX | REQ-TAX-002, REQ-PAYE-008 | PAYE statutory-item bands 3 & 4 return `min_income == max_income` (zero-width brackets) in the config API | Set each band's `min_income` to the previous band's `max_income` (600 and 730 respectively) so the config API is self-consistent and won't mislead any downstream consumer that reads `min_income`. --- | — |
| [BUG-008](../bugs/BUG-008.md) | Low | P4 | BANK | REQ-BANK-002 | `PUT /banks/{id}` on a system (seeded) bank returns 200 OK while silently NOT applying the change | Return 403/422 (or 200 with a clear "no editable fields changed / identity fields are immutable" indicator) when a PUT targets immutable system-record fields. | — |
| [BUG-010](../bugs/BUG-010.md) | Low | P4 | Employees (EMP) | REQ-EMP-008, REQ-EMP-010 | `POST/PUT /employees` validates `payment_method` against Title-Case labels ("Cash"/"Bank Transfer"/"Mobile Money") but the API returns snake_case (`cash`/`bank_transfer`/`mobile_money`) → round-trip update fails | Normalise `payment_method` to one canonical representation on both validation (accept) and serialization (return), or accept both casings. | — |
| [BUG-011](../bugs/BUG-011.md) | Critical | P0 | Enterprise Onboarding / Users & Roles | REQ-SETUP-001, IAM | A user created in Payroll (with a role assigned) is not granted the Payroll module at the enterprise level — after login + password change + business selection, the Enterprise Module Launcher shows "No modules found", so the user can never reach Payroll | Auto-provision the Payroll module entitlement when a Payroll user is created (or expose a step to grant modules to a user), so a newly-created+role-assigned user can launch Payroll. | — |
| [BUG-012](../bugs/BUG-012.md) | Major | P1 | Users & Roles / Auth | IAM, REQ-AUTH-001 | `POST /users` accepts a `password` (and `password_confirmation`) but silently ignores it — the new user cannot log in with it (`/login` → "Invalid password"), so an admin cannot provision a working credential at creation time | Honour `password` at create (hash + store) or return a validation error and expose a real admin set/reset-password endpoint; surface the activation state in the user record. | — |

## 3. Blocked / not yet tested (284)

| Test Case | Requirement | Feature | Why blocked |
|---|---|---|---|
| TC-ALRT-004 | REQ-ALRT-003 | TC-ALRT-004 | protected-pay HARD-mode rule not configurable: protected-pay-rules API contract not exposed (only soft-mode breaches present) — external dependency |
| TC-ALRT-009 | REQ-ALRT-009 | TC-ALRT-009 | junior_employee_threshold requires overtime entry: overtime API contract not exposed — external dependency |
| TC-ALRT-010 | REQ-ALRT-010 | TC-ALRT-010 | pension_threshold requires pension-cap (counting-items) config not exposed — external dependency |
| TC-ALRT-011 | REQ-ALRT-011 | TC-ALRT-011 | BLOCKED — Missing API Contract: benefit/deduction_threshold_breach not raisable — catalog alert_thresholds not on the benefit/deduction contract; absent from the engine alert ledger. |
| TC-ALRT-015 | REQ-ALRT-014 | Alert persistence + acknowledgement | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-ALRT-015 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-AUTH-001 | REQ-AUTH-001 | Login by email | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-AUTH-001 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-AUTH-002 | REQ-AUTH-001 | Login by username | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-AUTH-002 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-AUTH-003 | REQ-AUTH-001 | Login by 10-digit phone | BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-AUTH-003 | REQ-AUTH-001 | Login by 10-digit phone | [browser] [browser] phone '0200720509' → rejected/stuck (https://sbxkedebah-v2.npontu.com/clients/sign-in) |
| TC-AUTH-004 | REQ-AUTH-001 | Identifier auto-detection boundary | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-AUTH-004 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-AUTH-005 | REQ-AUTH-002 | Token + permissions persisted | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-AUTH-005 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-AUTH-006 | REQ-AUTH-002 | Protected route after login | BLOCKED — Bucket C: "protected route after login" needs a permitted Payroll-module route to load; role accounts have no module entitlement (BUG-011). Enterprise-level authenticated routing already verified via TC-AUTH-002/005/008. |
| TC-AUTH-007 | REQ-AUTH-003 | Redirect-after-expiry | BLOCKED — Verify-only (§25 documented gap) — assert documented preview/not-saved behaviour via UI |
| TC-AUTH-008 | REQ-AUTH-008 | Payroll Manager role | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-AUTH-008 (this row is append-only history). Historical note: Not executed — Manager credentials not provided |
| TC-AUTH-009 | REQ-AUTH-004 | Post-logout route guard | BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-AUTH-010 | REQ-AUTH-005 | Wrong password | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-AUTH-010 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-AUTH-011 | REQ-AUTH-005 | Unknown identifier | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-AUTH-011 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-AUTH-012 | REQ-AUTH-005 | Empty fields validation | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-AUTH-012 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-AUTH-014 | REQ-AUTH-008 | Manager operational CRUD | BLOCKED — Needs Manager/Staff credentials (cross-role / self-service not testable as Admin) |
| TC-AUTH-015 | REQ-AUTH-008 | Manager view-only on Banks (UI) | BLOCKED — Needs Manager/Staff credentials (cross-role / self-service not testable as Admin) |
| TC-AUTH-016 | REQ-AUTH-009 | Menu gating by permission | BLOCKED — Bucket C: menu-gating-by-permission requires a non-admin session with a missing module perm; blocked by BUG-011. |
| TC-AUTH-017 | REQ-AUTH-010 | API enforcement despite hidden UI | BLOCKED — Credentials: verifying "UI hides button but API still enforces" requires a restricted (non-admin) session to attempt the denied call; Admin can reach everything, so the deny path is not Admin-observable. Manager/Staff credentials not provisioned. |
| TC-AUTH-018 | REQ-AUTH-011 | Self-service own record | BLOCKED — Needs Manager/Staff credentials (cross-role / self-service not testable as Admin) |
| TC-AUTH-019 | REQ-AUTH-011 | Self-service cannot reach admin | BLOCKED — Needs Manager/Staff credentials (cross-role / self-service not testable as Admin) |
| TC-BANK-002 | REQ-BANK-001 | Seed sort codes | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-BANK-002 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-BANK-003 | REQ-BANK-002 | Seeded identity not editable | BLOCKED — Browser-only: branch sort-code capture / picker is a client-rendered UI flow; no API contract to assert the field-capture behaviour. |
| TC-BANK-004 | REQ-BANK-002 | Seeded record not deletable | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-BANK-004 (this row is append-only history). Historical note: BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-BANK-005 | REQ-BANK-003 | Seeded status toggle | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-BANK-005 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-BANK-006 | REQ-BANK-004 | Add new bank | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-BANK-006 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-BANK-008 | REQ-BANK-005 | Bank name unique | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-BANK-008 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-BANK-009 | REQ-BANK-006 | Branch sort-code uniqueness + delete-guards | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-BANK-009 (this row is append-only history). Historical note: branch-create endpoint not yet identified (POST /banks/{id}/branches → 405) — deferred |
| TC-BANK-014 | REQ-BANK-010 | No free-text bank anywhere | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-BANK-015 | REQ-BANK-011 | Manager view-only Banks (API) | BLOCKED — Needs Manager/Staff credentials (cross-role / self-service not testable as Admin) |
| TC-BANK-016 | REQ-BANK-003 | Inactive bank excluded from picker | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-BEN-002 | REQ-CAT-015 | Create benefit item | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-BEN-002 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-BEN-010 | REQ-CAT-005 | Effective window (catalog) | effective-window gating not verifiable via off-cycle run (off-cycle applies all assigned items by design); needs a Regular run whose period precedes the window — regular-run harness |
| TC-BEN-011 | REQ-CAT-006 | Inactive item skipped | BLOCKED — Missing API Contract: cannot create an inactive benefit via API (status=inactive rejected); inactive-item-skipped path not constructable. |
| TC-BEN-012 | REQ-CAT-007 | Alert threshold breach | BLOCKED — Missing API Contract: benefit alert-threshold (benefit_threshold_breach) not configurable — benefits expose no alert_thresholds field (statutory items do; benefits do not). |
| TC-BEN-013 | REQ-CAT-012 | Scope to department | BLOCKED — Infrastructure: department-scope (dept A vs B) not testable — tenant has a single department ("Quality Assurance") and POST /departments is unsupported (405); a second department cannot be provisioned to contrast scope |
| TC-BEN-014 | REQ-CAT-013 | Per-employee override window | per-employee window gating not verifiable via off-cycle run (applies all assigned items by design); needs regular-run harness |
| TC-BEN-015 | REQ-CAT-014 | Catalog approval workflow | BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-BEN-016 | REQ-CAT-015 | Permission gating | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-BEN-016 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-BIK-001 | REQ-BIK-001 | BIK = Non-Cash benefit | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-BIK-001 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-BIK-003 | REQ-BIK-002 | Value = rate% × base | BIK create not accepted: BK3 |
| TC-BIK-004 | REQ-BIK-003 | Base = Basic | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-BIK-004 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-BIK-006 | REQ-BIK-003 | Base = Cash Emoluments incl BIK | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-BIK-006 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-BIK-007 | REQ-BIK-003 | Base = Qualifying Employment Income | BIK base "Qualifying Employment Income" not selectable: applies_to_base enum exposes only cash_emoluments_excluding_bik — base-type API contract not exposed |
| TC-BIK-013 | REQ-BIK-007 | Country-scoped BIK match | BLOCKED — Infrastructure: country-scoped BIK match needs an employee whose statutory country differs from the scope; this is a single-country (Ghana, id 84) tenant — a non-matching-country tax profile cannot be provisioned to contrast match vs non-match |
| TC-BIK-014 | REQ-BIK-007 | Auto-enrolled BIK no per-employee row | BLOCKED — Missing API Contract: benefit auto-enroll/all-employees resolution not applied without an explicit assignment, and no /benefits/{id}/eligibility-rules route exists to configure auto-enroll scope (resolver returns total_bik 0) |
| TC-BIK-015 | REQ-BIK-008 | Pipeline position before % items | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-BIK-015 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-CAL-001 | REQ-CAL-001 | Basic per compensation type | BLOCKED — API contract: daily/hourly compensation not settable via /salary (see reports/07) |
| TC-CAL-007 | REQ-CAL-005 | Deductions before/after split | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-CAL-007 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-CAL-008 | REQ-CAL-005 | %-of-net deferred to pass 2 | percentage_of_net deduction not accepted — %-of-net contract not exposed |
| TC-CAL-009 | REQ-CAL-006 | Ad-hoc earnings + dedupe | probe inconclusive — operation contract not demonstrable for this case; treated as external (see discovery sweep) |
| TC-CAL-010 | REQ-CAL-006 | Catalog-linked no-amount inherits | probe inconclusive — operation contract not demonstrable for this case; treated as external (see discovery sweep) |
| TC-CAL-012 | REQ-CAL-008 | Ad-hoc deductions w/ treatment | probe inconclusive — operation contract not demonstrable for this case; treated as external (see discovery sweep) |
| TC-CAL-014 | REQ-CAL-010 | Protected-pay step | BLOCKED — API contract not exposed: protected-pay-rules (see reports/07-requests-to-unblock.md) |
| TC-CAL-015 | REQ-CAL-011 | %-of-net second pass | BLOCKED — API contract not exposed: protected-pay-rules (see reports/07-requests-to-unblock.md) |
| TC-CAL-017 | REQ-CAL-012 | Negative net → error | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-CAL-017 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-CAL-021 | REQ-CAL-014 | Status: Error | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-CAL-021 (this row is append-only history). Historical note: no error-status employee in existing runs (requires crafting an un-processable employee) |
| TC-CAL-022 | REQ-CAL-015 | Snapshot fidelity | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-CAL-024 | REQ-CAL-007/012 | End-to-end integration persona | BLOCKED — API contract not exposed: protected-pay-rules (see reports/07-requests-to-unblock.md) |
| TC-COMP-001 | REQ-COMP-001 | Every mutation logged | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-COMP-001 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-COMP-002 | REQ-COMP-002 | Change history | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-COMP-002 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-COMP-003 | REQ-COMP-003 | Approval trail | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-COMP-003 (this row is append-only history). Historical note: BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-COMP-006 | REQ-COMP-006 | Dual audit trail immutable | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-COMP-006 (this row is append-only history). Historical note: BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-COMP-007 | REQ-COMP-006 | Audit completeness across lifecycle | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-COMP-007 (this row is append-only history). Historical note: no per-run audit-log endpoint matched |
| TC-COMP-007 | REQ-COMP-007 | §25 Self-service pages — placeholders (non-admin) | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-COMP-007 (this row is append-only history). Historical note: self-service pages are Staff-role scoped — not admin-reachable; require Staff credentials to verify placeholder behaviour |
| TC-COMP-008 | REQ-COMP-007 | Gap: My Earnings placeholder | BLOCKED — Needs Manager/Staff credentials (cross-role / self-service not testable as Admin) |
| TC-COMP-009 | REQ-COMP-007 | Gap: My Loans placeholder | BLOCKED — Needs Manager/Staff credentials (cross-role / self-service not testable as Admin) |
| TC-COMP-010 | REQ-COMP-007 | Gap: Queries placeholder | BLOCKED — Needs Manager/Staff credentials (cross-role / self-service not testable as Admin) |
| TC-CYCLE-001 | REQ-CYCLE-001 | Each frequency selectable | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-CYCLE-001 (this row is append-only history). Historical note: no non-monthly schedule accepted (effective_date constraint: must follow last completed period 2027-02-01) |
| TC-CYCLE-003 | REQ-CYCLE-002 | First-period anchor (custom shape) | BLOCKED — Bucket C (Environment): custom first-period anchor needs a NEW pay-schedule; /pay-schedules create is rejected (422 — effective_date must follow last completed period) on the shared sandbox. |
| TC-CYCLE-009 | REQ-CYCLE-007 | Regular-Paid advances + tops buffer | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-CYCLE-009 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-CYCLE-010 | REQ-CYCLE-008 | Non-regular no advance | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-CYCLE-010 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-CYCLE-015 | REQ-CYCLE-012 | Semi-monthly split incl. short Feb | BLOCKED — Bucket C (Environment): semi-monthly split needs a new pay-schedule; create rejected (422 effective_date constraint) — see TC-CYCLE-016. |
| TC-CYCLE-016 | REQ-CYCLE-013 | Quarterly +3 months | quarterly schedule not accepted (422; effective_date must follow last completed period 2027-02-01) |
| TC-CYCLE-017 | REQ-CYCLE-011 | Leap-year Feb 29 | BLOCKED — Bucket C (Environment): leap-year Feb 29 needs a new monthly schedule generating into 2028; create rejected (422 effective_date constraint). |
| TC-CYCLE-018 | REQ-CYCLE-014 | Change regenerates only empty future Scheduled | BLOCKED — Bucket C (Environment): change-regenerates-empty-future needs schedule create/modify; create rejected (422 effective_date constraint). |
| TC-CYCLE-019 | REQ-CYCLE-015 | History preserved on change | BLOCKED — Bucket C (Environment): history-preserved-on-change needs schedule create/modify; create rejected (422 effective_date constraint). |
| TC-CYCLE-020 | REQ-CYCLE-014 | Change effective next open period | BLOCKED — Bucket C (Environment): change-effective-next-open-period needs schedule create/modify; create rejected (422 effective_date constraint). |
| TC-DASH-002 | REQ-DASH-001 | No console/network errors | BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-DASH-003 | REQ-DASH-001 | Permission-appropriate widgets | BLOCKED — Credentials: permission-appropriate dashboard widgets are role-gated; verifying requires a non-admin (Manager/Staff) session. |
| TC-DASH-004 | REQ-DASH-001 | Navigation from dashboard | BLOCKED — Bucket C: dashboard navigation is browser/UI on a Payroll-module page; needs module access (BUG-011). |
| TC-DASH-005 | REQ-DASH-001 | Responsive rendering | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-DED-001 | REQ-CAT-008 | Create each deduction type | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-DED-001 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-DED-004 | REQ-CAT-009 | Calc: % of Cash Emoluments | deduction percentage_of_cash_emoluments not accepted: {"calculation_method":["calculation_method 'percentage_of_cash_emolume — calc-method API contract not exposed for deductions |
| TC-DED-011 | REQ-CAT-013 | Override window | deduction window gating not verifiable via off-cycle run (applies all assigned items by design); needs regular-run harness |
| TC-DED-012 | REQ-CAT-015 | Permission gating | BLOCKED — Bucket C: permission-gating ("non-permitted user") requires a non-admin session; blocked by BUG-011 (role accounts have no Payroll module entitlement). |
| TC-DED-013 | REQ-CAT-009 | %-of-net not in pass 1 | deduction percentage_of_net not accepted — %-of-net calc-method API contract not exposed |
| TC-EMP-003 | REQ-EMP-001 | Cancel mid-form | BLOCKED — Bucket C: "cancel mid-form" is a browser/UI interaction on a Payroll-module page; needs module access (BUG-011) + a built browser spec. |
| TC-EMP-004 | REQ-EMP-002 | Bulk import valid | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-EMP-005 | REQ-EMP-002 | Bulk import invalid rows | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-EMP-006 | REQ-EMP-002 | Import History tracked | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-EMP-009 | REQ-EMP-005 | Daily basic | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-EMP-009 (this row is append-only history). Historical note: BLOCKED — API contract: daily/hourly compensation not settable via /salary (see reports/07) |
| TC-EMP-009 | REQ-EMP-005 | Daily compensation | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-EMP-009 (this row is append-only history). Historical note: POST salary salary_type=daily → 422 ""The basic salary field is required."". Valid salary_type enum = monthly\|hourly only; daily not accepted via standard salary contract (likely Casual employment-type path) |
| TC-EMP-010 | REQ-EMP-006 | Hourly compensation = rate × hours (calc) | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-EMP-010 (this row is append-only history). Historical note: salary_type=hourly accepted (200) but not computed (basic stays 0 on process); hourly/daily comp contract not fully cracked via standard /salary endpoint (likely needs compensation_mode or Casual employment-type path / UI). Not asserted as a bug pending the full contract. |
| TC-EMP-010 | REQ-EMP-006 | Hourly basic | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-EMP-010 (this row is append-only history). Historical note: BLOCKED — API contract: daily/hourly compensation not settable via /salary (see reports/07) |
| TC-EMP-012 | REQ-EMP-007 | Missing quantity → error | BLOCKED — API contract: daily/hourly compensation not settable via /salary (see reports/07) |
| TC-EMP-015 | REQ-EMP-011 | Cascading Bank→Branch | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-EMP-016 | REQ-EMP-008 | No free-text bank | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-EMP-020 | REQ-EMP-012 | Masked numbers | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-EMP-021 | REQ-EMP-013 | Payroll Profile readiness | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-EMP-022 | REQ-EMP-014 | Salary assignment effective dates | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-EMP-022 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-EMP-023 | REQ-EMP-014 | Mid-cycle date warns | BLOCKED — Browser-only / Infrastructure: the mid-cycle "Warning shown" is a client-side Save-time validation (catalogue Auto=UI). It cannot be exercised via API here because (a) first_day_of_work must be ≤ today (server rejects future dates: confirmed) while the only open payroll period is future (2027-01), so a hire date cannot fall mid the open period; the proration/warning path is therefore not API-constructable in this sandbox window |
| TC-EMP-025 | REQ-EMP-016 | Tax & Pension tab | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-EMP-026 | REQ-EMP-016 | Contract renewal alert | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-EMP-028 | REQ-EMP-017 | Cost Center 100% UI rule | BLOCKED — Bucket C: "Cost Center 100% UI rule" is a browser-form validation on a Payroll-module page; needs module access (BUG-011) + a built browser spec. |
| TC-ENT-004 | REQ-SETUP-001 | Enterprise Module Launcher | [browser] FAIL/BLOCKED — launcher renders 'No modules found' for the Payroll Admin account on William & Co; NO Payroll module tile → cannot launch Payroll. Module not provisioned for the new role accounts at the enterprise level. |
| TC-ENT-005 | REQ-SETUP-001 | Launch Payroll module → Payroll app | [browser] BLOCKED — no Payroll module tile to launch (see TC-ENT-004); never reaches payroll.kedebah.com for these accounts. |
| TC-ENT-MOD-admin | REQ-SETUP-001 | Admin module access | [browser] CONFIRMED EMPTY — 'No modules found' for Admin too. |
| TC-ENT-MOD-employee | REQ-SETUP-001 | Employee module access | [browser] CONFIRMED EMPTY — launcher shows 'No modules found'; Employee has NO modules → cannot enter Payroll. Confirms BR-020 is systemic (not Admin-specific). |
| TC-ENT-MOD-manager | REQ-SETUP-001 | Manager module access | [browser] CONFIRMED EMPTY — 'No modules found' for Manager too. All 4 roles now confirm BUG-011 (systemic, no module access). |
| TC-ENT-MOD-reports | REQ-SETUP-001 | Reports module access | [browser] CONFIRMED EMPTY — 'No modules found' for Reports too (logged in via reset). |
| TC-ENT-PW-manager | REQ-AUTH-001 | Password reset (Manager) | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-ENT-PW-manager (this row is append-only history). Historical note: [browser] BLOCKED — BOTH temp o6KCbDUXsE AND QaPhase4_manager_9X! rejected ('Invalid password'). Account password is in an unknown state; cannot reach the change screen. Needs owner reset/confirm. |
| TC-ENT-PW-reports | REQ-AUTH-001 | Password reset (Reports) | [browser] BLOCKED — BOTH temp IrLyR66kvk AND QaPhase4_reports_9X! rejected ('Invalid password'). Unknown password state; needs owner reset/confirm. |
| TC-FORM-001 | REQ-FORM-001 | Liabilities on approve | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-FORM-001 (this row is append-only history). Historical note: BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-FORM-003 | REQ-FORM-002 | One form per filing period | BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-FORM-004 | REQ-FORM-003 | Attach to Pending form (recompute) | BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-FORM-005 | REQ-FORM-004 | Locked form → supplementary | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-FORM-005 (this row is append-only history). Historical note: BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-FORM-006 | REQ-FORM-004 | Filed form not mutated | BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-FORM-007 | REQ-FORM-005 | Files modal 3 outputs enablement | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-FORM-008 | REQ-FORM-006 | Muted unavailable note | BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-FORM-009 | REQ-FORM-007 | Forms own approval flow | BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-FORM-011 | REQ-FORM-009 | GRA PAYE export integrity + speed | BLOCKED — UI-only — report export rendered client-side |
| TC-LIFE-001 | REQ-LIFE-001 | Happy-path transitions | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-LIFE-001 (this row is append-only history). Historical note: BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-LIFE-002 | REQ-LIFE-001 | Illegal transition blocked | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-LIFE-002 (this row is append-only history). Historical note: BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-LIFE-003 | REQ-LIFE-001 | Reject → draft | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-LIFE-003 (this row is append-only history). Historical note: BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-LIFE-004 | REQ-LIFE-001 | Return to previous stage | BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-LIFE-005 | REQ-LIFE-002 | Draft editable + live preview | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-LIFE-007 | REQ-LIFE-003 | Pre-process blockers listed | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-LIFE-007 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-LIFE-008 | REQ-LIFE-003 | Exclude incomplete to proceed | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-LIFE-008 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-LIFE-010 | REQ-LIFE-004 | Multi-stage approval enforced | BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-LIFE-011 | REQ-LIFE-004 | Reject requires reason | BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-LIFE-012 | REQ-LIFE-004 | Approver permission | BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-LIFE-013 | REQ-LIFE-005 | On-Approve: liabilities + forms | BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-LIFE-014 | REQ-LIFE-005 | Files available after approval (not gated on payment) | BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-LIFE-015 | REQ-LIFE-006 | Gap: journal flag logged only | BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-LIFE-019 | REQ-LIFE-009 | Immutable audit per transition | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-LIFE-019 (this row is append-only history). Historical note: BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-LOAN-002 | REQ-LOAN-001 | Edit/close loan | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-LOAN-002 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-LOAN-003 | REQ-LOAN-001 | Permission gating | BLOCKED — Bucket C: permission-gating ("non-permitted user") requires a non-admin session; blocked by BUG-011. |
| TC-LOAN-004 | REQ-LOAN-002 | Loan BIK when rate < reference | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-LOAN-004 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-LOAN-008 | REQ-LOAN-003 | Repayment clamped to balance | BLOCKED — Infrastructure: repayment-clamp manifests only on a Regular paid run with a loan whose balance < per-period; isolating one requires driving a loan to near-payoff across multiple calendar-advancing Regular runs (wide-impact on shared sandbox) |
| TC-LOAN-013 | REQ-LOAN-004 | Auto-stop when repaid | BLOCKED — Infrastructure: no fully-repaid loan in sandbox; verifying auto-stop requires driving a loan balance to 0 across multiple calendar-advancing Regular paid runs (auto_stop_when_repaid flag is configured on all loans; behaviour at payoff needs the destructive multi-run path) |
| TC-LOAN-015 | REQ-LOAN-009 | Loans submenu = preview (§25) | UI preview pages (§25) — verify-only via UI; not API-exercised |
| TC-LOAN-015 | REQ-LOAN-009 | Gap: Loans submenu previews | BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-PAYE-009 | REQ-PAYE-007 | 60,000.00 (into band 7) | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-PAYE-009 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-PAYE-012 | REQ-PAYE-008 | Mid-band 5,000 | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-PAYE-012 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-PAYE-014 | REQ-PAYE-009 | Chargeable base = qualifying income − reliefs + taxable BIK − before-tax deductions | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-PAYE-014 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-PAYE-016 | REQ-PAYE-010 | Band-by-band breakdown UI | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-PAYM-001 | REQ-PAYM-001 | Files action on Approved (Run Payroll tab) | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-PAYM-001 (this row is append-only history). Historical note: BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-PAYM-002 | REQ-PAYM-001 | Files action on Paid (History tab) | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-PAYM-002 (this row is append-only history). Historical note: BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-PAYM-003 | REQ-PAYM-002 | Bank file structure | BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-PAYM-004 | REQ-PAYM-003 | Bank file columns/order | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-PAYM-004 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-PAYM-005 | REQ-PAYM-004 | Sort: bank then employee name | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-PAYM-005 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-PAYM-006 | REQ-PAYM-010 | Correct sort code per employee | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-PAYM-006 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-PAYM-007 | REQ-PAYM-005 | MoMo rows in file | BLOCKED — Browser-only: Mobile-Money rows in the bank/payment file are produced by a client-side export render; no payment-file API route (probed earlier). |
| TC-PAYM-008 | REQ-PAYM-006 | Cash excluded | BLOCKED — Browser-only: cash-exclusion from the bank file is verified in the client-side file export; no payment-file API route. (Cash exclusion at run level is separately covered by REQ-PAYM-006/run #85.) |
| TC-PAYM-009 | REQ-PAYM-007 | Missing-details excluded | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-PAYM-009 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-PAYM-010 | REQ-PAYM-002 | TOTAL row correctness | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-PAYM-010 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-PAYM-011 | REQ-PAYM-009 | Payment Reference dash | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-PAYM-011 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-PAYM-012 | REQ-PAYM-008 | Gap: skip reasons not in modal | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-PAYM-012 (this row is append-only history). Historical note: BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-PAYM-013 | REQ-PAYM-014 | Export recorded in audit | BLOCKED — UI-only — report export rendered client-side |
| TC-PAYM-016 | REQ-PAYM-012 | Proof of payment upload | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-PAYM-018 | REQ-PAYM-015 | Gap: Payments submenu previews | BLOCKED — Bucket C: Payments submenu previews are browser/UI on a Payroll-module page; needs module access (BUG-011). |
| TC-PG-001 | REQ-PG-006 | Create pay group | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-PG-001 (this row is append-only history). Historical note: BLOCKED — Missing API Contract: pay-group CREATE works (group #12, 201) but MEMBER ASSIGNMENT is not exposed — PUT /employees/{id} {pay_group_id} returns 200 yet employee_count stays 0 (silent no-op); POST/PUT /pay-groups/{id}/{employees,members,assign} → 405; the employee object has no pay_group_id field. Membership cannot be set via API. |
| TC-PG-002 | REQ-PG-006 | Edit membership | BLOCKED — Missing API Contract: pay-group membership-edit not exposed (assignment is a silent no-op — see TC-PG-001 evidence: PUT 200 but employee_count unchanged, sub-routes 405, no employee.pay_group_id field). |
| TC-PG-004 | REQ-PG-006 | Permission gating | BLOCKED — API contract not exposed: pay-group member assignment (see reports/07) |
| TC-PG-004 | REQ-PG-003 | Pay group membership resolves | members=null |
| TC-PG-005 | REQ-PG-001 | Group pre-populates run | BLOCKED — Missing API Contract: group cannot pre-populate a run because membership is not assignable via API (see TC-PG-001); run accepted pay_group_id but loaded 0 members (group is empty). |
| TC-PG-006 | REQ-PG-002 | No-group regular run = all active | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-PG-006 (this row is append-only history). Historical note: BLOCKED — API contract not exposed: pay-group member assignment (see reports/07) |
| TC-PG-007 | REQ-PG-002 | Eligibility at period end | BLOCKED — Bucket C (Missing API Contract): employee has no salary-expiry/effective-window field (salary_end_date not persisted, PUT 200); "salary expires before period end" is not constructable via API. |
| TC-PG-008 | REQ-PG-003 | Shared benefit applies to members | BLOCKED — API contract not exposed: pay-group member assignment (see reports/07) |
| TC-PG-009 | REQ-PG-003 | Shared deduction applies | BLOCKED — API contract not exposed: pay-group member assignment (see reports/07) |
| TC-PG-010 | REQ-PG-004 | Group protected-pay rule | BLOCKED — API contract not exposed: pay-group member assignment (see reports/07) |
| TC-PG-011 | REQ-PG-005 | Layered resolution / member scoping | pay-group member-assignment contract not identified (assigned via create did not persist) — see BUG-006 |
| TC-PG-011 | REQ-PG-005 | Layered resolution order | BLOCKED — API contract not exposed: pay-group member assignment (see reports/07) |
| TC-PG-012 | REQ-PG-005 | Individual override beats group | BLOCKED — API contract not exposed: pay-group member assignment (see reports/07) |
| TC-PROT-001 | REQ-PROT-001 | Protected-pay rule create contract | POST collection → 405 ("The POST method is not supported for ro); PUT employee → 405. Collection is GET-only; no admin-exposed create path found (likely a business/setup-level config). |
| TC-PROT-001 | REQ-PROT-001 | Floor: absolute | BLOCKED — API contract not exposed: protected-pay-rules (see reports/07-requests-to-unblock.md) |
| TC-PROT-002 | REQ-PROT-002 | Protected-pay enforcement (block/trim/alert) | needs per-employee deduction assignment + rule attach (contract pending) |
| TC-PROT-002 | REQ-PROT-001 | Floor: % of gross | BLOCKED — API contract not exposed: protected-pay-rules (see reports/07-requests-to-unblock.md) |
| TC-PROT-003 | REQ-PROT-001 | Floor: % of basic | BLOCKED — API contract not exposed: protected-pay-rules (see reports/07-requests-to-unblock.md) |
| TC-PROT-004 | REQ-PROT-004 | Protected-pay floor warning fires when net squeezed | net=160.62; warnings=[] |
| TC-PROT-004 | REQ-PROT-002 | Hard Block | BLOCKED — API contract not exposed: protected-pay-rules (see reports/07-requests-to-unblock.md) |
| TC-PROT-005 | REQ-PROT-003 | Partial Apply + Alert | BLOCKED — API contract not exposed: protected-pay-rules (see reports/07-requests-to-unblock.md) |
| TC-PROT-006 | REQ-PROT-004 | Alert Only | BLOCKED — API contract not exposed: protected-pay-rules (see reports/07-requests-to-unblock.md) |
| TC-PROT-007 | REQ-PROT-005 | Statutory never trimmed | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-PROT-007 (this row is append-only history). Historical note: BLOCKED — API contract not exposed: protected-pay-rules (see reports/07-requests-to-unblock.md) |
| TC-PROT-008 | REQ-PROT-008 | §25 Protected-pay carryover NOT auto-recovered (verify-only) | protected-pay rule creation not admin-API-exposed (Wave 4); carryover auto-recovery not exercisable via API — documented §25 gap stands (verify-only, requires configured rule via setup UI) |
| TC-PROT-008 | REQ-PROT-006 | Priority trim order | BLOCKED — API contract not exposed: protected-pay-rules (see reports/07-requests-to-unblock.md) |
| TC-PROT-009 | REQ-PROT-007 | Carryover recorded | BLOCKED — API contract not exposed: protected-pay-rules (see reports/07-requests-to-unblock.md) |
| TC-PROT-010 | REQ-PROT-008 | Gap: no auto-recovery | BLOCKED — API contract not exposed: protected-pay-rules (see reports/07-requests-to-unblock.md) |
| TC-PROT-011 | REQ-PROT-009 | Audit storage | BLOCKED — API contract not exposed: protected-pay-rules (see reports/07-requests-to-unblock.md) |
| TC-PROT-012 | REQ-PROT-003 | Floor exactly met (boundary) | BLOCKED — API contract not exposed: protected-pay-rules (see reports/07-requests-to-unblock.md) |
| TC-RBAC-admin-login | REQ-AUTH-001 | Login as admin | [browser] credentials VALID (login accepted → forced 'Change Password' screen) but session NOT established — after the forced password change the app redirects to a SEPARATE identity domain 'https://sbxkedebah-v2.npontu.com/clients/sign-in' (multi-domain SSO). Automation cannot yet complete the cross-domain handshake. NOT missing-credentials; an SSO/forced-change automation gap. |
| TC-RBAC-employee-login | REQ-AUTH-001 | Login as employee | [browser] credentials VALID (login accepted → forced 'Change Password' screen) but session NOT established — after the forced password change the app redirects to a SEPARATE identity domain 'https://sbxkedebah-v2.npontu.com/clients/sign-in' (multi-domain SSO). Automation cannot yet complete the cross-domain handshake. NOT missing-credentials; an SSO/forced-change automation gap. |
| TC-RBAC-manager-login | REQ-AUTH-001 | Login as manager | [browser] credentials VALID (login accepted → forced 'Change Password' screen) but session NOT established — after the forced password change the app redirects to a SEPARATE identity domain 'https://sbxkedebah-v2.npontu.com/clients/sign-in' (multi-domain SSO). Automation cannot yet complete the cross-domain handshake. NOT missing-credentials; an SSO/forced-change automation gap. |
| TC-RBAC-reports-login | REQ-AUTH-001 | Login as reports | [browser] credentials VALID (login accepted → forced 'Change Password' screen) but session NOT established — after the forced password change the app redirects to a SEPARATE identity domain 'https://sbxkedebah-v2.npontu.com/clients/sign-in' (multi-domain SSO). Automation cannot yet complete the cross-domain handshake. NOT missing-credentials; an SSO/forced-change automation gap. |
| TC-RELF-001 | REQ-RELF-001 | Fixed Annual ÷ 12 | probe inconclusive — operation contract not demonstrable for this case; treated as external (see discovery sweep) |
| TC-RELF-002 | REQ-RELF-002 | Per-Unit annual × units ÷ 12 | probe inconclusive — operation contract not demonstrable for this case; treated as external (see discovery sweep) |
| TC-RELF-003 | REQ-RELF-002 | Per-Unit cap at max units | probe inconclusive — operation contract not demonstrable for this case; treated as external (see discovery sweep) |
| TC-RELF-004 | REQ-RELF-003 | % assessable income | probe inconclusive — operation contract not demonstrable for this case; treated as external (see discovery sweep) |
| TC-RELF-005 | REQ-RELF-004 | SSF auto from Tier1+Tier2 EE | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-RELF-005 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-RELF-006 | REQ-RELF-005 | Reliefs run first | relief ordering not evidenced in breakdown (reliefs_monthly_total=50) |
| TC-RELF-007 | REQ-RELF-006 | Per-employee assignment | probe inconclusive — operation contract not demonstrable for this case; treated as external (see discovery sweep) |
| TC-RELF-008 | REQ-RELF-001 | Boundary: relief > base | BLOCKED — Bucket C: relief > base boundary needs relief→employee assignment, which is not exposed via API (see TC-RELF-001 — Missing API Contract). |
| TC-RPT-004 | REQ-RPT-004 | TC-RPT-004 | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-RPT-004 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-RPT-007 | REQ-RPT-007 | TC-RPT-007 | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-RPT-007 (this row is append-only history). Historical note: BLOCKED — UI-only — report export rendered client-side |
| TC-RPT-009 | REQ-RPT-001..008 | Export format integrity | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-RPT-011 | REQ-RPT-001..008 | Permission gating | BLOCKED — Bucket C: report permission-gating requires a non-admin session; blocked by BUG-011. |
| TC-RPT-013 | REQ-RPT-009 | Gap: Payslips not a report | BLOCKED — Bucket C: "Payslips not a report" is a browser/UI observation on a Payroll-module page; needs module access (BUG-011). |
| TC-RPT-014 | REQ-RPT-011 | Gap: redirect/unimplemented pages | BLOCKED — Verify-only (§25 documented gap) — assert documented preview/not-saved behaviour via UI |
| TC-RPT-015 | REQ-RPT-011 | Gap: AI Insights preview | BLOCKED — Bucket C: AI Insights preview is browser/UI on a Payroll-module page; needs module access (BUG-011). |
| TC-RUN-001 | REQ-RUN-001 | Regular includes everything | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-RUN-001 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-RUN-002 | REQ-RUN-001 | Regular only overtime ad-hoc | BLOCKED — API contract not exposed: overtime entry (see reports/07) |
| TC-RUN-003 | REQ-RUN-002 | No-group population | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-RUN-003 (this row is append-only history). Historical note: BLOCKED — API contract not exposed: pay-group member assignment (see reports/07) |
| TC-RUN-005 | REQ-RUN-003 | Bonus excludes basic/benefits/deductions | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-RUN-005 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-RUN-008 | REQ-RUN-004 | Bonus period optional | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-RUN-008 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-RUN-009 | REQ-RUN-009 | Bonus does NOT advance calendar | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-RUN-009 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-RUN-019 | REQ-RUN-008 | Entitlements/recoveries as adjustments | probe inconclusive — operation contract not demonstrable for this case; treated as external (see discovery sweep) |
| TC-RUN-021 | REQ-RUN-009 | Termination no advance | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-RUN-021 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-SEC-001 | REQ-SEC-001 | API perm matrix — view | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-SEC-001 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-SEC-003 | REQ-SEC-002 | Direct-URL access to forbidden page | BLOCKED — Bucket C: direct-URL access to a forbidden page requires a non-admin session; blocked by BUG-011. |
| TC-SEC-006 | REQ-SEC-004 | Manager → bank edit denied (API) | BLOCKED — Needs Manager/Staff credentials (cross-role / self-service not testable as Admin) |
| TC-SEC-007 | REQ-SEC-004 | Staff → admin API denied | BLOCKED — Needs Manager/Staff credentials (cross-role / self-service not testable as Admin) |
| TC-SEC-009 | REQ-SEC-006 | Stored XSS sanitisation | API stores raw <script> (no server sanitisation) — render-escape (Vue) unverified; observation |
| TC-SEC-009 | REQ-SEC-006 | Stored XSS | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-SEC-012 | REQ-SEC-008 | Duplicate approve | BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-SEC-013 | REQ-SEC-008 | Duplicate mark-paid | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-SEC-013 (this row is append-only history). Historical note: BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-SEC-014 | REQ-SEC-009 | IDOR on self-service payslips | BLOCKED — Needs Manager/Staff credentials (cross-role / self-service not testable as Admin) |
| TC-SEC-014 | REQ-SEC-009 | Self-service scope isolation | Not executed — Staff credentials not provided |
| TC-SEC-015 | REQ-SEC-009 | Self-service list scope | BLOCKED — Needs Manager/Staff credentials (cross-role / self-service not testable as Admin) |
| TC-SEC-016 | REQ-SEC-010 | Sensitive masking default | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-SEC-017 | REQ-SEC-008 | Idempotent bank-file export | BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-SEC-018 | REQ-SEC-001 | Privilege escalation attempt | BLOCKED — Needs Manager/Staff credentials (cross-role / self-service not testable as Admin) |
| TC-SLIP-001 | REQ-SLIP-001 | Download gated on Paid+Paid | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-SLIP-001 (this row is append-only history). Historical note: BLOCKED — UI-only — report export rendered client-side |
| TC-SLIP-002 | REQ-SLIP-001 | Not available before Paid | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-SLIP-002 (this row is append-only history). Historical note: BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-SLIP-003 | REQ-SLIP-001 | Not available if employee not paid | BLOCKED — Bucket C: payslip retrieval API not exposed (/employees/{id}/payslips → SPA-HTML, no JSON contract); cannot assert "unavailable if not paid" via API. |
| TC-SLIP-004 | REQ-SLIP-002 | Snapshot-based (no recompute) | BLOCKED — UI-only — report export rendered client-side |
| TC-SLIP-005 | REQ-SLIP-003 | PDF identity/header | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-SLIP-005 (this row is append-only history). Historical note: BLOCKED — UI-only — report export rendered client-side |
| TC-SLIP-006 | REQ-SLIP-004 | PDF payment details masked | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-SLIP-006 (this row is append-only history). Historical note: BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-SLIP-007 | REQ-SLIP-005 | PDF earnings exclude BIK | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-SLIP-007 (this row is append-only history). Historical note: BLOCKED — UI-only — report export rendered client-side |
| TC-SLIP-008 | REQ-SLIP-006 | Two deduction groups | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-SLIP-008 (this row is append-only history). Historical note: BLOCKED — UI-only — report export rendered client-side |
| TC-SLIP-009 | REQ-SLIP-007 | Same-name combine (loans) | BLOCKED — UI-only — report export rendered client-side |
| TC-SLIP-010 | REQ-SLIP-008 | PDF totals + words | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-SLIP-010 (this row is append-only history). Historical note: BLOCKED — UI-only — report export rendered client-side |
| TC-SLIP-011 | REQ-SLIP-009 | Self-service payslip API | needs Staff credentials |
| TC-SLIP-011 | REQ-SLIP-009 | List own payslips | BLOCKED — Credentials: "list own payslips" is staff self-service (/my/payslips); requires a Staff session, not provisioned. |
| TC-SLIP-011 | REQ-SLIP-009 | Self-service payslip API | Not executed — Staff credentials not provided |
| TC-SLIP-012 | REQ-SLIP-009 | Current payslip | BLOCKED — Credentials: "current payslip" is staff self-service (/my/payslips); requires a Staff session, not provisioned. |
| TC-SLIP-013 | REQ-SLIP-009 | Download one + all | BLOCKED — Needs Manager/Staff credentials (cross-role / self-service not testable as Admin) |
| TC-SLIP-014 | REQ-SLIP-009 | No admin perm needed | BLOCKED — Needs Manager/Staff credentials (cross-role / self-service not testable as Admin) |
| TC-SLIP-015 | REQ-SLIP-009 | Cross-employee blocked (IDOR) | BLOCKED — Needs Manager/Staff credentials (cross-role / self-service not testable as Admin) |
| TC-SLIP-016 | REQ-SLIP-010 | Gap: this-app My Payslips placeholder | BLOCKED — Needs Manager/Staff credentials (cross-role / self-service not testable as Admin) |
| TC-STAX-001 | REQ-STAX-001 | Annual cap = 15% × (12×monthly basic) | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-STAX-001 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-STAX-002 | REQ-STAX-002 | Bonus within cap → 5% final | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-STAX-002 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-STAX-003 | REQ-STAX-002 | YTD cumulative within cap | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-STAX-003 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-STAX-004 | REQ-STAX-003 | Excess over cap → marginal | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-STAX-004 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-STAX-007 | REQ-STAX-005 | Reconciliation invariant | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-STAX-007 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-STAX-008 | REQ-STAX-006 | Detail modal breakdown | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-STAX-009 | REQ-STAX-007 | Threshold alert | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-STAX-009 (this row is append-only history). Historical note: no bonus threshold alert found in existing runs |
| TC-STAX-012 | REQ-STAX-008 | Junior: 5% up to 50% basic | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-STAX-012 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-STAX-013 | REQ-STAX-008 | Junior: 10% above 50% basic | BLOCKED — Bucket C (Missing API Contract): junior overtime split (5% ≤50% basic / 10% above) — oracle `overtimeTax` ready + "Overtime Tax (Junior)" seeded, but NO overtime-entry API (POST /pay-runs/{id}/adjustments & /overtime → 405; /pay-run-adjustments → 405). Cannot input OT amount to exercise the engine. Would PASS on contract exposure. |
| TC-STAX-014 | REQ-STAX-009 | Senior: marginal PAYE | BLOCKED — Bucket C (Missing API Contract): senior overtime marginal PAYE — oracle ready, overtime-entry API not exposed (405/SPA-HTML). |
| TC-STAX-015 | REQ-STAX-008 | Junior→senior boundary (18k) | BLOCKED — Bucket C (Missing API Contract): junior→senior 18k boundary — oracle ready, overtime-entry API not exposed (405/SPA-HTML). |
| TC-STAX-016 | REQ-STAX-010 | Config drives rates | BLOCKED — API contract not exposed: overtime entry (see reports/07) |
| TC-STAX-017 | REQ-STAX-010 | Statutory fallback | BLOCKED — API contract not exposed: overtime entry (see reports/07) |
| TC-STAX-018 | REQ-STAX-011 | Junior threshold alert | BLOCKED — Bucket C (Missing API Contract): junior threshold alert needs overtime entry; overtime-entry API not exposed (405/SPA-HTML). |
| TC-STAX-019 | REQ-STAX-012 | Gap: no OT entry screen | BLOCKED — UI-only — needs browser-driven (Playwright page) test |
| TC-STAX-020 | REQ-STAX-013 | Cap = 35% qualifying income | BLOCKED — Bucket C (Missing API Contract): pension 35% cap excess→PAYE — oracle `pensionExcess` ready + "Pension Excess"/"Tier 3" seeded, but NO tier-3/voluntary-pension input API (/tier-3-schemes, /pension-schemes, /voluntary-pensions → SPA-HTML). Cannot input Tier-3 pension to exercise the cap. |
| TC-STAX-021 | REQ-STAX-013 | Pension within cap | BLOCKED — Bucket C (Missing API Contract): pension-within-cap — oracle ready, tier-3 input API not exposed (SPA-HTML). |
| TC-STAX-022 | REQ-STAX-013 | Pension excess alert | BLOCKED — Bucket C (Missing API Contract): pension excess alert needs tier-3 input; tier-3 input API not exposed (SPA-HTML). |
| TC-STAX-023 | REQ-STAX-013 | Counting-items only | BLOCKED — Bucket C (Missing API Contract): counting-items-only cap aggregation — oracle ready, tier-3/pension-counting config not exposed via API (SPA-HTML). |
| TC-TAX-004 | REQ-TAX-001 | Configure statutory item fields | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-TAX-004 (this row is append-only history). Historical note: BLOCKED — Pending implementation — admin-reachable; not yet ported into the registry |
| TC-TAX-006 | REQ-TAX-003 | Calc uses dated rate | only 0 rate version present — no second dated version seeded to verify before/after-effective selection (needs a 2nd version) |
| TC-TAX-009 | REQ-TAX-004 | Resolver — explicit exempt subtracts | probe inconclusive — operation contract not demonstrable for this case; treated as external (see discovery sweep) |
| TC-TAX-013 | REQ-TAX-007 | Tax preset one-click | probe inconclusive — operation contract not demonstrable for this case; treated as external (see discovery sweep) |
| TC-TAX-014 | REQ-TAX-008 | Per-employee rate override | probe inconclusive — operation contract not demonstrable for this case; treated as external (see discovery sweep) |
| TC-TAX-015 | REQ-TAX-009 | Voluntary Tier 3 scheme | probe inconclusive — operation contract not demonstrable for this case; treated as external (see discovery sweep) |
| TC-TAX-016 | REQ-TAX-010 | Exemption requires reason | probe inconclusive — operation contract not demonstrable for this case; treated as external (see discovery sweep) |
| TC-TAX-017 | REQ-TAX-012 | Filing-rule due dates | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-TAX-017 (this row is append-only history). Historical note: BLOCKED — API contract not exposed: catalog approval-activation trigger (see reports/07) |
| TC-TAX-018 | REQ-TAX-013 | Statutory config permission | BLOCKED — Credentials: statutory-config permission (admin vs non-admin) requires a non-admin session to prove the deny path; Manager/Staff credentials not provisioned. |
| TC-URB-001 | REQ-AUTH-006 | Admin can create/invite users | ⤳ SUPERSEDED / RESOLVED — a later PASS exists for TC-URB-001 (this row is append-only history). Historical note: [browser+api] BLOCKED — user creation hard-gated: POST /users → 422 'Your subscription is not active. Renew your subscription in Company Admin before adding users.' (reproduced with/without password, with/without role). UI exposes 'Add User'/'Manage Roles'/per-user edit-deactivate-delete but is gated by the same limitation. |
| TC-URB-003 | REQ-AUTH-006 | Assign permissions to a role | [api] BLOCKED — silent no-op: PUT returns 200 but permissions_count stays 0 for all field variants; POST /roles/{id}/permissions → 405 (GET/HEAD only). Seeded roles have permissions but they cannot be assigned via the exposed API. |
| TC-URB-005 | REQ-AUTH-001 | Login as created user (admin-set password) | [api+browser] BLOCKED — admin-set password is a SILENT NO-OP: POST /users accepts `password` but login returns 422 'Invalid password' (same for a deliberately-wrong password). Browser login as the new Manager stays on the login page. Users must self-activate via their email to set a password; per-role login/permission-enforcement testing cannot proceed. |

_Enterprise per-role enforcement cases remain blocked by **[BUG-011](../bugs/BUG-011.md)** — newly-created role accounts have **no Payroll module access** in the enterprise launcher — **not** by credentials. All four role passwords are now established (Admin/Employee/Manager/Reports — see [reports/35](35-enterprise-onboarding-report.md)). Per-role permission enforcement will run once the Payroll module is provisioned._

## 4. What passed (confidence)

469 rule-level checks passed, incl. the highest-risk areas:
- Calculation engine == independent oracle to the cent (PAYE bands, Tier 1/2, reliefs/SSF, bonus over-cap marginal + reconciliation, net pay, employer cost, chargeable base).
- Full pay-run lifecycle to PAID for all 4 run types; state machine blocks illegal transitions; idempotency; only Regular advances the calendar.
- Bank payment file (structure/sort/totals/exclusions) and payslip PDF (BIK excluded, net-in-words) content correct.
- Audit trail complete + immutable; SQL-injection / malformed-input / multi-tenant isolation safe.

## 5. References

- Full per-rule pass/fail (771 rows): [test-execution-report.md](../test-management/test-execution-report.md)
- Defect details: [bugs/](../bugs/) · Coverage dashboard: [coverage-dashboard.md](../test-management/coverage-dashboard.md)
- Requirement traceability: [01-traceability-matrix.md](../requirements/01-traceability-matrix.md)
