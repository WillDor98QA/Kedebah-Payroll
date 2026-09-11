# Independent QA Project Audit — Kedebah Payroll

> 2026-07-08 · Adversarial audit by an independent Principal QA Director. Repository-verified, not summary-based. **Brutally honest; previous work is not protected.** Rule applied: implementation > documentation; Playwright > reports; unverifiable claims = **UNVERIFIED**.

---

## 1. Executive Audit Report

The project shows **strong QA *thinking*** — evidence-first discipline, an independent calculation oracle, an append-only ledger, honest defect triage — but **weak QA *engineering***. It is **not** a maintainable enterprise automation asset in its current state, and it is **not runnable via its own configuration**.

Three findings dominate:

1. **CRITICAL — the calculation oracle is wrong/unvalidated on a core rate.** `calc-oracle.ts` sets `GHANA_TIER1.employee = 0.055` (5.5%), but the live app deducts **5%** (GHS 150 on 3,000). The oracle — the one component that *must* be independently correct — disagrees with the app and was never reconciled. This undermines every "calculation verified to the cent" claim that touches SSNIT. Either the oracle is wrong (many PASS verdicts suspect) or the app under-deducts (product defect). **Unresolved = the flagship claim is UNVERIFIED.**
2. **CRITICAL — the framework does not run from its own config.** `auth.setup.ts` still performs the old single-domain login (`LoginPage.login`) which broke when the product moved to enterprise SSO. Every meaningful project (`live`, `chromium`, `firefox`, `webkit`, `mobile`) `depends: ['setup']`. The suite only runs via the undocumented workaround `--no-deps` + a hand-refreshed stored token. A new team cannot `npx playwright test` and get results.
3. **MAJOR — there is no discovery layer.** 0 of 7 expected discovery artifacts exist (application-map, navigation-map, workflow-map, module-map, business-rules, dependencies, role-map). Discovery happened, but only as prose scattered across 42 reports — not maintainable, not traceable.

**Overall verdict: NOT production-ready as a QA asset. Conditional for UAT of the *product*; not approvable as an enterprise QA *framework*.**

## 2. Project Health Scorecard

| Area | Score /10 | Basis |
|---|---:|---|
| Project Structure | **4** | Non-standard layout (no discovery/defects/templates/config); 42 reports with **duplicate numbers (35, 40)**; dead/superseded files; 480-line monolith registry. Requirements + test-cases are well organised. |
| Discovery | **2** | **0/7 discovery maps exist.** Live app genuinely explored (SSO, contracts) but never documented as durable artifacts. |
| Architecture | **5** | Sound concepts (factory, oracle, append-only ledger, POM, registry dispatch) undercut by a monolithic registry, broken setup, and standalone `.mjs` scripts holding parallel logic. |
| Automation Quality | **5** | Reusable factory/helpers (good). But heavy `waitForTimeout` (flaky/slow), mixed locator quality, no ret/flake strategy beyond defaults, and cert logic living outside the framework in `.mjs`. |
| Documentation | **5** | Voluminous and *honest*, but sprawling, duplicated, historical-mixed-with-current, and reconciliation-heavy. High cognitive load. |
| Test Design | **6** | Excellent on API calc/business-logic (positive/negative/boundary/oracle) and defect discovery. Large holes: browser UI, accessibility (shell only), performance (none), concurrency (none), integration (none). |
| Coverage | **5** | Catalogue 56% PASS, **40% BLOCKED**; requirement coverage ~62%; browser/perf/integration largely uncovered. |
| Defect Management | **7** | Best area. 12 bugs with evidence, repro, severity, re-verification, and clean 3-way triage (50/51/52). |
| Reporting | **5** | Honest and evidence-driven (strength) but **three different denominators** (417 catalogue / 441 ledger tcIds / 763 records) and a **known ±1 coverage bug never fixed**. |
| Maintainability | **3** | Broken setup, no CI, monolith registry, report sprawl, standalone scripts, test-data pollution. A new team would struggle. |
| Framework Quality | **4** | Good ideas, poor runnability and zero pipeline integration. |
| Evidence Quality | **6** | 23 MB of screenshots + ledger; most defects supported. Undercut by the oracle-rate risk and several "candidate" (unconfirmed) findings. |
| **OVERALL** | **≈ 4.6 / 10** | Strong QA reasoning; weak QA engineering, discovery, and framework runnability. |

