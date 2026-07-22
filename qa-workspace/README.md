# Kedebah Payroll — QA Workspace

This workspace holds **all** QA artifacts for the Kedebah Payroll system. Every artifact is
traceable end-to-end:

```
Documentation → Requirements → Test Cases → Automation → Execution → Evidence → Bugs → Reports
   (docs/)      (requirements/)  (test-cases/)  (automation/)  (evidence/)        (bugs/)  (reports/)
```

## Source of Truth

The official PRD is `docs/PAYROLL_COMPLETE_SYSTEM_GUIDE.md` (copied verbatim from the project
root). All expected behaviour is defined there. Nothing in this workspace may contradict it.
Anything the PRD marks as *Placeholder / Preview / Not Implemented / Future Enhancement / Sample
Data* is **out of scope for functional verification** (tracked separately as "documented gaps").

## Directory Map

| Folder | Contents |
|--------|----------|
| `docs/` | Frozen copy of the PRD (source of truth). |
| `analysis/` | Phase 1 — Product Analysis. |
| `requirements/` | Phase 2 — Extracted, structured requirements + traceability matrix. |
| `test-plan/` | Phases 3–4 — Test Strategy and Test Plan. |
| `test-cases/` | Phase 5 — Test cases, one folder per module. |
| `automation/` | Phase 6 — Playwright (TypeScript, POM): `pages/ tests/ fixtures/ utils/ helpers/ config/`. |
| `evidence/` | Phase 7 — `screenshots/ videos/ traces/ console/ network/ logs/`. |
| `bugs/` | Phase 9 — One file per defect. |
| `reports/` | Phase 10 — Executive summary, coverage, readiness. |
| `coverage/` | Requirement coverage tracking. |

## ID Conventions

| Artifact | Pattern | Example |
|----------|---------|---------|
| Requirement | `REQ-<MODULE>-<nnn>` | `REQ-PAYE-014` |
| Test Case | `TC-<MODULE>-<nnn>` | `TC-AUTH-007` |
| Bug | `BUG-<nnn>` | `BUG-001` |
| Module codes | AUTH, DASH, EMP, PAY, PG, BEN, DED, BIK, LOAN, TAX, PAYE, PROT, CAL, RUN, PAYM, FORM, SLIP, RPT, COMP, SEC, SETUP, BANK |

## Milestone Roadmap

| Milestone | Phase(s) | Status |
|-----------|----------|--------|
| M1 | Workspace + Phase 1 Product Analysis + Phase 2 Requirements | ✅ Complete |
| M2 | Phase 3 Test Strategy + Phase 4 Test Plan | ✅ Complete |
| M3 | Phase 5 Test Case Generation — **417 cases, 25 modules** | ✅ Complete |
| M4 | Phase 6 Automation framework (Playwright/POM) + **calc oracle (135 assertions passing)** | ✅ Complete |
| M5 | Phases 7–9 Execution, Evidence, Defects (live sandbox) | 🔄 **In progress** — auth/seed/calc verified; 12/417 TCs executed; BUG-001/002/003 logged |
| M6 | Phase 10 Reporting & Production Readiness | 🔄 Living (test-management/ + reports/03-executive-summary.md) |

### Enterprise test-management deliverables (auto-generated, living)
- `test-management/test-case-catalogue.md` — master catalogue (417 cases, all required columns).
- `test-management/test-execution-report.md` — living rule-level execution log.
- `test-management/coverage-dashboard.md` — coverage + readiness.
- Regenerate: `node test-management/generate-reports.mjs` (see `test-management/README.md`).

> **Execution blocker:** This project directory contains only the PRD. There is no application
> (no URL, no source code, no credentials). Milestones M4–M5 cannot run until a testable target
> is provided. See `reports/00-engagement-status.md`.
