# 20 — Settings Production Readiness

> 2026-06-30 · Settings Completion Programme (Phase 2) close-out · all figures reconcile to `evidence/exec/records.ndjson`. Finance Posting out of scope.

## Verdict per module

| Module | Production-ready? | Rationale |
|---|---|---|
| **Bank Setup** | 🟡 **Closest to sign-off** | CRUD + guards + seed integrity verified (75% PASS, 0 FAIL). Residual is UI pickers (Browser) + Manager view (Creds) + BUG-008 (seeded-edit silently ignored). Sign-off after BUG-008 disposition. |
| **Earnings/Benefits/Deductions** | 🟡 Conditionally | Calc/treatment/BIK/scope verified (67%). Residual = unexposed deduction calc-methods + tenant-shape infra. |
| **Approval Setup** | 🟠 Not yet | Lifecycle-to-PAID verified (60%); approval-workflow **config** exists but reject/return/escalation editing unverified (Contract/Browser). |
| **Pay Schedule** | 🟠 Not yet | Monthly verified (55%); non-monthly frequencies blocked by effective-date/calendar infra. |
| **Tax & Statutory** | 🟠 Not yet | Engine verified to the cent; **config-write surface** (override/preset/exemption/reliefs-assignment/protected-pay) unexposed + open defects BUG-002/003/004/005. |
| **Employee Setup** | 🟠 Not yet | API onboarding/validation verified (53%); import/export/masking/daily-hourly unverified (Browser/Contract). |
| **Pay Groups** | 🔴 **NOT ready** | Member assignment is non-functional via API (silent no-op, proven) — the core of the module is unusable/untestable. |
| **Users & Roles** | 🔴 **NOT ready** | Role/permission **config exists** but multi-role **enforcement** is unverified (no non-admin sessions); the defining function is untested. |
| **Organization Setup** | ⚫ **NOT verified** | No API surface; entirely browser-only; not yet exercised. |

## Direct answers

1. **Not production ready:** Pay Groups, Users & Roles, Organization Setup (and Tax & Statutory until its config defects are dispositioned).
2. **Could be signed off today:** **Bank Setup** — conditional on BUG-008 disposition (seeded-bank edit silently ignored). No module is unconditionally sign-off-ready.
3. **More API automation needed:** None among in-scope modules remain as *unwritten admin-API* tests — the gaps are unexposed contracts. Development must **expose**: pay-group membership, reliefs assignment, statutory override/preset/exemption, %-net deductions, overtime/pension, approval-routing editing.
4. **Browser automation needed:** Users & Roles (login/session/menu-gating), Employee Setup (import/masking/pickers), Approval (reject/return UI), Bank (pickers), **Organization Setup (entire module)**, plus accessibility/responsive across all.
5. **Manager/Staff credentials needed:** Users & Roles (role enforcement, self-service), Bank (Manager view-only), Tax (config permission), and cross-role slices elsewhere.

## Open defects (Settings)

- **0 standing FAIL** (the two prior "defects" were test-assertion bugs, corrected).
- Register defects touching Settings: **BUG-002** (Tier-1 ER 8% vs 13%), **BUG-003** (SSF Tier-3), **BUG-004/005** (statutory config save/band edit), **BUG-006** (no-group regular run populates all), **BUG-007** (approved-run cancel), **BUG-008** (seeded-bank edit ignored), **BUG-010** (employee payment_method casing).
- **Candidate to verify:** pay-group `pay_group_id` accepted-but-ignored (silent no-op) resembles the BUG-008 silent-accept pattern — recommend a dev ticket (accept-and-ignore is a data-integrity risk).

## Risk assessment

| Risk | Severity | Note |
|---|---|---|
| Pay-group membership non-functional | **High** | grouping-driven payroll (shared benefits/deductions, scoped runs) cannot be used or verified |
| Cross-role permission enforcement unverified | **High** | security boundary (Manager/Staff/self-service) only verifiable with non-admin sessions |
| Statutory config-write unexposed + rate defects | **High** | compliance-critical; BUG-002/003 affect contribution amounts |
| Organization/Finance/UI flows browser-only & unautomated | Medium | no browser suite; accessibility/responsive unverified |
| Silent-accept fields (pay_group_id, seeded-bank edit) | Medium | data-integrity: API returns success but ignores input |

## Stakeholder recommendations

1. **Adopt the verified core as the CI gate** — 234 PASS programme-wide; engine/lifecycle/bank/loan/alerts are oracle-exact and stable.
2. **Development to expose or confirm** the unexposed Settings contracts (pay-group membership first — it blocks the most), and fix the silent-accept fields + BUG register.
3. **Provision a non-production test tenant** with Manager/Staff/HR/Auditor accounts and a second department/country to unlock enforcement + scope verification.
4. **Stand up a browser-driven Playwright suite** (the SPA login already produces storage state) for Organization Setup, import/masking, role/menu gating, and accessibility/responsive — the largest remaining coverage frontier.
5. **Do not present** Pay Groups, Users & Roles, or Organization Setup as QA-Complete. **Bank Setup** may be presented as QA-Complete pending BUG-008.

## Reconciliation

Settings in-scope: 135 PASS + 0 FAIL + 121 BLOCKED + 7 N/A = **263** ✓. Programme-wide: 234 PASS + 0 FAIL + 175 BLOCKED + 8 N/A = **417** ✓. No fabricated evidence; every BLOCKED carries discovery evidence in the ledger.
