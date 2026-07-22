# Phase 4 — Test Plan

**Product:** Kedebah Payroll · **Source of truth:** PRD §1–§25 · Companion to `01-test-strategy.md`

---

## 1. Modules & ownership

All 25 modules from the Requirements Catalog. Each has a dedicated `test-cases/<Module>/` folder
(folder names per workspace spec; module codes per RTM).

| Folder | Module codes covered |
|--------|----------------------|
| Authentication | AUTH, SEC (auth-related) |
| Dashboard | DASH (scope TBD) |
| Employees | EMP |
| Payroll | CAL, RUN, LIFE, CYCLE, PAYM, FORM, SLIP, STAX, PAYE |
| Pay Groups | PG |
| Benefits | CAT (benefits/earnings), BIK |
| Deductions | CAT (deductions), PROT |
| Loans | LOAN |
| Tax | TAX, RELF |
| Reports | RPT |
| Compliance | COMP, FORM (filing history) |
| Security | SEC |
| _(Bank Setup, Cycles, Setup)_ | BANK/CYCLE/SETUP filed under Payroll/Authentication setup as configuration prerequisites |

> Note: Bank Setup (BANK) and Pay Calendar (CYCLE) have no dedicated top-level folder in the
> mandated structure; their cases live under **Payroll** with a `Setup-` filename prefix so they
> stay grouped while honouring the required folder list.

---

## 2. Execution order (dependency-driven)

Mirrors the PRD setup order (§3) so prerequisites exist before dependent tests run.

| Wave | Modules | Why this order |
|------|---------|----------------|
| **0 — Smoke** | AUTH login, app reachability, seed verification (REQ-TAX-002) | Gate to everything. |
| **1 — Config foundation** | CYCLE, TAX, RELF, CAT, BIK, PG, PROT, BANK | Calendar + statutory + catalog + master data must exist before employees/runs. |
| **2 — Employees** | EMP (add/import/sync, 7 tabs, payment validation, readiness), LOAN | Subjects of payroll; loans drive BIK/repayment. |
| **3 — Calculation core** | CAL, PAYE, STAX | The engine — heaviest, money-critical; depends on Waves 1–2. |
| **4 — Run lifecycle** | RUN, LIFE, CYCLE-advance, ALRT | Process → approve → pay, calendar advance, alerts. |
| **5 — Outputs** | FORM, PAYM, SLIP, RPT | Forms, bank file, payslips, reports — depend on a paid run. |
| **6 — Compliance & security** | COMP, SEC | Audit trail integrity + cross-cutting authz/security. |
| **7 — Gap verification** | All §25 verify-only reqs | Confirm documented gaps. |
| **8 — Non-functional** | Accessibility, responsive, performance observation | After functional confidence. |
| **9 — Regression** | Invariant re-run + impacted areas | After fixes. |

---

## 3. Entry criteria (per wave)

- **Wave 0:** App reachable; valid credentials for all 3 roles.
- **Wave 1:** Wave 0 passed; seed data matches PRD §10/§24 (REQ-TAX-002).
- **Wave 2:** Config foundation in place (≥1 schedule, statutory items, ≥1 catalog item, ≥1 bank/branch, ≥1 pay group, protected-pay rule).
- **Wave 3:** ≥1 ready employee per persona (test-data strategy); `calc-oracle.ts` implemented & unit-checked.
- **Wave 4:** Draft run computes (REQ-LIFE-002).
- **Wave 5:** A run reached Approved (forms/files) and Paid (payslips).
- **Wave 6+:** Functional waves substantially passed.

## 4. Exit criteria

- 100% of **P1** requirements executed; ≥90% of P2.
- All 10 invariants (RTM) verified intact.
- All §25 gaps verified-as-documented.
- 0 open **Critical**, 0 open **High** on implemented features (or each formally accepted with evidence + recommendation).
- Coverage matrix complete; executive + readiness report produced.

## 5. Suspension & resumption

- **Suspend** a wave if: a blocker prevents >30% of its cases (e.g. cannot create a run), seed data wrong, or environment unstable.
- **Resume** when the blocking defect is fixed/worked-around; re-run the suspended wave from its entry gate.

---

## 6. Coverage targets

