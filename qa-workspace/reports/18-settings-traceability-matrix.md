# 18 — Settings Traceability Matrix

> Requirement → Test Case → terminal status, per Settings module. 2026-06-30, from `requirements/00-requirements-catalog.md` + the execution ledger. Finance Posting excluded.

| Settings Module | PRD § | Requirement IDs (count) | Test Cases | PASS | Terminal-BLOCKED (type) | N/A |
|---|---|---|---|---|---|---|
| **Organization Setup** | §3 (SETUP, workflow only) | `REQ-SETUP-001/002` (2) — no org-config reqs | 0 authored | 0 | n/a — **Browser-only, no API contract (proven)** | 0 |
| **Pay Schedule** | §4 | `REQ-CYCLE-*` (15) | 20 | 11 | 9 (Contract/Infra — non-monthly, effective-date) | 0 |
| **Tax & Statutory** | §10,§11,§17,§24 | `REQ-TAX/PAYE/STAX/RELF/PROT-*` (51) | 79 | 40 | 39 (Contract 35, Browser 3, Creds 1) | 0 |
| **Employee Setup** | §13 | `REQ-EMP-*` (21) | 34 | 18 | 13 (Browser 11, Contract 1, Infra 1) | 3 |
| **Bank Setup** | §6 | `REQ-BANK-*` (11) | 16 | 12 | 4 (Browser 3, Creds 1) | 0 |
| **Earnings/Benefits/Deductions** | §7,§8 | `REQ-CAT/BIK-*` (23) | 45 | 30 | 15 (Contract 9, Infra 5, Creds 1) | 0 |
| **Pay Groups** | §5 | `REQ-PG-*` (6) | 12 | 3 | 9 (Contract — member assignment not exposed) | 0 |
| **Users & Roles** | §2 | `REQ-AUTH/SEC-*` (21) | 37 | 9 | 24 (Creds 11, Browser 11, Contract 2) | 4 |
| **Approval Setup** | §16 | `REQ-LIFE-*` (9) | 20 | 12 | 8 (Contract 7, Browser 1) | 0 |
| **TOTAL (in scope)** | | **150 reqs** | **263 TCs** | **135** | **121** | **7** |

## Requirement-coverage notes (verified business rules)

- **Pay Schedule:** monthly calendar generation, pay-date offset, cutoff, current-period default, calendar advancement — **verified**. Non-monthly frequencies (`/pay-schedules` contract exists) — **effective-date-constrained**.
- **Tax & Statutory:** PAYE bands (94% PASS), Tier 1/2, bonus over-cap, resolver/eligibility, dated-rate endpoint, missing-engine hard block — **verified**. Config-write (override/preset/exemption), reliefs assignment, protected-pay — **Missing API Contract**.
- **Employee:** create flow, required-field validation, comp resolution, incomplete/exclude/hard-block isolation, HRIS sync — **verified**. Import/UI/daily-hourly — **Browser/Contract**.
- **Bank:** bank+branch CRUD, duplicate-sort-code 422, delete guards, seed integrity — **verified**. Seeded-bank edit silently ignored — **BUG-008**.
- **EBD:** fixed/%-basic/%-cash-emoluments benefits, BIK base/cap/cap-warning/exclusion, deduction treatments, eligibility scope, inactive-skip, non-taxable exclusion — **verified**. %-net deductions, qualifying-income base, thresholds, dept/country scope, windows — **Contract/Infra**.
- **Pay Groups:** group create/edit/**delete** — **verified**. Member assignment, group-level items, layered resolution — **Missing API Contract (silent no-op proven)**.
- **Users & Roles:** admin full-access, admin API CRUD matrix, injection/isolation handling, **roles & permission matrix exist & auditable (re-discovered)** — **verified at config level**. Role/permission **enforcement** from Manager/Staff sessions, login/session/menu-gating — **Credentials/Browser**.
- **Approval:** full lifecycle to PAID, submit→approve→mark-paid, mark-paid side-effects, illegal-transition blocks, **approval-workflow config exposed** (`/approval-workflows`) — **verified**. Reject/return/escalation editing — **Contract/Browser**.

## Defect linkage

No standing FAIL among Settings cases. Documented register defects mapping to Settings modules: BUG-002/003/004/005 (Tax & Statutory config), BUG-006 (Pay Groups no-group fallback / Regular run), BUG-007 (Approval — approved-run cancel), BUG-008 (Bank — seeded edit), BUG-010 (Employee payment_method casing).
