# 52 — Framework / Environment Observations (NOT Product Bugs)

> Phase 7 · 2026-07-01 · Non-product items moved out of the defect register. These are **not bugs** — they are automation/reporting/framework limitations, environment/infrastructure constraints, missing API contracts, usability/perf observations, or superseded findings. Nothing here appears in `reports/50` or `reports/51`.

## A. Superseded / resolved (exclude from all bug lists)
| Ref | Was | Now |
|---|---|---|
| BR-014, BR-015 | "Administrator cannot create/invite users" (subscription-gated) | **Resolved** — user creation works (IAM phase; subscription renewed). Historical, not current. |

## B. Product observations / known limitations (behaviour, not defects)
| Ref | Observation | Disposition |
|---|---|---|
| BR-018 | New users go through a multi-domain SSO + forced first-login password change (`sbxkedebah-v2.npontu.com`). | Expected product behaviour; documented onboarding flow (`reports/35`). Recommendation only. |
| BR-012 | Organization Setup is a browser-only module (no API contract). | By-design (no API). Not a defect. |
| BR-005 | Settings setup cards show a slow skeleton-load state. | Performance/UX observation — recommendation, not a failure. |
| BR-008, BR-011 | Some setup cards lack a visible status badge (e.g. Organization Setup). | Minor UX recommendation. |

## C. Missing API contracts (block cases; per policy NOT bugs)
Re-probed live 2026-06-30/07-01 — these endpoints are **not exposed** (`GET → 200 SPA-HTML`, `POST → 405`). They block ~86 cases but are not product defects to be fixed as bugs; they are **capability gaps** for the product/API team.
| Area | Missing contract | Cases blocked |
|---|---|---|
| Pay-run adjustments / **overtime entry** | `/pay-runs/{id}/adjustments`, `/pay-run-adjustments`, `/overtime` | STAX overtime (013/014/015/018), CAL-009/010/012, RUN-019 |
| **Tier-3 / voluntary pension** input | `/tier-3-schemes`, `/pension-schemes`, `/voluntary-pensions` | STAX pension-cap (020/021/022/023) |
| Relief → employee assignment | `/employee-reliefs`, `/tax-reliefs/assign` | RELF-001..008 |
| Statutory exemption / preset / override | `/employee-exemptions`, `/statutory-presets`, `/employee-statutory-overrides` | TAX-009/013/014/016 |
| Pay-group **membership** | `/pay-groups/{id}/members` (PUT `pay_group_id` is a silent no-op) | PG-001/002/005 |
| Payslip retrieval | `/employees/{id}/payslips` (SPA-HTML) | SLIP-003 |

> Note: the **oracles and seeds for overtime & pension are ready** (`calc-oracle.ts` + seeded statutory items) — these would execute the moment the input contract is exposed. That is a product/API capability gap, not a QA-fixable bug.

## D. Environment / infrastructure limitations
| Item | Detail |
|---|---|
| Pay-schedule create constraint | `POST /pay-schedules` rejected (422 — `effective_date` must follow the last completed period) on the shared sandbox → CYCLE-003/015/016/017/018/019/020 not constructable. |
| Missing seed data | Only one dated rate version seeded → TC-TAX-006 (before/after-effective) not constructable. |
| Shared-sandbox multi-run isolation | Cases needing calendar-advancing Regular runs (loan near-payoff clamp, per-employee windows) would corrupt shared state — deferred, not defects. |
| BUG-011 dependency | ~50 per-role / self-service / payroll-UI cases are blocked by the BUG-011 module-entitlement defect (the *defect* is in `reports/50`; the dependent blocked cases are environment-blocked, not separate bugs). |

## E. Automation / reporting / framework
| Item | Detail | Action |
|---|---|---|
| BR-019 | QA automation submitted forced-password-change forms during recovery (changed some role passwords). | Technical-debt/operational note (`reports/35`); not a product bug. |
| Auth `setup` project stale | The `auth.setup.ts` login broke when the login UI became the enterprise SSO; browser/live runs use `--no-deps` + the valid stored token, and fresh-login specs. | Framework maintenance — update `auth.setup.ts` to the enterprise flow. |
| Coverage-matrix ±1 | `generate-coverage-matrix.mjs` prints PASS 250 vs the de-duped ledger truth (249). | **Reporting defect** to fix at close-out — modify the generator to reconcile to the ledger (never the ledger to the report). |

## Summary
None of the above are product bugs. **Confirmed product defects live only in `reports/50`** (10 defects); items needing disposition live in `reports/51` (6). The three lists are mutually exclusive.
