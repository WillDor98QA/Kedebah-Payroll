# 37 — Kedebah Payroll — Final Gap Analysis (Payroll Module)

> 2026-06-30 · **Read-only audit.** No tests executed, ledger unmodified. Every figure is derived from `evidence/exec/records.ndjson` (authoritative), `evidence/browser/findings.ndjson`, `requirements/`, `test-cases/`, `automation/tests/`, `bugs/`, and `reports/08`. Where evidence is absent the item is marked **NOT VERIFIED** (not assumed).
>
> *(Filed at 37 — not 36 — because `reports/36-documentation-reconciliation.md` already exists and `reports/16` links to it. The 36/37/38 deliverables map to 37/38/39.)*

## Canonical baseline (reconciled to the ledger)

- **Catalogue (PASS-sticky):** 417 cases · **234 PASS · 1 FAIL · 174 BLOCKED · 8 N/A**  (= `reports/08`).
- **Requirements:** 261 defined; 257 touched; **163 have ≥1 verified rule (62%)**, **70 fully verified with no blocked rule (27%)**, ~98 unverified/blocked or untouched.
- **Open defects:** 12 (`BUG-001…012`) — 1 Critical, multiple Major.
- **Browser findings:** 20 (`BR-001…020`) — 2 Critical, 12 Major, 5 Minor, 1 Info; 5 accessibility.
- **Browser automation:** 6 specs — Settings, Users & Roles, Enterprise onboarding, IAM-login, role-enforcement (built, blocked), feasibility. **No browser spec exists for Run-Payroll, Reports, Payslips, Employees, Dashboard, Loans/Benefits/Deductions UI.**

---

## PART 1 — Functional Coverage

Confidence = High (clean PASS, oracle-checked) · Medium (PASS with some blocked rules) · Low (mostly blocked) · None (untested/blocked-only). Per-module figures are tcId verdicts from the ledger; requirement totals from `requirements/`.

| Module | Total Reqs | Verified | Partial | Untested/Blocked | Confidence |
|---|---:|---:|---:|---:|---|
| Dashboard | 1 | 0 | 1 | 0 (+**1 FAIL**) | **Low** — 1 PASS / 1 FAIL / 3 blocked cases |
| Employees | 21 | 6 | 8 | 7 | Medium — 18 PASS / 16 blocked cases |
| Pay Groups | 6 | 0 | 3 | 3 | Low — 2 PASS / 8 blocked |
| Bank Setup | 11 | 3 | 5 | 3 | Medium — 6 PASS (BANK) |
| Payroll Processing (CYCLE/RUN/PAY/PROT) | 34 | 7 | 16 | 11 | Medium — calc engine High, config blocked |
| Payroll Lifecycle (LIFE) | 9 | 2 | 4 | 3 | Medium — full lifecycle to PAID PASS |
| Payslips (SLIP) | 10 | 0 | 7 | 3 | Medium — PDF content PASS, UI unverified |
| Payments (PAYM/BANK) | 15 | 2 | 9 | 4 | Medium — bank file structure PASS |
| Loans | 9 | 4 | 5 | 0 | Medium-High — 12 PASS / 4 blocked |
| Benefits (BIK/CAT) | 23 | 8 | 7 | 1 | Medium — 20 PASS / 10 blocked |
| Deductions (CAT/RELF) | 21 | 5 | 4 | 2 | Low-Medium — 9 PASS / 16 blocked |
| Tax (TAX/PAYE/RELF) | 29 | 9 | 6 | 2 | Medium — PAYE oracle High; config blocked |
| Statutory (STAX/FORM) | 22 | 2 | 7 | 0 | Low-Medium — calc PASS, forms blocked |
| Reports (RPT) | 11 | 6 | 3 | 0 | Medium — content PASS, UI/export browser-gap |
| Calendar (CAL) | 16 | 7 | 2 | 0 | Medium — cycle calendar PASS |
| Alerts (ALRT) | 14 | 9 | 2 | 0 | **High** — invariants/validation PASS |
| Compliance (COMP) | 7 | 2 | 4 | 0 | Medium — audit trail PASS |
| Security (SEC) | 10 | 2 | 4 | 4 | Low — injection/tenant PASS; authz unverified |
| Settings | — | — | — | — | Medium — browser-verified (9 modules) |
| Users & Roles (AUTH) | 11 | 1 | 3 | 6 | **Low** — CRUD PASS, enforcement NOT VERIFIED |
| Enterprise Onboarding (SETUP) | 2 | 0 | 1 | 1 | Medium (flow) / **None (module access — BUG-011)** |

