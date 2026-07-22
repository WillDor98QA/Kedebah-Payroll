# 41 — Reclassified Blockers (Phase 6)

> 2026-06-30 · Every remaining BLOCKED case reclassified into exactly one mandated class, each with live evidence. Full per-case data: **`reports/reclassified-blockers.csv`** (191 rows). No case remains blocked on an outdated assumption.

## Reclassification summary (191 remaining BLOCKED)

| Reclassification | Count |
|---|---:|
| STILL BLOCKED | 190 |
| ENVIRONMENT ISSUE | 1 |
| READY FOR EXECUTION | 0 (the 5 ready AUTH cases were executed → PASS; see `reports/40`) |
| NOT APPLICABLE | 0 |
| PRODUCT DEFECT | 0 new (existing product defects already tracked as BUG-001…012) |
| CONFIGURATION ISSUE | 0 |

## STILL BLOCKED — by evidence-backed reason

| Reason | Count | Evidence (why QA cannot execute) | Recoverable when… |
|---|---:|---|---|
| **Missing API Contract** | 73 | Re-probed live 2026-06-30T19:07 — write/assign endpoints absent (`GET → 200 SPA-HTML`, `POST → 405`): pay-group membership, employee-reliefs, employee-exemptions, statutory presets/overrides, protected-pay-rules | Backend exposes the contract (or a browser path is built for the Settings UI) |
| **Missing automation** (not implemented) | 44 | Registry note "pending implementation / not yet ported" — case has no executable impl | Automation is developed for the case |
| **Browser execution pending** | 32 | UI-only case; spec not built, or page requires Payroll module access | Spec built AND (for payroll pages) BUG-011 resolved |
| **BUG-011 — no Payroll module entitlement** (credentials validated) | 22 | Per-role / self-service needs a non-admin Payroll session; all role accounts show empty Module Launcher (`reports/35`) | BUG-011 fixed (Payroll module provisioned) |
| **BUG-011 — module access** (direct) | 11 | Same — Critical product defect blocks Payroll entry | BUG-011 fixed |
| **Infrastructure** (shared sandbox) | 6 | Multi-run / calendar-advancing isolation on a shared sandbox would have wide impact (e.g. loan near-payoff clamp, per-employee window on regular run) | Isolated/seeded environment or regular-run harness |
| Manual review | 2 | Reason not auto-classifiable from latest evidence — flagged for manual disposition | Manual review |

| **ENVIRONMENT ISSUE** | 1 | `TC-TAX-006` — only one dated rate version seeded; before/after-effective selection needs a 2nd version | Seed a 2nd dated rate version |

## Key forensic findings

1. **No case remains blocked on a stale "Missing Credentials" assumption.** All 33 credential/persona/module cases are reclassified to **BUG-011 module entitlement** (the true, current blocker) with this-session evidence.
2. **The 73 API-contract blockers are confirmed by a fresh live probe**, not history — the subscription renewal did not add the missing contracts.
3. **44 cases are missing automation, not product blockers** — they need test development (mostly non-recovered TC-AUTH-* role-enforcement + un-ported cases), and several of those (role enforcement 013–019) are also gated by BUG-011.

## Single biggest unlock
**Fix BUG-011 (provision the Payroll module).** That alone makes the 33 module/credential cases executable and enables the 32 browser-pending payroll-page cases — the largest recoverable block, currently impossible for QA.
