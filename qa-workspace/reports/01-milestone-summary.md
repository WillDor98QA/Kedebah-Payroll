# Milestone Summary — Kedebah Payroll QA

**Date:** 2026-06-25 · **Lead QA / Test Architect:** AI QA Orchestrator

## Delivered (Milestones 1–4)

| Phase | Deliverable | Location | Status |
|-------|-------------|----------|--------|
| — | QA workspace (full structure) | `qa-workspace/` | ✅ |
| 1 | Product Analysis (modules, journeys, business rules, risk map) | `analysis/01-product-analysis.md` | ✅ |
| 2 | Requirements catalog (~260 reqs) + traceability matrix | `requirements/` | ✅ |
| 3 | Test Strategy | `test-plan/01-test-strategy.md` | ✅ |
| 4 | Test Plan (waves, entry/exit, regression) | `test-plan/02-test-plan.md` | ✅ |
| 5 | **417 test cases**, all 25 modules | `test-cases/**` | ✅ |
| 6 | Playwright/TS/POM scaffold + **calc oracle** | `automation/` | ✅ |
| — | Coverage summary, defect template, engagement status | `coverage/`, `bugs/`, `reports/` | ✅ |

### Verified working now (no app needed)
- **Calculation oracle: 27 specs / 135 assertions — all passing.** Independently re-implements PAYE
  bands, Tier 1/2, reliefs, BIK, bonus marginal method, overtime junior/senior, pension 35% cap, and
  pay-calendar date math straight from the PRD. Command: `cd automation && npm run test:oracle`.

## Blocked (Milestones 5–6) — needs the application

| Phase | Blocked deliverable | Unblocked by |
|-------|--------------------|--------------|
| 7 | Execution + evidence (screenshots/traces/videos/console/network) | App URL + credentials + safe seeded env |
| 8 | Actual-vs-documented comparison | Execution results |
| 9 | Defect reports (`bugs/BUG-*.md`) | Observed failures |
| 10 | Coverage (pass/fail), executive summary, **production-readiness verdict** | Phases 7–9 |

> Principle honoured: **no execution results, screenshots, traces, or defects have been fabricated.**
> The browser/API specs self-skip until a real target is configured.

## What I need to proceed to execution

You chose **"I'll provide a URL"** — when ready, drop here:
1. **App URL** (staging/local) + **API base** if different.
2. **Credentials**: Payroll Admin, Payroll Manager, Staff/self-service.
3. Confirmation it's a **safe non-prod** environment with **Ghana seed** loaded.
4. (Optional) PIM portal URL if self-service payslip UI is in scope (open question #5).
5. Reference-rate / voluntary-scheme / overtime-rule values (open question #6) for loan-BIK & overtime math.

## Open questions still outstanding
1. ~~Where is the app~~ → URL to be provided.
2. **Dashboard scope** — PRD has no dashboard section; provisional cases only (`test-cases/Dashboard/`).
3. Role credentials.
4. Safe seeded non-prod env.
5. PIM portal in scope (UI) or API-only.
6. Seeded reference/scheme/overtime values.

## Immediate next steps once the URL lands
1. `cp automation/.env.example automation/.env` and fill URL + credentials.
2. Run smoke (`npm run test:smoke`) + seed verification (`TC-TAX-001…003`) — the gate for calc waves.
3. Confirm/replace placeholder selectors and API paths against the real app (POM + `api-client.ts`).
4. Execute Wave 0→8 per Test Plan; capture evidence; log defects; produce the readiness report (Phase 10).