| Requirement priority | Test-case coverage | Automation target |
|----------------------|--------------------|-------------------|
| P1 | 100% (positive + negative + boundary where applicable) | High — all deterministic P1 journeys + all calculations |
| P2 | 100% positive, key negatives | Medium |
| P3 | Positive + representative negatives | Selective |
| P4 | Smoke/sanity | Minimal |
| §25 gaps | 100% verify-only | Light (presence/redirect checks) |

Each requirement → minimum case set:
- **CRUD reqs:** create (valid), create (invalid/required), edit, delete, delete-guard, list/search/sort/filter/paginate, permission-gated.
- **Calculation reqs:** ≥1 nominal + all boundaries + 1 negative (zero/over-cap) + reconciliation/invariant.
- **Workflow reqs:** happy path + each illegal transition + each side-effect.
- **Security reqs:** authorised pass + unauthorised (UI) + unauthorised (direct API) + injection/XSS where input exists.

---

## 7. Resources & tooling

| Need | Tool |
|------|------|
| UI automation | Playwright + TypeScript (POM) |
| API/calc verification | Playwright `request` fixture + `calc-oracle.ts` |
| Excel export assertions | `xlsx`/`exceljs` parser in `utils/` |
| PDF payslip assertions | `pdf-parse`/`pdfjs` in `utils/` |
| Accessibility | `@axe-core/playwright` |
| Evidence | Playwright trace/video/screenshot; console + network capture helpers |
| Reporting | Playwright HTML report + custom RTM coverage roll-up |

## 8. Automation strategy

- **POM** under `automation/pages/` — one class per screen; selectors centralised (prefer role/test-id; document any brittle selectors for app-team test-id requests).
- **Fixtures** (`automation/fixtures/`): authenticated contexts per role; seeded test entities; `calc-oracle`.
- **Utils/helpers**: date math for calendar tests, xlsx/pdf parsers, money rounding, alert assertions.
- **Config** (`automation/config/`): base URL, projects (browsers/viewports), retries, trace-on-failure, reporters.
- **Tagging:** `@p1 @smoke @calc @security @regression @gap` for selective runs.
- **No arbitrary waits** — rely on web-first assertions/auto-waiting (strategy principle).
- **Traceability:** every spec header references its REQ-* and PRD §.

## 9. Regression strategy

- **Invariant suite** (`@regression` + the 10 RTM invariants) runs on every change.
- Full P1 suite runs before any readiness sign-off.
- After each bug fix: re-run the failing case + its module wave + the invariant suite.

## 10. Defect management workflow

- Each defect → one file `bugs/BUG-<nnn>.md` with the Phase 9 template (id, title, REQ ref, module, severity, priority, env, preconditions, steps, expected, actual, evidence links, root-cause hypothesis, suggested fix).
- Severity: **Critical** (money wrong / data loss / security / invariant broken) · **High** (feature broken, no workaround) · **Medium** (broken with workaround) · **Low** (cosmetic).
- A §25 item failing to behave *as its documented gap* is a **documentation/UX** note, not a functional defect — logged distinctly.

## 11. Risks to the test effort

| Risk | Impact | Mitigation |
|------|--------|------------|
| No app/credentials (current) | Blocks Phases 7–10 | Engagement-status escalation; pre-build all design + scaffolding. |
| Brittle UI selectors | Flaky automation | Request `data-testid`s; centralise in POM; prefer API for calc checks. |
| Seed differs from PRD | False calc failures | Gate calc waves on REQ-TAX-002 seed verification. |
| Shared/dirty environment | Non-deterministic data | Require isolated/resettable env; create-own-data per spec. |
| PIM portal scope ambiguity | Self-service coverage gap | Default to API-only until confirmed. |

## 12. Milestone schedule (artifact-based, app-independent first)

| Milestone | Deliverable | Gate |
|-----------|-------------|------|
| M1 ✅ | Workspace + Analysis + Requirements + RTM | Done |
| M2 ✅ | Strategy + Plan | This document |
| M3 | Test cases (all modules) | App-independent |
| M4 | Playwright scaffold (POM/fixtures/utils/config/oracle) | App-independent (selectors finalised once app available) |
| M5 | Execution + evidence + defects | **Needs app** |
| M6 | Coverage + executive + readiness report | Needs M5 |