**Highest confidence:** calculation engine (PAYE bands, SSNIT Tier 1/2, reliefs, bonus over-cap, net pay, employer cost — oracle-matched), pay-run state machine to PAID, alerts/invariants, bank-file & payslip content, audit immutability, injection/multi-tenant safety.
**Lowest / NOT VERIFIED:** per-role permission **enforcement**, all browser UX of core payroll pages, statutory **form** generation, performance, integrations.

---

## PART 2 — Browser Coverage

| Area | Status | Evidence / gap |
|---|---|---|
| Navigation / menus (app shell) | **Partial** | App-shell POM + Settings/Users nav verified; payroll-module nav unreachable (BUG-011) |
| Forms | Partial | Settings/Users forms touched; Employee/Run-Payroll/Loan forms **Untested** |
| Modal windows | Partial | Add-User modal **NOT VERIFIED** (non-standard trigger, BR); most modals untested |
| Search / filters / sorting / pagination | **Untested** in payroll grids (Employees/Reports) — only Users table observed |
| Responsive (mobile) | **Untested** — Pixel-7 project exists but no payroll-page runs recorded |
| File uploads | **Untested** (employee/bulk import) |
| Downloads (PDF/CSV/bank file) | **Partial** — content verified via API; **browser download UX Untested** |
| Accessibility (axe) | Partial — Settings/App-shell scanned (BR-001/002/003/007); payroll pages **Untested** |
| Keyboard nav / focus order | **Untested** beyond noting violations on shell |
| Console errors | Partial — BR-004 (404 on authed pages) found; payroll pages **Untested** |
| Visual regression | **None** — no baseline suite |
| Loading states | Partial — BR-005 (slow skeleton) on Settings |
| Role-based UI | **Blocked** — needs Payroll module access (BUG-011) |
| Cross-browser (FF/WebKit) | **Untested** — only Chromium/`browser` project exercised |

**Net:** browser coverage is concentrated on Settings + Users/Enterprise. Core payroll UI (Dashboard, Employees, Run-Payroll wizard, Payslips, Reports) has **no browser verification**.

---

## PART 3 — End-to-End Business Flows

Coverage % = qualitative, evidence-based.

| Workflow | Start → End | Coverage | Evidence | Remaining gap |
|---|---|---:|---|---|
| Enterprise login | sign-in → authenticated | **100%** | `enterprise/A-after-login` | — |
| Password change / reset | login → new password | **100%** | `enterprise/B`, `F-forgot-2` | — |
| Business selection | login → business set | **100%** | `enterprise/D` | — |
| Module launcher → Payroll | launcher → payroll app | **0%** | `enterprise/D` (empty) | **BUG-011 — no module** |
| Logout | app → signed out | **NOT VERIFIED** | — | untested |
| Organisation onboarding | create org/settings | ~70% | Settings browser specs | org-setup edge cases |
| Payroll setup (pay schedule/groups) | configure | ~40% | API PASS; member-assign blocked | pay-group membership (405) |
| Employee onboarding | create → active | ~70% | EMP API PASS | browser form, bulk import |
| Employee update | edit → saved | ~60% | EMP API | payment_method casing (BUG-010) |
| Bank setup | add bank | ~60% | BANK PASS | seeded-bank edit (BUG-008) |
| Benefits / Deductions assign | assign → on payslip | ~65% | assign PASS | preset/override blocked |
| Loans | create → repay on run | ~70% | LOAN PASS | browser UI untested |
| Run payroll (all types) | draft → calculated | **High (API)** | CYCLE/RUN PASS to PAID | **browser wizard Untested** |
| Approve payroll | calculated → approved | High (API) | LIFE state machine | browser Untested |
| Pay payroll | approved → PAID | High (API) | lifecycle PASS | browser Untested |
| Generate payslip | PAID → PDF | High (content) | SLIP PASS | browser download Untested |
| Export bank file | PAID → file | High (content) | PAYM PASS | browser download Untested |
| Statutory reports/forms | period → form | **Low** | STAX calc PASS | **form generation blocked/Untested** |
| Role management | create/assign role | ~70% | URB PASS | enforcement NOT VERIFIED |
| **Per-role enforcement** | login as role → permissions | **0%** | blocked | **BUG-011 + needs module** |