## 3. QA Maturity Assessment — **Level 2 of 5 ("Defined but fragile")**
Rigorous manual/exploratory thinking and evidence discipline (Level 3-4 behaviours) sit on top of a fragile, un-runnable, undocumented-at-the-discovery-layer foundation (Level 1-2 engineering). Not repeatable by another team without tribal knowledge.

## 4. Automation Maturity Assessment — **Level 2 of 5**
- **Reuse:** partial (factory/helpers good; registry monolith and `.mjs` scripts are anti-patterns).
- **Stability:** low — fixed sleeps everywhere → flaky and slow; browser auth fresh-logs-in per test (~45s cold loads).
- **Runnability:** broken (setup dependency).
- **CI:** none.
- **Data hygiene:** poor — QA employees accumulate on a shared 260-employee tenant; cleanup depends on `afterAll` that the standalone scripts never call.

## 5. Coverage Matrix (by category, per the audit's required disciplines)

| Discipline | State | Evidence |
|---|---|---|
| Positive / Negative / Boundary | ✅ Strong (API) | calc-engine, PAYE bands, alerts |
| Validation | ✅ (API) | employee create 422s, payment-method matrix |
| Business Rules | ✅ (API) | oracle-checked — **but SSNIT rate suspect** |
| State Transition | 🟡 Partial | pay-run lifecycle (API) verified; UI not |
| Security | 🟡 Partial | injection/tenant safe; **role enforcement never observed** (BUG-011 era) |
| Permission | 🟡 Partial | configured matrix only; enforcement UNVERIFIED |
| Workflow (E2E) | 🟡 Partial | API lifecycle strong; browser E2E thin |
| Browser Behaviour | 🔴 Weak | 8 specs, Settings/Users/Enterprise only; **no Run-Payroll/Reports/Payslips/Employees UI** |
| Accessibility | 🔴 Weak | axe on app-shell/Settings only |
| Concurrency | 🔴 None | not attempted |
| Performance | 🔴 None | not attempted |
| Recovery | 🔴 None | not attempted |
| Data Integrity | 🟡 Partial | audit-trail immutability (API) |
| Regression | 🟡 Partial | 234 API PASS reusable; **not in CI** |

## 6. Gap Analysis (top gaps)
1. No discovery artifacts (maps).
2. No performance / concurrency / recovery testing at all.
3. Browser automation covers ~30% of UI areas; core payroll UI absent.
4. Role/permission **enforcement** never observed (only configured).
5. Oracle SSNIT rate unreconciled with the app.
6. No CI / pipeline / scheduled regression.
7. Integration (finance posting, HRIS, bank delivery, email content) untested.

## 7. Technical Debt Report
- `automation/helpers/tc-registry.ts` — **480-line monolith**, 150+ inline impls, the recurring `};`-close footgun. Should be split per module + typed.
- Standalone `test-management/*.mjs` (cert scripts, exporters) duplicate ApiClient/auth/oracle logic **outside** the Playwright framework — parallel logic the brief explicitly forbids.
- `reports/` — 42 files, **duplicate numbers 35 & 40**, historical (09–21) mixed with current, superseded stubs (`35-phase4-credential-status`). No versioning scheme.
- Ledger `records.ndjson` — 1,508 lines, many superseded rows + inconsistent JSON spacing (caused a finding-ID collision earlier). No compaction/schema.
- `auth.setup.ts` — dead (points at the old login).
- Reporting has **3 denominators** and an unreconciled ±1 in `generate-coverage-matrix.mjs`.

## 8. Risk Register

