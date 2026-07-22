# 40 — Certification Dashboard (Evidence-Driven, Framework v2)

> 2026-06-30 · READ-ONLY. Four independent states per test case; open defects overlaid so none is hidden by a historical PASS. Sources: ledger, bug register, findings, catalogue. Reconciles to `reports/08`.

## A. Execution dashboard (catalogue, 417 cases)

| Current Execution | Count |
|---|---:|
| PASS | 155 |
| FAIL | 1 |
| BLOCKED | 253 |
| NOT APPLICABLE | 8 |
| NOT RUN | 0 |

_Historical Verification = PASS (ever verified): **234** / 417._

**Reconciliation to `reports/08` (PASS-sticky):** canonical PASS **234** = Historical-verified. Current-PASS 155 + **79 once-passed-now-blocked** = 234. Canonical BLOCKED **174** = never-passed-and-blocked (current-BLOCKED 253 − 79 superseded). N/A 8. **The drop from 234 historical to 155 current-PASS is the key product-reality signal a sticky-only report hides.**

## B. Product-quality dashboard (defects, independent of execution)

| Open defects | Count |
|---|---:|
| **Total open** | 12 |
| Critical | 1 |
| High | 2 |
| Major | 1 |
| Medium | 5 |
| Low | 3 |
| **Release-blocking (Crit/High/Major)** | 4 |

**Catalogue cases with an open defect linked: 12** — of which **5** currently PASS execution (GREEN-but-bugged → must NOT be certified as-is); the rest are also BLOCKED/FAILED. **No bug is hidden:** every linked bug shows in the row's "Linked Bug(s)" column regardless of execution state.

## C. Certification status (catalogue)

| Certification Status | Count |
|---|---:|
| READY | 150 |
| AFFECTED BY OPEN DEFECT | 5 |
| FAILED | 1 |
| BLOCKED | 253 |
| NOT VERIFIED | 0 |
| OUT OF SCOPE | 8 |

## D. Off-catalogue defects (would be invisible in a catalogue-only sheet)

| Test Case | Module | Current | Linked Bug | Severity |
|---|---|---|---|---|
| TC-EMP-019n |  | NOT RUN | BUG-010 | Low |
| TC-ENT-004 | Enterprise Onboarding | BLOCKED | BUG-011 | Critical |
| TC-ENT-005 | Enterprise Onboarding | BLOCKED | BUG-011 | Critical |
| TC-ENT-MOD-admin | Enterprise Onboarding | BLOCKED | BUG-011 | Critical |
| TC-ENT-MOD-employee | Enterprise Onboarding | BLOCKED | BUG-011 | Critical |
| TC-ENT-PW-manager | Enterprise Onboarding | PASS | BUG-012 | Major |
| TC-ENT-PW-reports | Enterprise Onboarding | BLOCKED | BUG-012 | Major |
| TC-URB-005 | Users & Roles | BLOCKED | BUG-012 | Major |

## E. Release gates

| Gate | Status | Basis |
|---|---|---|
| API Business Logic | **PARTIAL** | Engine PASS; open TAX defects BUG-001/004/005 |
| Payroll Engine (calc) | **READY** | PAYE/SSNIT/reliefs/net oracle-verified |
| Payroll Lifecycle | **PARTIAL** | Lifecycle→PAID PASS; BUG-007 (Approved transitions) |
| Browser UI | **NOT VERIFIED** | Only Settings/Users; core payroll UI untested |
| Role Security | **BLOCKED** | Enforcement unverified; BUG-011 blocks Payroll entry |
| Accessibility | **PARTIAL** | Shell axe violations BR-001/002/003/007; payroll pages untested |
| Performance | **NOT VERIFIED** | No load/volume evidence |
| Integration | **NOT VERIFIED** | Finance/HRIS/email content unverified |
| Enterprise Onboarding | **BLOCKED** | BUG-011 empty module launcher (Critical) |
| Reporting | **PARTIAL** | Content PASS; UI/export browser-gap |
| Finance Integration | **NOT VERIFIED** | No evidence |
| Production Readiness | **BLOCKED** | BUG-011 Critical + enforcement unverified |

## F. CTO self-check

> *"Would a CTO incorrectly believe this is production-ready?"* — **No.** Execution shows 155 PASS, but the product-quality dashboard shows **12 open defects (incl. 1 Critical)** and **5 passed-but-bugged** cases, and **Production Readiness = BLOCKED**. Execution evidence, defect status, and release readiness are reported together and agree: **not certifiable** while BUG-011 (Critical) is open.