---

## PART 4 — Security

| Area | Status | Note |
|---|---|---|
| Authentication | **Verified** | enterprise login/reset/change live |
| Authorization (config) | Partial | role×permission matrix captured (config) `reports/34` |
| **Role enforcement (observed)** | **NOT VERIFIED** | blocked by BUG-011 (harness ready) |
| Privilege escalation (vertical/horizontal) | **NOT VERIFIED** | needs role sessions |
| Session expiry / timeout | **NOT VERIFIED** | untested |
| CSRF | Partial | XSRF token in use; not adversarially tested |
| XSS | **NOT VERIFIED** | not tested in browser |
| SQL injection | **Verified** | injection/malformed-input safe (API) |
| Rate limiting | **NOT VERIFIED** | untested |
| Password policy | Partial | forced-change + must-change observed; full policy NOT VERIFIED |
| Account lockout | **NOT VERIFIED** | untested |
| Audit logging | **Verified** | complete + immutable (COMP) |
| Multi-tenant isolation | **Verified** | isolation safe (API) |
| Direct-URL access control | **NOT VERIFIED** | needs role sessions |
| API authorization (per-role) | **NOT VERIFIED** | harness ready, blocked |
| Browser authorization | **NOT VERIFIED** | blocked by BUG-011 |
| Auth robustness | **Defect** | BUG-009 — invalid/missing token → 500 not 401 |

---

## PART 5 — Accessibility

Source: `evidence/browser/findings.ndjson` (axe via `@axe-core/playwright`) on App-shell + Settings only.

| Aspect | Status |
|---|---|
| WCAG automated scan | Partial — App-shell + Settings/Users only |
| Icon-button names | **Fail** — BR-001 (critical) icon-only controls no accessible name |
| Colour contrast | **Fail** — BR-002 |
| Landmarks / regions | **Fail** — BR-003 (no `<main>`) |
| Link names | **Fail** — BR-007 |
| Keyboard / focus order | **NOT VERIFIED** |
| Screen-reader readiness | **NOT VERIFIED** |
| ARIA / labels / dialogs / tables / forms | **NOT VERIFIED** on payroll pages |

**Remaining:** axe + manual keyboard/SR passes on every payroll page (Dashboard, Employees, Run-Payroll, Payslips, Reports); per-dialog a11y; fix the 4 standing shell violations.

---

## PART 6 — Performance — **NOT VERIFIED (entirely)**

No performance evidence exists. Remaining: load, stress, volume, large-payroll (1k+ employees), concurrent users, browser render/TTI, large-report generation, export performance, memory. Only anecdotal: BR-005 (slow Settings skeleton), login needs ≥45s SPA cold-load.

---

## PART 7 — Integration Testing

| Integration | Status |
|---|---|
| Authentication / Enterprise Portal (npontu IdP) | **Partial** — login flow verified; module-entitlement broken (BUG-011) |
| Payroll API | **Verified** (primary coverage) |
| Finance posting | **NOT VERIFIED** |
| Bank exports | Partial — file content verified; bank-side delivery NOT VERIFIED |
| HRIS sync | **NOT VERIFIED** |
| Notifications / Email | Partial — password-reset email send observed; content/delivery NOT VERIFIED |
| Imports (CSV/Excel) | **NOT VERIFIED** |
| Exports (CSV/Excel/PDF) | Partial — PDF/bank content verified; browser export NOT VERIFIED |