| ID | Risk | Likelihood | Impact | Exposure |
|---|---|---|---|---|
| R1 | Oracle SSNIT rate wrong → false PASS/FAIL on every statutory calc | High | High | **Critical** |
| R2 | Framework un-runnable by another team (broken setup, no CI) | High | High | **Critical** |
| R3 | Product: Casual/Board tax not applied by employment type | Medium | High | High |
| R4 | Role enforcement never observed (security) | Medium | High | High |
| R5 | Test-data pollution on shared tenant; a real user's password disrupted | High | Medium | High |
| R6 | Zero performance/scale evidence for a payroll engine | Medium | High | High |
| R7 | Report sprawl → stakeholders read stale/duplicate numbers | High | Medium | Medium |
| R8 | Browser/UI regressions invisible (thin coverage) | Medium | Medium | Medium |

## 9. Root-Cause / Parent-Investigation Candidates
- **PI-1 "Silent-accept anti-pattern"** (confidence High): BUG-008 (seeded-bank PUT no-op), BUG-012 API residual (password/role_ids ignored), pay-group membership no-op, statutory silent-accepts — same root cause: the API returns 200 and drops unrecognised fields instead of 422. One engineering fix pattern.
- **PI-2 "Employment-type not wired to tax engine"** (confidence Medium): Casual flat-tax and Board WHT both un-triggered — likely one resolver that keys tax treatment off a tax-status field, not `employment_type`.
- **PI-3 "Enterprise entitlement vs payroll role"** (resolved): BUG-011 — module access decoupled from role; fixed by role→module linkage.

## 10. Refactoring Recommendations
1. Rebuild `auth.setup.ts` on the enterprise SSO flow (reuse the proven `enterprise-onboarding` login) so all projects run again.
2. Split `tc-registry.ts` into `helpers/registry/<module>.ts` modules with a typed index; delete the `.mjs` parallel logic by moving cert/export into the framework.
3. Reconcile the oracle: confirm the authoritative SSNIT employee rate; make `GHANA_TIER1` config-driven and add a rate-source test.
4. Collapse `reports/` to a versioned set (one current + an `archive/`); fix duplicate numbering; fix the coverage-generator ±1.
5. Add CI (GitHub Actions): unit + API `live` on every push; nightly browser + regression.
6. Add teardown that always runs (global-teardown deactivating QA-prefixed data) and stop mutating real user accounts.

## 11. Prioritised Action Plan
**P0 (blockers):** R1 oracle reconciliation · R2 fix setup + add CI · stop test-data/credential mutation.
**P1:** browser coverage for core payroll UI · role-enforcement observation · Casual/Board tax disposition · performance baseline.
**P2:** report consolidation · registry split · ledger compaction · discovery maps authored.
**P3:** integration testing · accessibility across payroll pages · visual regression.

---

## Final Table

| Area | Score (/10) | Status | Major Findings | Priority |
|---|---|---|---|---|
| Project Structure | 4 | ⚠️ Weak | report sprawl, duplicate numbers, monolith, dead files | P2 |
| Discovery | 2 | 🔴 Critical gap | 0/7 maps; no discovery layer | P2 |
| Architecture | 5 | 🟡 Fair | good concepts, monolith + parallel `.mjs` | P2 |
| Automation | 5 | 🟡 Fair | fixed sleeps, broken setup, flaky/slow | P0/P1 |
| Documentation | 5 | 🟡 Fair | honest but sprawling, multi-denominator | P2 |
| Test Design | 6 | 🟢 Decent | strong API; no perf/concurrency/recovery | P1 |
| Coverage | 5 | 🟡 Fair | 40% blocked; browser/perf gaps | P1 |
| Defect Mgmt | 7 | 🟢 Good | evidenced, triaged, re-verified | — |
| Reporting | 5 | 🟡 Fair | honest but ±1 unreconciled, 3 bases | P2 |
| Maintainability | 3 | 🔴 Poor | un-runnable, no CI, pollution | P0 |
| Framework | 4 | ⚠️ Weak | broken auth, no pipeline | P0 |
| Evidence | 6 | 🟢 Decent | supported, oracle-rate caveat | P0 (R1) |
| **OVERALL** | **≈4.6** | ⚠️ **Not enterprise-ready** | strong reasoning, weak engineering | — |

