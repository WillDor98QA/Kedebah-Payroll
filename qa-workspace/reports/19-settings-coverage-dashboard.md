# 19 — Settings Coverage Dashboard

> 2026-06-30 · computed from the execution ledger. In-scope Settings cases: **263** across 9 modules (Finance Posting excluded). Every case terminal.

## Settings headline

| Metric | Value |
|---|---|
| In-scope Settings test cases | 263 |
| **Verified PASS** | **135** |
| FAIL | **0** |
| Terminal BLOCKED | 121 |
| N/A | 7 |
| Settings PASS % (of testable = total − N/A) | 135 / 256 = **52.7%** |
| Internally-controllable backlog remaining | **0** (all terminal) |

*(Programme-wide ledger: 234 PASS · 0 FAIL · 175 BLOCKED · 8 N/A = 417.)*

## Per-module coverage

| Module | Total | PASS | PASS % | BLOCKED breakdown | Status |
|---|---|---|---|---|---|
| Bank Setup | 16 | 12 | 75% | Browser 3, Creds 1 | 🟡 Mostly |
| Earnings/Benefits/Deductions | 45 | 30 | 67% | Contract 9, Infra 5, Creds 1 | 🟠→🟡 |
| Approval Setup | 20 | 12 | 60% | Contract 7, Browser 1 | 🟠 Partial |
| Pay Schedule | 20 | 11 | 55% | Contract/Infra 9 | 🟠 Partial |
| Employee Setup | 34 | 18 | 53%* | Browser 11, Contract 1, Infra 1 (N/A 3) | 🟠 Partial |
| Tax & Statutory | 79 | 40 | 51% | Contract 35, Browser 3, Creds 1 | 🟠 Partial |
| Pay Groups | 12 | 3 | 25% | Contract 9 (member assignment) | 🔴 Lightly |
| Users & Roles | 37 | 9 | 24%* | Creds 11, Browser 11, Contract 2 (N/A 4) | 🔴 Lightly |
| Organization Setup | 0 | 0 | n/a | Browser-only, no API | ⚫ Not API-testable |

\* of testable (excl. N/A).

## Blocker taxonomy (Settings, 121 BLOCKED)

| Category | Count | Resolvable by |
|---|---|---|
| Missing API Contract | ~63 | Development (expose contracts) — incl. pay-group membership, reliefs/exemption/override/preset, %-net deductions, overtime/pension |
| Browser-only | ~30 | A browser-driven Playwright suite (login is SPA/Sanctum) |
| Missing Credentials | ~14 | Provision Manager/Staff/HR/Auditor accounts |
| Infrastructure | ~7 | Multi-dept/country tenant; non-monthly schedule effective-date window; regular-run harness |
| Organization (no API) | n/a | Browser automation |

## Automation coverage

- 1:1 catalogue ↔ permanent spec, **0 missing spec files**.
- New permanent automation this phase: Pay-group CRUD + membership probe, non-monthly schedule probe, hardened BANK-001 / BEN-009 assertions — all in `helpers/tc-registry.ts`.
- Reusable fixtures (`mkRun`, `runRegularToPaid`, personas) unchanged and reused.

## Accessibility / Performance / Browser observations

**NOT VERIFIED** — no browser-layer automation exists; accessibility, responsive, console-error, and performance checks across every Settings module remain unverified (Browser-only). This is the single largest coverage frontier.