---

## PART 8 — Regression Suite

| Bucket | Items |
|---|---|
| **Ready for CI** | 234 PASS catalogue cases (API specs, oracle-checked) + unit |
| **Needs Browser** | Run-Payroll, Reports, Payslips, Employees, Dashboard UI; responsive; cross-browser |
| **Needs Manual** | Keyboard/SR a11y; visual regression baseline; finance/HRIS integration |
| **Needs Credentials** | — (resolved — all 4 role passwords established) |
| **Needs Development** | 12 open defects, esp. **BUG-011** (module provisioning), BUG-009, BUG-012 |
| **Needs Environment** | Payroll-module entitlement; per-role enforcement run depends on it |

---

## PART 9 — Risk Assessment

| Pri | Area | Why |
|---|---|---|
| **P0** | BUG-011 module access | No role can enter Payroll → product unusable for new users; blocks enforcement |
| **P0** | Per-role enforcement NOT VERIFIED | Security-critical authz unproven (harness ready) |
| **P1** | BUG-012 / BUG-009 | Onboarding password no-op; auth returns 500 not 401 |
| **P1** | Browser coverage of core payroll UI | Run-Payroll/Reports/Payslips UX unverified |
| **P1** | Statutory form generation | Compliance output blocked/unverified |
| **P2** | Accessibility (4 shell violations + payroll pages) | WCAG/legal exposure |
| **P2** | Performance unproven | Scale risk for large payrolls |
| **P3** | Integrations (finance/HRIS/email content) | Downstream correctness |
| **P3** | Remaining open defects (BUG-001..008,010) | Mostly Low/validation |

---

## PART 10 — Production Readiness

**Can Payroll be certified? — NO.**

| Category | Blocking items |
|---|---|
| **Known product defects** | BUG-011 (Critical, module access), BUG-012 (Major), BUG-009 (Major), + BUG-001..008/010 |
| **Known environment blockers** | Payroll-module entitlement not provisioned for role accounts |
| **Known missing automation** | Browser specs for Run-Payroll/Reports/Payslips/Employees/Dashboard; performance; integration |
| **Known missing requirements** | ~98 reqs unverified/blocked; statutory forms; protected-pay HARD config |
| **Known browser gaps** | Core payroll UI, responsive, cross-browser, keyboard a11y, visual regression |
| **Known exploratory gaps** | Per-role enforcement, session/CSRF/XSS/lockout/rate-limit |

**Verified & production-trustworthy today:** calculation engine, pay-run lifecycle to PAID, alerts/invariants, bank-file/payslip content, audit immutability, injection/tenant isolation. These are the strongest parts of the system.

---

## PART 11 — Programme Completion (evidence-derived)

| Metric | Value | Basis |
|---|---:|---|
| Functional case coverage (PASS) | **56%** | 234 / 417 catalogue cases |
| — blocked | 42% | 174 / 417 |
| Requirement coverage (≥1 verified rule) | **62%** | 163 / 261 |
| Requirement coverage (fully clean) | **27%** | 70 / 261 |
| Browser coverage (UI areas) | **~30%** | Settings/Users/Enterprise of ~14 areas |
| Automation coverage (API catalogue) | **High** | 417/417 catalogued cases have specs (0 missing) |
| Workflow coverage (E2E) | **~55%** | strong API lifecycle; UI + enforcement gaps |
| **Production readiness** | **~55%** | core engine ready; access/enforcement/UX/perf blocked |
| **Confidence score** | **Medium for the payroll engine; Low for end-user product** | engine oracle-verified; access/UX/security-enforcement unproven |

> Every percentage above traces to the ledger / findings / requirements counts in the baseline. Anything not evidenced is marked **NOT VERIFIED** above and excluded from the "verified" figures.

See `reports/38-production-readiness-roadmap.md` and `reports/39-final-payroll-testing-backlog.md`.
