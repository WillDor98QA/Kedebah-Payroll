# Requests to Unblock the Remaining Admin Tests

**Date:** 2026-06-28 · Forward this to the **client (for credentials)** and the **dev team (for API contracts + bug fixes)**.

Admin testing is at **47% of admin-reachable requirements verified** (118/249) with **331 checks (291 PASS / 11 FAIL / 29 BLOCKED)** and a **96% pass-rate** on everything verified. Every major capability is proven (engine to the cent, all 4 pay-run lifecycles, outputs, audit, employees, catalog, loans). **The remaining gap is blocked on inputs we don't control — not on QA effort.** This page lists exactly what's needed.

---

## 1. Credentials needed from the client (highest real risk)

The entire **non-admin security boundary is untested.** Please provide sandbox logins:

| Need | Unblocks | Why it matters |
|---|---|---|
| **Payroll Manager** login | Manager role permissions, approval authority scoping | Confirms Manager can't exceed their authority |
| **Staff/Employee** login | Self-service: own payslip, scope isolation (IDOR), self-service pages (§25) | Confirms a staff user **cannot** see other employees' pay data |

> ~9 requirements (AUTH/SEC/SLIP/COMP self-service) are BLOCKED solely on these. This is a **go-live risk**: we have not proven that a low-privilege user is properly contained.

---

## 2. API contracts needed from the dev team (Group A)

Each was reverse-engineered as far as the responses allowed; the missing piece is noted with the exact probe evidence.

| Feature | Endpoint probed | Result | What we need |
|---|---|---|---|
| **Protected-pay rules** | `POST /protected-pay-rules` | **405** (route not exposed) | Create-rule payload + how a rule attaches to an employee/group |
| **Pay-group member assignment** | pay-group create ignores members; `members:null` | members never populate | The member-assignment contract (e.g. `pay-groups/{id}/assignments`). *Also blocks confirming **BUG-006**.* |
| **Overtime entry** | `overtime-rules` GET empty; `salary-adjustments` POST | 422 (needs unknown fields) | Overtime entry/adjustment payload (junior 5%/10% vs senior marginal) |
| **Catalog approval-activation** | `submit-for-approval` / `approve-activation` | **422** "Approval request not found" | How a *pending change* is created so the submit→approve workflow has something to approve |
| **Bank branch create** | `POST /banks/{id}/branches` | **405** | Branch-create contract (for sort-code uniqueness + delete-guard tests) |
| **Daily / Hourly compensation** | `POST /employees/{id}/salary salary_type=daily` | **422** ("invalid"; `hourly` accepted but computes 0) | The compensation-mode contract for non-monthly pay (likely `compensation_mode`/Casual employment-type path) |
| **Variance report** | `/reports/variance-comparison` | 200 but **empty** with one period | The two-period comparison params |
| **Audit & Compliance report** | `/reports/audit-compliance?from=&to=` | no data | The date-range report params (or confirm it's the per-resource audit trail, already verified) |

> ~20–25 requirements sit behind these. With the contracts, QA can finish them the same day (the test harness is built).

---

## 3. Bug fixes for the dev team (go-live blockers first)

Full repro + suggested fix in [`bugs/`](../bugs/) and the prioritized [Developer Hand-off](04-developer-handoff.md).

| Priority | Bug | Impact |
|---|---|---|
| **GO-LIVE BLOCKER** | [BUG-004](../bugs/BUG-004.md) (High) | PAYE bands **cannot be edited** — config validation rejects the seeded contiguous bands (422) |
| **GO-LIVE BLOCKER** | [BUG-005](../bugs/BUG-005.md) (High) | Statutory config **save silently fails** in the UI (POST to a PUT-only route → 405) |
| **GO-LIVE BLOCKER** | [BUG-006](../bugs/BUG-006.md) (Med) | A run on an **empty pay group paid all active employees** — mass-payment risk |
| Disposition | BUG-002/003 (Med) | PRD vs implementation tax-rate mismatches — reconcile authoritative Ghana figures |
| Disposition | BUG-007 (Med) | No abort path for an approved-unpaid run |
| Disposition | BUG-009 (Med) | Tampered token → HTTP 500 instead of 401 |
| Disposition | BUG-001/008/010 (Low) | Cosmetic / misleading-200 / payment_method enum casing |

---

## 4. What QA will NOT chase (deferred by agreement — low value)

~80 granular sub-requirements (individual payment actions, payslip variants, alert types, pay-calendar rules, form -SUPP variants) re-verify behaviours **already proven**. These raise the coverage % without adding real assurance and create throwaway-data residue. Recommend leaving these unless a specific one is a concern.

---

## Bottom line
Provide **(1) two credentials** and **(2) the Group-A contracts**, and have the dev start on the **3 go-live blockers**. That converts the remaining BLOCKED items into executable tests and clears the path to a go/no-go certification. Until then: **NOT READY to certify**, but the core payroll engine and workflow are solid.
