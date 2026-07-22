# Phase 3 — Test Strategy

**Product:** Kedebah Payroll · **Source of truth:** PRD §1–§25 · **Owner:** Lead QA / Test Architect

---

## 1. Scope

### In scope
- All functionality documented as **implemented** in PRD §1–§24.
- Verification (assert-the-gap) of the **documented-not-implemented** items (PRD §25) — confirm they behave as documented previews/redirects/not-saved, *not* full functionality.
- The self-service payslip **API** (`/my/payslips/*`) exposed by this app (PRD §21, §23).
- Cross-cutting: authentication, authorisation/permissions, calculation correctness, data integrity, audit trail, security, accessibility, navigation, responsive behaviour.

### Out of scope
- The `kedebah_v2_pim` portal **UI** (separate project) unless explicitly provided — only this app's API boundary is tested.
- Unimplemented features as *functional* targets (Cost Center persistence, Payroll Overrides persistence, Journal posting, carryover auto-recovery, overtime entry UI, Payments/Loans/Attendance/AI/Integrations previews) — these are **verify-only** (PRD §25).
- Load/stress performance benchmarking (only **performance observation** during functional runs).
- Third-party authority systems (GRA/SSNIT/NPRA actual submission); we validate generated files/forms, not real filing.

---

## 2. Objectives

1. Determine whether the application satisfies **every documented requirement** (REQ-* catalog).
2. Prove the **money-critical calculations** (PAYE, Tier 1/2/3, bonus, overtime, BIK, reliefs, pension cap, net/employer cost) are correct to the cent, re-derived independently — never trusting displayed values.
3. Prove the **high-risk invariants** (RTM §"invariants") never break.
4. Confirm the **security boundary is the API**, not the UI.
5. Produce a defensible **production-readiness** verdict with full traceability.

---

## 3. Test Approach

| Layer | Approach |
|-------|----------|
| **Requirements-based** | Every test maps to ≥1 REQ-* and its PRD §. No orphan tests; no untested P1 requirement. |
| **Risk-based prioritisation** | Critical/High-risk items (tax pipeline, calendar advance, loan/draft money safety, form consolidation, authz) get exhaustive positive/negative/boundary coverage first. |
| **Manual + exploratory** | Calculation correctness, workflow, and gap-verification driven manually first; exploratory charters per module to surface the undocumented. |
| **Automation (Playwright/TS/POM)** | Regression-stable, high-value journeys and deterministic calculations automated. UI via Page Objects; calculations & statutory math via API-level checks where possible (more precise than UI scraping). |
| **API testing** | Direct API calls for: permission enforcement (security boundary), self-service scope isolation, overtime adjustments (API-only per §17), calculation verification, idempotency. |
| **Oracle** | The PRD is the sole oracle. For calculations, an **independent re-implementation** of the documented formulas (in test utils) is the comparison oracle — actual must equal independently-computed expected. |

### Calculation verification method (critical)
For each money requirement we compute the expected value **from the PRD formulas in a test helper**
(`automation/utils/calc-oracle.ts`) and assert equality with the engine's stored snapshot
(REQ-CAL-015) — both at API/detail-modal level and on the payslip. Boundary inputs are chosen at
every PAYE band edge (490, 600, 730, 3,896.67, 19,896.67, 50,416.67) and at each cap (bonus 15%,
overtime 50%-of-basic & GH₵18,000 YTD, pension 35%, BIK monthly cap).

---

## 4. Testing Types

| Type | Coverage focus | Example reqs |
|------|----------------|--------------|
| Functional / CRUD | Banks, catalog, pay groups, employees, loans, runs | BANK, CAT, PG, EMP, LOAN |
| Business-logic / calculation | Full tax pipeline, gross/net, employer cost | CAL, PAYE, STAX, RELF, BIK, PROT |
| Workflow / state-machine | Pay-run lifecycle, approvals, calendar advance, form consolidation | LIFE, CYCLE, FORM |
| Validation / negative / boundary | Required fields, uniqueness, band edges, caps, zero/negative | EMP, BANK, PAYE, ALRT |
| Permission / role | Admin vs Manager vs Staff; UI gating vs API enforcement | AUTH, SEC |
| Security | Authz, direct-URL, session, SQLi, XSS, malformed, duplicate-submit, scope isolation | SEC |
| Data integrity | Audit immutability, snapshot fidelity, balance independence, no-duplicate-form | COMP, CAL, LOAN, FORM |
| Output / export | Bank file structure/sort/exclusions, PAYE/SSNIT files, payslip PDF, 8 reports | PAYM, FORM, SLIP, RPT |
| Navigation / routing | Menu visibility, route guards, deep links, redirects (incl. documented redirects) | AUTH, RPT, navigation |
| Accessibility | Keyboard nav, labels/ARIA, contrast, focus order on key forms | cross-cutting |
| Responsive / rendering | Key screens at desktop/tablet/mobile breakpoints | cross-cutting |
| Performance observation | Page load, run processing time, GRA PAYE export speed (§20 note) | observational |
| Regression | Re-run suite after fixes; protect the 10 invariants | RTM invariants |
| Gap verification | Confirm §25 items behave as documented | verify-only reqs |

