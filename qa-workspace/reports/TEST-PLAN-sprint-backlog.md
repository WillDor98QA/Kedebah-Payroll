# Test Plan — Payroll Sprint Backlog (PRQ-001, 003–016)

> 2026-07-08 · **DRAFT — awaiting approval.** Covers 15 of 16 backlog requirements (**PRQ-002 excluded by decision**) → ~30 user stories. Reuses the existing QA framework (API harness, `calc-oracle`, off-cycle harness, append-only ledger, 4-state reporting) + the newly-installed **Playwright MCP** for interactive UI flows. Nothing executes until this plan is approved.

## 1. Objective
Prove — with evidence, per acceptance criterion — whether each in-scope backlog item is (a) **implemented** in the live app and (b) **behaves correctly**. Every AC gets one of: **PASS · FAIL · BLOCKED · NOT APPLICABLE · NOT VERIFIED · NOT BUILT**.

## 2. Method (applies to every PRQ)
1. **Feasibility gate first.** Before designing detailed cases, confirm the feature exists in the live app (UI route/control or API endpoint). If absent → **NOT BUILT** (no false FAIL). This is mandatory because these are backlog items, not confirmed shipped features.
2. **Oracle-driven for calculations.** Independent expected values from `calc-oracle` (never the app's own output). **Pre-req P0:** resolve the open **SSNIT employee-rate discrepancy (5% vs 5.5%)** from the audit before any statutory-calc verdicts — otherwise those verdicts are unreliable.
3. **Layered coverage per feature:** Positive → Negative → Boundary → Validation → Permission/Role → Workflow/State → Performance (where an AC states a target) → Audit/Data-integrity. Security/accessibility as applicable.
4. **Dual channel:** Playwright MCP drives UI/E2E and captures snapshots+screenshots+network; the API harness verifies backend/calc and reconciles totals.
5. **Evidence + 4-state recording:** every result → append-only ledger (`TC-PRQ-<nnn>-*`), screenshots/console/network to `evidence/`, mapped back to the AC and the requirement.

## 3. Environment, safety & data — **UPDATED (validated live 2026-08-17)**
- **Target:** enterprise portal `sbxkedebah-v2.npontu.com` → business **Mary and Co** (owner **`eetornam5@gmail.com`**, creds in `automation/.env`); Payroll API `payroll.kedebah.com`. **Login validated live** → launcher shows a full active suite: **Administration, Payroll Manager, HR Manager, PIM, CRM, Procurement, Project Tracker** (all ACTIVE). Account also owns **Sam & Sons** (usable as a second isolated tenant for cross-tenant/isolation tests). *(Supersedes the old William & Co / codewithme224 creds.)*
- **Why this matters:** Mary and Co is an **owned tenant with full module access** — likely far cleaner than the old 260-employee William & Co, so the **paid lifecycle, payslip publish, and calc tests may now be safely runnable here** (to be confirmed by an employee-count/period inventory as the first execution step). HR Manager + PIM being active also unblocks PRQ-004 (leave), PRQ-005 (attendance), PRQ-010 (PIM loans).
- **Safety rules (unchanged):** confirm tenant before each mutating run; QA-prefixed data only (`ZZQA`/`E2E_`); prefer off-cycle for isolated calc; treat "Mark PAID" as controlled (verify employee/loan blast radius first); no mutation of real user accounts; always-run teardown.
- **New observations (candidate findings, to log):** (1) **419 "Session Expired"** on business-select on the first attempt (reproduce/confirm — transient CSRF vs real gap); (2) **6–7 console errors** on the select-business page; (3) new **SSO login options** (Apple/Google/Microsoft) on the enterprise sign-in — add to auth coverage.
- **Personas:** Owner `eetornam5` (full access, Mary and Co); role-scoped users to be created **in Mary and Co** for RBAC/permission tests; second tenant **Sam & Sons** for cross-tenant isolation.

## 4. Per-requirement test plan

| PRQ | Feature | Priority | Channel | Key test focus (beyond positive) | Est. cases | Env risk |
|---|---|---|---|---|---:|---|
| **001** | File upload on Mark-as-Paid + history summary | High | Browser+API | file-type/size (>10MB) reject; multi-file; paperclip indicator; **role-gated** view/download/delete; audit log; ≤5s upload; **AES-256 at-rest** (needs dev evidence) | ~10 | paid-run needed (isolated) |
| **003a/b** | Ghana benefits policy list + year-rollover rate-review alert | High | API+Browser | pre-loaded statutory items present; each has name/category/taxability/method/default; **version-controlled historical rates**; custom benefit applies; **new-year alert** fires | ~12 | rate-version seed |
| **004a–d** | Leave policy setup + with/without-pay + HRM sync + year-end | High | API+Browser | policy fields; earning methods (year-start / per-paycheck / proportional); without-pay deduction formula (oracle); partial %; balance-cap; HRM sync ≤2min; reset/carry-over audit | ~22 | HRM integration; year-end |
| **005a–f** | Attendance integration + Review Queue | Medium | Browser+API | global config; per-employee override; import (CSV/API) + unmapped-exception; **Review Queue** state machine + **role restriction + logging**; OT/absence calc (oracle); **payroll-approval blocking**; audit summary; 10k in 30s | ~30 | perf(10k); approval-gating |
| **006** | Dynamic payment-frequency periods | Medium | API+Browser | weekly/bi-weekly/semi-monthly/monthly/custom; 12-months-ahead generation; per-group independence; no overlap; change-warning; historical runs unaffected | ~10 | pay-schedule create 422 (known) |
| **007a/b** | Budget setup + deviation dashboard | Medium | Browser+API | Finance-Admin **permission**; budget CRUD; approve-lock+unlock+version history; XLSX import validation; Budget-vs-Actual variance; **≤2s save**; deviation chart red>5%; filters persist; ≤3s load; export | ~16 | perf targets |
| **008** | Employee summary dashboard by type | Medium | Browser | segmentation (FT/PT/Intern/NSS/Contract) headcount+%; table/chart toggle; new type appears; period refresh | ~6 | — |
| **009** | Statutory penalties (amount/%) | Medium | API+Browser | Finance-Admin config; tiered penalties by days-late; auto-apply + correct calc (oracle); line item in report; **waiver approval workflow** + audit; historical config retrievable | ~10 | late-payment simulation |
| **010a/b** | Loan/advance initiation from PIM | Medium | Browser+API | request fields + auto monthly-deduction; **approval workflow** (Line Mgr→HR); recurring deduction on payslip; **balance decrement + partial final instalment** (oracle — reuse TC-LOAN); HR pause/modify/close; summary report | ~14 | multi-run for balance |
| **011** | Payslip download (individual + bulk) | High | Browser+API | PDF content (logo/identity/lines/gross/deduction/net/employer SSNIT); stamp+ref#; **bulk ZIP ≤500 in 60s**; **cross-employee access denied**; not-available-if-unpublished; ≤3s single | ~10 | publish state; perf |
| **012a–d** | Dynamic bonus entry | High | Browser+API | bonus type + per-employee entry table; bulk actions + import/export; validation + live summary; **bonus-tax calc** (reuse `bonusTax` oracle); payslip + audit | ~18 | — |
| **013** | Combined Regular + Bonus run | High | API+Browser | reuses bonus table; single run applies both; **reconciliation** (regular PAYE + bonus marginal == single-pass); *depends on PRQ-012* | ~8 | Regular run (isolated) |
| **014a–c** | Bank file + GRA PAYE + SSNIT exports | High | Browser+API | file structure/columns/sort-code/totals/skip-reasons; GRA-PAYE schedule; SSNIT export; **10s/1,000-employee** target (all three) | ~14 | perf(1,000) |
| **015** | Payroll lock after approval | High | API+Browser | approved run locked from edit; unlock path; reconcile with PRQ-005 approval-gating | ~6 | approval lifecycle |
| **016** | Bulk salary update tool | Medium | Browser+API | mass update; validation; preview; effective dates; audit; rollback/error handling | ~8 | large-batch |

**Estimated total: ~220 test cases across 15 requirements.** (Exact count finalised after the feasibility gate — features not yet built drop out.)

## 5. Execution sequencing (proposed)
- **Phase 0 — Pre-reqs (blockers):** resolve SSNIT rate; confirm isolated-tenant availability (or accept env-BLOCKED items); feasibility-scan all 15 in the live app.
- **Phase 1 — High priority, low env-risk:** 008, 012, 003, 006, 016, 001(non-paid parts), 011(non-perf parts).
- **Phase 2 — High priority, dependency/lifecycle:** 012→013, 014, 015, 007.
- **Phase 3 — Medium / integration-heavy:** 005, 004, 009, 010.
- **Phase 4 — Deferred:** anything needing an isolated tenant / HRM / perf harness (marked BLOCKED-environment with evidence).

## 6. Deliverables
- `reports/sprint-backlog-certification.md` (per-PRQ verdict + AC matrix + 4-state).
- Per-feature evidence (snapshots/screenshots/network) under `evidence/`.
- New reusable specs/POMs in `automation/` (browser) + registry impls (API) — no throwaway scripts.
- Defects → `bugs/BUG-*.md` with repro/evidence; candidates → `reports/51`.
- Ledger entries `TC-PRQ-*` reconciled to the master coverage.

## 7. Entry / Exit criteria
- **Entry:** plan approved; feature confirmed built (feasibility gate); test data provisioned; oracle rate settled.
- **Exit (per PRQ):** every AC has exactly one evidence-backed state; defects logged; report reconciles to the ledger.

## 8. Risks & assumptions
- Many ACs assume features are shipped — **unbuilt items are the biggest unknown** (resolved by the feasibility gate).
- Isolated tenant, HRM connector, and a performance harness are **not currently available** → perf/paid-lifecycle/HRM ACs will be BLOCKED-environment unless provided.
- The SSNIT-rate question gates all statutory-calc verdicts.
- Shared-tenant mutation is constrained → some E2E paths use off-cycle proxies rather than the true paid lifecycle.

## 9. Approval
Please approve, or tell me what to change:
- **Scope** (15 PRQs, PRQ-002 excluded) ✅ / adjust
- **Priority/sequencing** (High-first, dependency-aware) ✅ / adjust
- **Safety stance** (off-cycle, no paid-run on shared tenant, no real-account mutation) ✅ / adjust
- **Depth** (~220 cases, full category coverage) ✅ / lighter smoke-first / heavier
- **Isolated tenant** — will you provide one? (determines how many items are testable vs BLOCKED-environment)
