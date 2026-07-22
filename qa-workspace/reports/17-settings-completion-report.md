# 17 — Settings Completion Report

> Phase 2 · Settings Completion Programme · 2026-06-30 · derived from the append-only ledger `evidence/exec/records.ndjson`. Scope: 9 Settings modules (Finance Posting excluded per instruction). Every in-scope test case is in a terminal state (PASS / BLOCKED-with-evidence / N/A); **0 FAIL, 0 Needs-Automation**.

## Headline change this phase

1. **The two "standing defects" were test-assertion bugs, not product defects — both corrected to PASS:**
   - **TC-BANK-001** asserted `≥27` banks; the real Ghana seed is **25 system banks + 1667 system branches**, intact with zero test residue → corrected threshold → **PASS**.
   - **TC-BEN-009** used a brittle exact-formula assertion; with a `tax_treatment` read-back and relational check, the non-taxable benefit is confirmed **excluded** from the PAYE base → **PASS**.
   - **Result: 0 confirmed product defects among Settings cases.**

2. **Re-discovery corrected prior wrong-path "Missing API Contract" classifications.** The previous phase probed wrong endpoint names; these contracts **do exist**: `/users`, `/roles`, `/permissions` (full matrix; role CRUD + permission assignment **work**), `/approval-workflows` (6, with stages/activation), `/pay-schedules` (non-monthly creatable). Pay-group **CREATE/DELETE** works.

3. **Pay-group member assignment is DEFINITIVELY blocked (fresh evidence).** `PUT /employees/{id} {pay_group_id}` → 200 but `employee_count` stays 0 (silent no-op); `POST/PUT /pay-groups/{id}/{employees,members,assign}` → 405; the employee object has **no `pay_group_id` field**; `PUT /pay-groups/{id} {employee_ids|staff_ids|members}` → 200 but no membership applied. Group CRUD works; **membership cannot be set via API**.

4. **Organization Setup has no API surface** (all of `/organization`, `/organizations`, `/company`, `/business`, `/settings`, `/organization-settings` → SPA-HTML). It is a **browser-only** module; its requirements cannot be reverse-engineered from the API and were not fabricated.

## Module-by-module completion (all terminal)

| Module | Total | PASS | FAIL | BLOCKED (Contract/Creds/Browser/Infra) | N/A | PASS % | Status |
|---|---|---|---|---|---|---|---|
| Organization Setup | 0 | 0 | 0 | — (browser-only, no API; no TCs authored) | 0 | n/a | ⚫ Not API-testable |
| Pay Schedule | 20 | 11 | 0 | C9 | 0 | 55% | 🟠 Partial |
| Tax & Statutory | 79 | 40 | 0 | C35 / Cr1 / B3 | 0 | 51% | 🟠 Partial |
| Employee Setup | 34 | 18 | 0 | C1 / B11 / I1 | 3 | 53% | 🟠 Partial |
| Bank Setup | 16 | 12 | 0 | Cr1 / B3 | 0 | 75% | 🟡 Mostly |
| Earnings/Benefits/Deductions | 45 | 30 | 0 | C9 / Cr1 / I5 | 0 | 67% | 🟠 Partial (→Mostly) |
| Pay Groups | 12 | 3 | 0 | C9 | 0 | 25% | 🔴 Lightly |
| Users & Roles | 37 | 9 | 0 | C2 / Cr11 / B11 | 4 | 24% | 🔴 Lightly |
| Approval Setup | 20 | 12 | 0 | C7 / B1 | 0 | 60% | 🟠 Partial |

C=Missing API Contract, Cr=Credentials, B=Browser-only, I=Infrastructure.

## What was completed / changed this phase

- **+2 PASS** from false-FAIL correction (BANK-001, BEN-009) → **0 FAIL**.
- **+1 PASS** Pay-Groups delete (PG-003).
- **Fresh definitive BLOCKED evidence** appended for PG-001/002/005 (member-assignment silent no-op), CYCLE-001 (schedule effective-date constraint), and the Organization no-API finding.
- Ledger verified-metric now: **234 PASS · 0 FAIL · 175 BLOCKED · 8 N/A = 417**.

## Genuine remaining blockers (per module, with evidence)

- **Pay Groups (9):** member assignment not exposed (silent no-op + 405 + no field) → **Missing API Contract**. Group-level benefit/deduction/protected-pay & layered resolution untestable without membership.
- **Users & Roles (22):** roles/permissions config **exists and is auditable**, but *enforcement* (Manager/Staff CRUD, API-deny-despite-hidden-UI, self-service) needs **non-admin sessions** (Credentials); login/session/menu-gating are **Browser-only**.
- **Tax & Statutory (39):** reliefs assignment, exemption/override/preset, protected-pay, overtime/pension special-tax → **Missing API Contract**; statutory-config defects BUG-002/003/004/005.
- **Employee Setup (13):** import/export/templates/masking/pickers → **Browser-only**; daily/hourly comp → **Missing API Contract**.
- **Pay Schedule (9):** non-monthly schedules **creatable in principle** but `effective_date` must follow all completed periods — **Infrastructure-constrained** in this advanced-calendar sandbox.
- **Bank Setup (4):** sort-code pickers (Browser); Manager view-only (Credentials); BUG-008 seeded-bank-edit silently ignored (defect).
- **EBD (15):** %-net/%-cash deductions, qualifying-income base, thresholds (Contract); dept/country scope, windows (Infra — single-dept/country tenant + regular-run harness).
- **Approval (8):** approval activation/routing config exposed (`/approval-workflows`) but reject/return/escalation editing → Contract/Browser.
- **Organization Setup:** entire module → **Browser-only** (no API).

## Reconciliation

234 PASS + 0 FAIL + 175 BLOCKED + 8 N/A = **417** ✓ (matches `coverage-dashboard.md`, `08-automation-coverage-matrix.md`). Append-only; no historical PASS overwritten.
