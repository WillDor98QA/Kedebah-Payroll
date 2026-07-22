# Execution Report — Phase 7–9 (Initial Run)

**Date:** 2026-06-25 · **Target:** https://payroll.kedebah.com (sandbox, confirmed by user)
**Business/tenant:** William & Co Enterprises · **Role:** Payroll Admin (only role provided)
**Stack discovered:** Vue SPA + Laravel API (`/api/v1/payrollApi`), token auth + multi-tenant.

---

## 1. Executive summary

The automation foundation is now **wired to the live sandbox and producing real, verified results.**
Authentication, the multi-tenant flow, seed verification, and — most importantly — **PAYE engine
correctness** have been executed against real data and **pass**. One **Low-severity data-hygiene
finding** (BUG-001) was raised and proven *not* to affect tax. Full 25-module wave execution is in
progress; this report covers the foundation + the highest-risk calculation gate.

**Headline:** Live PAYE for every processed employee in the latest paid run matches an independent
oracle **to the cent**. The core money engine is behaving correctly for the cases tested.

---

## 2. What was executed (real results)

| Area | Test(s) | Result | Evidence |
|------|---------|--------|----------|
| Calc oracle self-check (no app) | 27 specs / **135 assertions** | ✅ Pass | `npm run test:oracle` |
| Admin authentication | `auth.setup.ts` (login → select business) | ✅ Pass | `fixtures/.auth/admin.json`, recon screenshots |
| Manager / Staff auth | setup | ⏭️ **Blocked** (no creds, by decision) | — |
| Seed verification (TC-TAX-001…003) | live `seed-and-paye.live.spec.ts` | ✅ Pass | `evidence/network/statutory-items.json` |
| **PAYE engine == oracle** (TC-PAYE/TC-CAL) | live, run #80, all processed employees | ✅ **Pass (to the cent)** | `evidence/network/run-80-employees-full.json` |

Commands:
```
npm run test:oracle                                  # 135 assertions, no app
npx playwright test --project=setup                  # admin auth (mgr/staff skipped)
npx playwright test tests/payroll/seed-and-paye.live.spec.ts --project=chromium
```

---

## 3. Findings

### BUG-001 (Low) — PAYE band `min_income` serialized as zero-width in `/statutory-items`
Bands 3 & 4 return `min_income == max_income`. **Verified not to affect computed tax** — the engine's
`paye_band_trace` uses correct boundaries and matches the oracle exactly. Config/seed hygiene only.
Full detail + evidence in `bugs/BUG-001.md`.

### Discrepancies vs PRD (observations, not defects)
| # | Observation | Vs PRD | Disposition |
|---|-------------|--------|-------------|
| O-1 | **Multi-tenant "Select Business" step** after login; permissions are **per business** (admin is *forbidden* on "Great World", OK on "William & Co"). | Not documented in §2/§13. | Documentation gap — recommend adding to PRD. Handled in automation (`select-business.page.ts`). |
| O-2 | Auth = **Bearer token (in `accessToken` cookie) + `X-Tenant-Id` header**. | §2 says "access token + permissions in cookies + localStorage". Token is in cookies (consistent); permissions/userData also in cookies; no localStorage token. | Minor wording nuance; not a defect. |
| O-3 | Live seed has **9** statutory items — the 8 documented + an extra **"WHT Tax - Board"** (flat_rate on gross_pay). | §24 lists 8. | Additive config; allowed. Note only. |
| O-4 | Calling data endpoints without `Authorization`/`X-Tenant-Id` returns **HTTP 500** (not 401/403). | — | Candidate API-robustness note; needs a dedicated unauth test to confirm contract (deferred). |

---

## 4. Coverage status (this run)

| Wave | Modules | Status |
|------|---------|--------|
| 0 Smoke | Auth (admin), reachability, seed | ✅ Executed (pass) |
| 3 Calc (partial) | PAYE vs oracle on live data | ✅ Executed (pass) |
| 1,2,4–8 | Config, Employees, full Calc, Lifecycle, Outputs, Compliance/Security, Gaps, Non-functional | ⏳ Pending wiring (see §5) |
| Role/permission/self-service (~58 TCs) | AUTH/SEC/SLIP manager+staff | ⏭️ Blocked (no Manager/Staff creds) |

417 test cases authored; this run executed the foundation + the top calculation gate. The remaining
modules are **ready to wire** now that auth + the API client + the real endpoint map are established.

---

## 5. Honest scope statement & next steps

This is a real, production-grade multi-tenant app. With the auth model solved and the endpoint map
captured, each remaining module still needs its specific endpoints + payload schemas wired (CRUD
bodies, run create/process/approve/mark-paid flows, export parsers pointed at real files). That is
the bulk of Phases 7–9 and proceeds module-by-module per the Test Plan waves. Concretely next:

1. **Expand calc coverage** — pull more processed runs/employees and assert the full breakdown
   (Tier 1/2, reliefs, BIK, bonus, net, employer cost) vs oracle, not just PAYE. (High value, low risk — read-only.)
2. **Config CRUD waves** (Banks, Catalog, Pay Groups) against `/banks`, `/deductions`, `/pay-groups`.
3. **Lifecycle wave** — create→process→approve→mark-paid on a throwaway run (sandbox-safe), asserting
   calendar advance, loan decrement, form generation, invariants.
4. **Add Manager + Staff credentials** to unblock the ~58 permission/security/self-service cases.
5. **Confirm O-4** (500 vs 401) with a dedicated unauthenticated request test.

No results, screenshots, traces, or defects in this report are fabricated. Skipped items are marked
Blocked, not passed.