## Top 20 Issues (fix before production)
1. Oracle SSNIT rate 5.5% vs app 5% — unreconciled (invalidates statutory PASS claims).
2. Framework won't run from its own config (broken `auth.setup.ts`).
3. No CI / automated regression safety net.
4. No discovery artifacts (0/7 maps).
5. Casual & Board employment types get standard PAYE, not their special tax.
6. Role/permission **enforcement** never observed.
7. Zero performance / load / concurrency testing.
8. Browser coverage misses all core payroll UI.
9. Test-data pollution on a shared 260-employee tenant.
10. A real user account's password was disrupted by a test (+5).
11. `tc-registry.ts` 480-line monolith with fragile close-brace pattern.
12. Standalone `.mjs` scripts duplicate framework logic (auth/oracle).
13. Report sprawl (42 files) with duplicate numbers 35 & 40.
14. Reporting uses 3 denominators; coverage-generator ±1 never fixed.
15. Ledger has superseded rows + inconsistent JSON (ID collision happened).
16. No always-run teardown; cleanup depends on `afterAll`.
17. Fixed `waitForTimeout` sleeps → flaky, slow browser suite.
18. Accessibility limited to app-shell/Settings.
19. No integration testing (finance/HRIS/bank/email).
20. Paid-lifecycle + payslip per employment type UNVERIFIED (shared-calendar risk; no isolated tenant).

## Top 20 Strengths
1. Evidence-first culture; nothing marked PASS without execution.
2. Independent calculation oracle exists (concept is excellent).
3. Append-only ledger as single source of truth.
4. PAYE band engine verified to the cent (paye(2850)=389.50).
5. Honest defect triage into confirmed / needs-verification / observations.
6. 12 well-documented bugs with repro, evidence, severity, re-verification.
7. Reusable employee/benefit/deduction/run factory (`qa-factory`).
8. 261 requirements + traceability matrix.
9. 417-case catalogue with 1:1 spec mapping enforced.
10. Off-cycle harness chosen for safe, isolated calculation testing.
11. Employment-type inventory discovered live (not assumed).
12. Bug re-verification discipline (BUG-001/004/005/011/012 re-tested live).
13. Root-cause thinking (silent-accept anti-pattern identified).
14. Enterprise SSO onboarding flow reverse-engineered and documented.
15. 4-state reporting framework (historical/current/health/readiness) is genuinely advanced.
16. Screenshot/HAR/trace evidence captured (23 MB).
17. Self-correction integrity (caught its own false-FAIL oracle error rather than shipping it).
18. Certification/gate reporting (release gates, CTO self-check).
19. Blocked-case forensic recovery with live re-probing (not stale assumptions).
20. Strong Ghana-payroll domain modelling in the oracle utilities.

## Phased Roadmap to World-Class
- **Phase 1 — Make it real (2–3 wks):** fix `auth.setup` on SSO; add CI (unit+API on push, nightly browser); reconcile the oracle rate; global-teardown for QA data; stop real-account mutation. → *runnable, trustworthy.*
- **Phase 2 — Consolidate (2–3 wks):** split the registry per module; move `.mjs` logic into the framework; collapse/version reports; fix the ±1; author the 7 discovery maps from the reverse-engineering already done. → *maintainable.*
- **Phase 3 — Close coverage (4–6 wks):** browser automation for Run-Payroll/Reports/Payslips/Employees/Dashboard; role-enforcement observation; performance/scale baseline; integration tests. → *coverage.*
- **Phase 4 — Certify (ongoing):** isolated QA tenant for paid-lifecycle/payslip; accessibility across payroll pages; visual regression; release gates wired to CI. → *world-class.*
