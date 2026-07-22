# QA Engagement Status — Kedebah Payroll

**Date:** 2026-06-25
**Lead QA / Test Architect:** AI QA Orchestrator
**Phase reached:** Milestone 1 complete (workspace + Phase 1 Analysis + Phase 2 Requirements).

---

## What exists vs. what's needed

| Item | Status |
|------|--------|
| PRD (`PAYROLL_COMPLETE_SYSTEM_GUIDE.md`) | ✅ Present — read in full, frozen into `qa-workspace/docs/`. |
| QA workspace structure | ✅ Built (all folders per spec). |
| Phase 1 Product Analysis | ✅ `analysis/01-product-analysis.md`. |
| Phase 2 Requirements + RTM | ✅ `requirements/00-requirements-catalog.md`, `01-traceability-matrix.md` (~260 reqs). |
| **Application under test** | ❌ **ABSENT** — no source code, no built app, no URL, no API host. |
| Test credentials (Admin / Manager / Staff) | ❌ Not provided. |
| Non-production / seeded test environment | ❌ Unknown. |

---

## 🚧 Critical blocker

The project directory contains **only the PRD**. There is **no running or buildable application**.

**Phases that CAN proceed from docs alone (not blocked):**
- Phase 3 — Test Strategy
- Phase 4 — Test Plan
- Phase 5 — Test Case generation (manual, per module)
- Phase 6 — Playwright framework *scaffolding* (POM skeletons, fixtures, utils) can be authored, but **selectors cannot be finalised and nothing can run** without the real UI.

**Phases that are HARD-BLOCKED until a target is provided:**
- Phase 7 — Execution (needs a live app + credentials + safe environment)
- Phase 8 — Comparison (needs actual behaviour)
- Phase 9 — Defect Management (needs observed failures)
- Phase 10 — Production readiness (depends on execution results)

Per operating principle *"never fabricate expected behaviour"* — and equally, I will **not fabricate
execution results, screenshots, traces, or bug evidence** for an app that hasn't been run. Any
"evidence" without a real target would be fiction and would corrupt the traceability chain.

---

## What I need from you to unblock execution

1. **The application** — one of:
   - a URL to a deployed/staging instance, **or**
   - the source repo + how to build & run it locally (stack, install, start commands, ports), **or**
   - a Docker/compose setup.
2. **Credentials** for each role: Payroll Admin, Payroll Manager, and a Staff/self-service account.
3. **Environment safety** — confirmation of a non-production environment where destructive CRUD and
   full payroll runs (process → approve → mark paid) are safe, and whether the Ghana seed data is loaded.
4. **PIM portal** (`kedebah_v2_pim`) access if self-service payslip UI is in scope (else I test only the `/my/payslips/*` API on this app).
5. Answers to the open questions below.

---

## Open questions (from Phase 1 §12)

| # | Question | Why it matters |
|---|----------|----------------|
| 1 | Where is the testable app (URL / repo / build)? | Blocks Phases 6–9. |
| 2 | Dashboard scope — the PRD has no dashboard section, but a test-cases folder exists. What should it cover? | Avoids inventing requirements. |
| 3 | Role credentials available? | Permission/security testing (REQ-AUTH-*, REQ-SEC-*). |
| 4 | Safe non-prod environment with Ghana seed? | Calculation + destructive tests. |
| 5 | Is the PIM self-service UI in scope, or API-only? | Scopes SLIP/COMP coverage. |
| 6 | Seeded reference-rate / voluntary-scheme / overtime-rule values? | Needed to assert loan-BIK & overtime math (REQ-LOAN-002, REQ-STAX-008). |

---

## Recommended path forward

I will **continue autonomously through the documentation-only milestones** (Phases 3 → 4 → 5, and
Phase 6 scaffolding) so that the moment you provide an app + credentials, execution can start
immediately against a complete test suite. Execution (Phases 7–10) waits on your input above.

**Next milestone (M2):** Phase 3 Test Strategy + Phase 4 Test Plan.
