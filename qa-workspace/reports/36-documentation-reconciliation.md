# 36 — Documentation Reconciliation

> 2026-06-30 · **Documentation-only reconciliation.** No tests were run, the execution ledger was not modified, and no PASS/FAIL/BLOCKED totals were changed. Objective: a single authoritative view that every report agrees on the canonical figures and uses the correct identifiers, with all stale enterprise-onboarding narrative removed.

## 1. Canonical figures (source of truth)

The append-only ledger `evidence/exec/records.ndjson` is the source of truth. Two **bases** are reported (both legitimate — they measure different things):

| Basis | What it counts | Figures |
|---|---|---|
| **Catalogue verdict — PASS-sticky (CANONICAL)** | One verdict per catalogued test case; a historical PASS is never overwritten by a later BLOCKED; a FAIL counts only when it is the latest state. | **234 PASS · 1 FAIL · 174 BLOCKED · 8 N/A = 417 cases** |
| Rule-level execution records | Every execution attempt incl. superseded re-runs (audit trail) | 763 records (453 PASS · 16 FAIL · 294 BLOCKED) |
| **Open defects** | Formal bug files `bugs/BUG-0NN.md` | **12** (BUG-001 … BUG-012) |
| Browser findings | `evidence/browser/findings.ndjson` | 20 (BR-001 … BR-020, unique) |

The canonical line is produced by the coverage matrix generator (`reports/08`) and equals the catalogue-verdict basis. Report `05` now prints **both** bases with explicit labels so it cannot be misread.

## 2. Identifier reconciliation (verified correct everywhere)

| ID | Meaning | Formalised as | Used correctly in |
|---|---|---|---|
| **BR-016** | Admin-set password silently ignored at user-create | **BUG-012** | 23, 34, 35, BUG-012 |
| **BR-017** | `role_ids` at user-create silently ignored | — | 23, 34, 35 |
| **BR-018** | Multi-domain SSO + forced password change (now navigable, not a blocker) | — | 23, 35 |
| **BR-019** | Forced/reset passwords are themselves must-change (final state documented) | — | 23, 35 |
| **BR-020** | Enterprise Module Launcher empty → no module access | **BUG-011** | 04, 23, 35, BUG-011 |

A prior ID collision (three findings mis-saved as duplicate `BR-016/017`) was corrected to **BR-018/019/020**; `findings.ndjson` now contains unique IDs BR-001…020.

## 3. Reconciliation table

**Status** legend: *Generated* = regenerated from the ledger; *Current* = manually authored, reflects latest state; *Snapshot* = dated point-in-time report (carries a snapshot banner; superseded by the generated set for current totals).

| Report | Status | Updated | Consistent |
|---|---|---|---|
| 00-engagement-status | Snapshot | banner | ✅ scoped |
| 01-milestone-summary | Snapshot | banner | ✅ scoped |
| 02-execution-report (06-25 initial run) | Snapshot | dated | ✅ scoped |
| 03-executive-summary (06-29 reconciled snapshot) | Snapshot | banner | ✅ scoped |
| **04-developer-handoff** | **Generated** | ✅ yes | ✅ to ledger |
| **05-executive-qa-report** | **Generated** | ✅ yes (dual-basis labelled) | ✅ to ledger |
| 06-application-coverage-map | Snapshot | dated | ✅ scoped |
| 07-requests-to-unblock | Current | — | ✅ |
| **08-automation-coverage-matrix** | **Generated (CANONICAL)** | ✅ yes | ✅ to ledger |
| 09-final-stakeholder-report (06-29) | Snapshot | banner | ✅ scoped |
| 10–15 admin readiness/gap/completion/framework | Snapshot | dated | ✅ scoped |
| 16-final-stakeholder-report (06-30 admin close-out) | Snapshot | ✅ banner added → points to 08/35/36 | ✅ scoped |
| 17–20 settings completion/traceability/coverage/readiness | Snapshot | dated | ✅ scoped |
| 21-browser-coverage-dashboard | Snapshot | dated | ✅ scoped |
| **23-exploratory-findings-register** | **Current** | ✅ regenerated (all 20 findings) | ✅ to findings.ndjson |
| 24-accessibility-report | Current | — | ✅ |
| 32-users-roles-capability-proof | Current | — | ✅ |
| 33-bug-verification-report | Current | — | ✅ |
| 34-identity-access-management-report | Current | — | ✅ (BR-016/017 correct) |
| **35-enterprise-onboarding-report** | **Current** | ✅ fixed (single password register; §6 corrected; stray fence removed) | ✅ |
| 35-phase4-credential-status | **Superseded** | ✅ stub → points to 35 | ✅ (no figures) |
| **36-documentation-reconciliation** | Current | this file | ✅ |

## 4. What was changed in this pass (documentation only)

- **35** — replaced the contradictory interim password table with one **final password register**; corrected §6 (all four accounts onboarded, not "three on temp"); removed a stray code fence; linked BR-020→BUG-011, BR-016→BUG-012.
- **04** (generator) — superseded BLOCKED rows whose tcId later PASSed are now annotated *"SUPERSEDED / RESOLVED"*; the stale *"pending Manager + Staff credentials"* note replaced with the accurate **BUG-011 module-provisioning** blocker. **Counts unchanged.**
- **05** (generator) — now prints the canonical PASS-sticky catalogue verdict alongside the raw-record basis, each clearly labelled.
- **23** — regenerated from `findings.ndjson` (all 20 findings, correct unique IDs).
- **16** — snapshot banner added pointing to the live canonical (08) and the enterprise reports.
- **findings.ndjson** — three duplicate IDs corrected to BR-018/019/020 (no totals affected).
- **35-phase4-credential-status** — converted to a superseded stub pointing to 35.

The execution ledger, evidence, and the canonical PASS/FAIL/BLOCKED/N-A totals (234/1/174/8 = 417) and bug count (12) are **unchanged**.

## 5. Conclusion

Documentation reconciliation complete.
No stale narrative remains.
All reports reconcile to the execution ledger.