---

## 5. Risk Assessment (drives execution order)

| Rank | Risk area | Severity | Mitigation in strategy |
|------|-----------|----------|------------------------|
| 1 | PAYE / tax pipeline correctness | Critical | Independent oracle, band-edge boundaries, full pipeline-order tests. |
| 2 | Bonus marginal + reconciliation invariant | Critical | Multi-run reconciliation assertions; synthetic-reference parity. |
| 3 | Money safety on drafts (loan balances) | Critical | Assert no balance movement until Mark Paid; multi-loan independence. |
| 4 | Calendar advance (Regular-only) | Critical | State-machine tests across all 4 run types. |
| 5 | Form consolidation / no silent mutation of filed records | Critical | Pending-attach vs locked-SUPP scenarios. |
| 6 | Authorisation = API (not UI) | Critical | API-level permission matrix for every protected route. |
| 7 | Protected pay (statutory-never-trim, priority) | High | Trim-order + carryover + invariant tests. |
| 8 | Pension 35% cap routing | High | Cross-tier aggregation boundary tests. |
| 9 | BIK (taxed-not-paid, pipeline position, cap) | High | Net-pay/payslip exclusion + cap-warning tests. |
| 10 | Bank file disbursement correctness | High | Structure/sort/exclusion/sort-code/total assertions. |
| 11 | Self-service scope isolation | High | ID-manipulation / IDOR tests on `/my/payslips/*`. |
| 12 | Employee readiness / payment validation | Medium | Per-method field matrix incl. MoMo-no-account-name. |

---

## 6. Assumptions

- The PRD reflects the current build accurately (it claims "most recent system behaviour").
- A non-production environment with Ghana seed data will be provided for execution.
- Three role accounts (Admin/Manager/Staff) will be provided.
- Seeded statutory values match PRD §10/§24 exactly (verified by REQ-TAX-002 before calc tests).

## 7. Dependencies

- **External (blocking):** running application, credentials, safe environment, seed data, reference-rate/scheme/overtime config values (engagement-status open questions #1,3,4,6).
- **Internal:** Phase 5 test cases → Phase 6 automation → Phase 7 execution; calc-oracle utility before any calculation test.

## 8. Environment

| Item | Requirement |
|------|-------------|
| App target | Staging URL or local build (TBD — blocked). |
| Data | Ghana seed loaded; isolated, resettable. |
| Roles | Payroll Admin, Payroll Manager, Staff/self-service. |
| Browsers | Chromium (primary), Firefox, WebKit (Playwright projects). |
| Viewports | Desktop 1440×900, tablet 768, mobile 390. |
| Tooling | Playwright + TypeScript; xlsx + pdf parsers for export assertions; axe-core for a11y. |

## 9. Entry & Exit (strategy-level; detailed gates in Test Plan)

- **Entry to execution:** app reachable, credentials valid, seed verified (REQ-TAX-002 pass), smoke login passes.
- **Exit:** 100% of P1 requirements executed; 0 open Critical/High defects on invariants; all §25 gaps verified-as-documented; coverage + readiness report signed.

## 10. Deliverables

Product Analysis · Requirements Catalog + RTM · Test Strategy (this) · Test Plan · Test Cases
(per module) · Playwright suite (POM) · Evidence (screenshots/videos/traces/console/network/logs) ·
Defect reports · Coverage matrix · Executive + readiness report.

## 11. Success Criteria

1. Every P1 requirement has ≥1 executed test traced to it.
2. All money calculations match the independent oracle to the cent at boundaries.
3. All 10 high-risk invariants verified intact.
4. No Critical/High functional defect open against an implemented feature at sign-off (or each is documented with severity, evidence, and recommendation).
5. All §25 gaps confirmed as documented (no gap mis-reported as a bug, no undocumented gap missed).
6. Production-readiness verdict delivered with traceable justification.

---

## 12. Test Data Strategy (calculation fixtures)

Representative employee personas to exercise the engine (built once app/seed available):

| Persona | Purpose |
|---------|---------|
| Monthly mid-band earner | Baseline PAYE (band 4/5), Tier 1/2, reliefs. |
| Each PAYE band-edge earner (×6 boundaries) | Band boundary correctness. |
| Daily & Hourly comp | REQ-EMP-005/006 basic resolution. |
| Junior (qualifying YTD ≤ 18k) + Senior | Overtime split vs marginal. |
| Bonus within-cap + over-cap | 5%-final vs marginal-excess + reconciliation. |
| BIK (vehicle/fuel/accommodation, capped & uncapped) | BIK value, cap, not-paid. |
| Multi-loan (subsidised + market-rate) | Loan BIK + repayment + balance independence + combined payslip line. |
| Protected-pay (hard/partial/alert) heavy-deduction | Floor enforcement + carryover. |
| Pension-cap breacher (high Tier 3) | 35% routing. |
| Bank / MoMo / Cash payees + missing-details | Bank-file inclusion/exclusion/sort. |
| Missing tax engine / zero salary / negative-net | Hard-blocker alerts. |
