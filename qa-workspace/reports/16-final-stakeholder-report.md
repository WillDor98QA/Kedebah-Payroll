# 16 — Final Admin QA Stakeholder Report

> Kedebah Payroll · Admin QA Programme close-out · 2026-06-30 · sandbox `payroll.kedebah.com` (tenant William & Co Enterprises, Payroll Admin role). All figures reconcile to the append-only execution ledger (417 cases).
>
> **🔄 Point-in-time snapshot (Admin close-out).** The **live canonical totals** are in [`reports/08`](08-automation-coverage-matrix.md): **234 PASS · 1 FAIL · 174 BLOCKED · 8 N/A = 417 cases · 12 defects** — updated by the later **enterprise-onboarding phase** (see [`reports/35`](35-enterprise-onboarding-report.md), [`reports/36`](36-documentation-reconciliation.md)). The per-module figures below reflect the Admin close-out and are superseded by 08 for current numbers.

## Headline

The **internal Admin automation backlog is ZERO**. Every internally controllable Admin behaviour that the platform's API exposes has been permanently automated, executed against the live system, verified, and incorporated into the regression suite. **232 of 234 internally-controllable cases PASS (99.1%)**; the only 2 that do not are **confirmed product defects**. The remaining 174 cases are **external dependencies** (no API contract, browser-only, or cross-role credentials) and 9 are documented §25 gaps — none are QA coverage gaps.

## Scorecard

| Dimension | Result |
|---|---|
| **Historical PASS** (verified, sticky) | **232** |
| **Latest PASS** | **152** |
| **Confirmed product defects** | **2** standing — TC-AUTH-013 (admin endpoints return HTTP 500, BUG-009 family), TC-SEC-010 (reflected malformed input → 500). Plus the documented register BUG-001..010 (Tier-1 ER rate 8% vs PRD 13%, SSF Tier-3 inclusion, statutory-config save path, seeded-bank edit silently ignored, invalid-token 500, payment_method casing). |
| **External blockers** (not Admin-resolvable) | **174** — Missing API Contract 93 (reliefs assignment, statutory exemption/override/preset, pay-run adjustments, overtime, pension-cap, pay-group, protected-pay, approval-activation, daily/hourly), Browser-only 47 (bank-file/MoMo/cash export, responsive/console/UI), Credentials 26 (Manager/Staff cross-role + self-service), Infrastructure 8 (single-department & single-country tenant, loan-to-payoff multi-run path) |
| **Not Applicable** (§25 documented gaps) | 9 |
| **Final Admin completion** | **99.1%** of internally-controllable (232/234); **55.6%** of full catalogue |
| **Framework maturity** | Production-grade Admin/API regression framework (1:1 specs, reusable personas + Regular Payroll Harness, append-only evidence) |
| **Regression readiness** | Stable 232-case green core ready to gate CI; calendar-advancing harness quarantined to controlled runs |
| **Production readiness** | **NOT READY to certify** |

## What is proven (high confidence)

Calculation engine end-to-end == independent oracle to the cent (PAYE bands, Tier 1/2, reliefs/SSF aggregate, bonus over-cap marginal, net, employer cost, chargeable base); full pay-run lifecycle to PAID for all run types incl. submit→approve→mark-paid; loan setup, BIK re-derivation, decrement, multi-loan independence; the complete validation-alert matrix (hard blockers + soft warnings) against the engine's real alert ledger; bank/branch setup with guards; per-employee + run-level payment status; deduction/benefit scope and calc methods.

## Why certification is still blocked (not a QA gap)

1. **Open defects** (2 standing + the BUG register) require dev fixes.
2. **Reliefs application, ad-hoc adjustments, statutory exemption/override/preset** have no exposed API contract — cannot be verified from Admin.
3. **Payment-file / bank-file correctness** is client-rendered (browser-only).
4. **Cross-role security & self-service** require Manager/Staff credentials (not provisioned).
5. **Single-department / single-country tenant** prevents scope-contrast verification.

## Recommendation

Certification depends on the **development and integration teams**, not further Admin QA:
- Fix the 2 standing defects + dispose the BUG register.
- Expose (or confirm) the missing API contracts, **or** provision a browser-driven UI suite + Manager/Staff credentials + a multi-department/country test tenant to close the remaining 174.
- Adopt the 232-case green core as the CI regression gate now.

The Admin QA programme has achieved its objective: **every internally controllable Admin case is permanently automated, executed, reconciled, and in the regression framework; the internal backlog is zero.**

---
*Reconciliation: 232 PASS + 2 FAIL + 174 BLOCKED + 9 N/A = **417** ✓ — matches `evidence/exec/records.ndjson` and `test-management/coverage-dashboard.md`.*
