# 50 — Current Defect Register (Official — Confirmed Product Bugs)

> Phase 7 · 2026-07-01 · **Confirmed CURRENT product defects only.** Each satisfies ALL bug criteria: reproducible · evidence exists · observable incorrect behaviour · not framework/environment/credentials/unsupported-API · not merely a recommendation. Superseded/invalid/needs-verification items are excluded (see `reports/51`, `reports/52`). Environment: `payroll.kedebah.com` (SBX) + enterprise portal `sbxkedebah-v2.npontu.com`, tenant William & Co.

**Summary:** 10 confirmed defects — **2 Critical · 2 High · 2 Major · 1 Medium · 3 Low.** Release-blocking: **BUG-011**.

---

## 🔴 CRITICAL

### BUG-011 — Newly-created users have no module access (empty Enterprise Module Launcher)
| | |
|---|---|
| **Module** | Enterprise Onboarding / Users & Roles |
| **Severity / Priority** | Critical / P0 · **Release Blocking: YES** |
| **Requirement / Test Case** | REQ-SETUP-001, IAM · TC-ENT-004/005, TC-ENT-MOD-admin/employee |
| **Evidence** | `evidence/browser/enterprise-{admin,employee,manager,reports}/D-module-launcher.png`; browser finding BR-020 |
| **Steps** | Create a user + assign a role → log in at the enterprise portal → complete forced password change → land on `/R-.../clients/select-module`. |
| **Expected** | The Payroll module tile is visible and launchable for a provisioned payroll user. |
| **Actual** | Enterprise Modules list is empty ("No modules found"). **Confirmed across all 4 roles.** User cannot enter Payroll at all. |
| **Business Impact** | Every newly-created user is unusable — valid account + role but zero module access. Blocks real onboarding AND all per-role enforcement testing. |
| **Root Cause** | Enterprise module entitlement is provisioned separately from the Payroll role; creating a payroll user does not grant the module. |
| **Recommendation** | Auto-provision the Payroll module when a payroll user is created, or expose a grant-module step. |
| **Status** | **Open — reproducible** |

### BUG-014 — App-shell accessibility violations (WCAG) on every authenticated page *(new — from BR-001/002/003/007/010)*
| | |
|---|---|
| **Module** | App Shell (global) / Settings |
| **Severity / Priority** | Critical / P1 · Release Blocking: No (compliance/legal risk) |
| **Requirement / Test Case** | Accessibility (WCAG 2.1 AA) · TC-* browser a11y (axe) |
| **Evidence** | `evidence/browser/*/` axe results; BR-001 (critical), BR-002, BR-003, BR-007, BR-010 |
| **Steps** | Load any authenticated page → run an axe scan / use a screen reader on the top-bar controls. |
| **Expected** | Icon-only controls have accessible names; text meets AA contrast; a single `main` landmark exists; links have names. |
| **Actual** | **Critical:** icon-only top-bar controls have no accessible name (screen-reader users cannot identify them). **Major:** colour-contrast failures; **Minor:** missing `main` landmark; link-name issues. |
| **Business Impact** | Product is not usable by assistive-tech users; WCAG non-compliance is a legal/procurement risk. |
| **Root Cause** | Shared app-shell components lack `aria-label`/labelled controls and a landmark region. |
| **Recommendation** | Add accessible names to icon controls, fix contrast tokens, wrap content in `<main>`. |
| **Status** | **Open — reproducible** (consolidates 5 findings) |

---

## 🟠 HIGH

### BUG-004 — `PUT /statutory-items/{id}/config` rejects the seeded rate values
| | |
|---|---|
| **Module** | Tax (TAX) · **Severity/Priority** High / P2 · Release Blocking: No |
| **Req / TC** | REQ-TAX-001/003 · TC-TAX-004/005 | **Evidence** `bugs/BUG-004.md`, ledger TC-TAX-004 |
| **Steps** | Read a statutory item's seeded config → `PUT` it back unchanged. |
| **Expected** | Round-trip config save accepted. **Actual** Validation rejects the seed's own values → dated rate-version changes not savable. |
| **Business Impact** | Admin cannot update statutory rate versions via the config endpoint. **Root Cause** validation ↔ seed-data inconsistency. |
| **Recommendation** | Align write-validation with the seeded/emitted schema. **Status** Open — reproducible |

### BUG-005 — Statutory item config save uses the wrong HTTP method (frontend)
| | |
|---|---|
| **Module** | Tax (TAX) · **Severity/Priority** High / P1 · Release Blocking: No |
| **Req / TC** | REQ-TAX-001/003 · TC-TAX-005 | **Evidence** `bugs/BUG-005.md` |
| **Steps** | Save a statutory item config from the UI. **Expected** correct method/route. **Actual** save uses `POST` where the contract is `PUT` → save path broken. |
| **Business Impact** | Statutory config cannot be saved through the product UI. **Recommendation** correct the frontend method. **Status** Open — reproducible |

---

## 🟡 MAJOR

### BUG-012 — User-create silently ignores admin-set password (and `role_ids`) *(consolidates BR-016/BR-017)*
| | |
|---|---|
| **Module** | Users & Roles / Auth · **Severity/Priority** Major / P1 · Release Blocking: No (onboarding-impacting) |
| **Req / TC** | IAM, REQ-AUTH-001 · TC-URB-005 | **Evidence** BR-016, BR-017; `evidence/browser/enterprise-*/A-after-login.png` |
| **Steps** | `POST /users` with `password`+`password_confirmation` (and `role_ids`) → log in as the user. |
| **Expected** | Honour the password (and role) or reject with a clear error. **Actual** password and `role_ids` silently dropped (200); login fails "Invalid password"; roles empty. |
| **Business Impact** | Admins cannot provision a working credential; created users are un-loginable without an out-of-band reset. **Root Cause** create endpoint accept-and-ignore. |
| **Recommendation** | Honour `password`/`role_ids`, or 422 + a real set/reset-password endpoint. **Status** Open — reproducible |

### BUG-013 — `404 index.global.min.css` on every authenticated page *(new — consolidates BR-004/006/009/013)*
| | |
|---|---|
| **Module** | App Shell (global) · **Severity/Priority** Major / P2 · Release Blocking: No |
| **Req / TC** | App-shell health · TC-DASH-002 (FAIL) | **Evidence** `evidence/browser/settings/*`; console/network capture; BR-004/006/009/013 |
| **Steps** | Load any authenticated page (dashboard, settings, settings/users, organization) with devtools open. |
| **Expected** | No failed resource requests. **Actual** `index.global.min.css` returns 404 on every authenticated page (console error + failed request). |
| **Business Impact** | Console/network errors on every page; potential missing styles; erodes quality confidence. **Root Cause** missing/misreferenced static asset. |
| **Recommendation** | Fix the asset path / deploy the missing CSS bundle. **Status** Open — reproducible (this is the current FAIL TC-DASH-002) |

---

## 🔵 MEDIUM

### BUG-009 — Auth failure returns HTTP 500 instead of 401 (tampered token)
| | |
|---|---|
| **Module** | Security (SEC) · **Severity/Priority** Medium / P3 · Release Blocking: No |
| **Req / TC** | REQ-SEC-003 · TC-SEC-005 | **Evidence** ledger TC-SEC-005 (latest: "tampered token rejected (500)") |
| **Steps** | Call an API with a **tampered** valid-format bearer token. |
| **Expected** | 401 Unauthorized. **Actual** 500 Internal Server Error (rejection happens, but wrong status). *(Note: a purely malformed/garbage token correctly returns 401 — TC-SEC-004 PASS — so the defect is scoped to the tampered-token path.)* |
| **Business Impact** | Error-handling robustness / minor info-leak; clients can't distinguish auth failure from server error. **Recommendation** return 401 for all auth failures. **Status** Open — reproducible |

---

## ⚪ LOW

### BUG-001 — PAYE statutory-item bands 3 & 4 emit `min_income` inconsistently (data hygiene)
Module Tax · Low/P3 · Not release blocking · TC-TAX-001/TC-PAYE-008 · `bugs/BUG-001.md`. **Actual:** API serialization inconsistency in emitted band data (NOT a calculation defect — PAYE math verified correct). **Recommendation:** normalise emitted band schema. **Status:** Open — reproducible.

### BUG-008 — `PUT /banks/{id}` on a seeded (system) bank returns a misleading success response
Module Bank · Low/P4 · Not release blocking · TC-BANK-002/003 · `bugs/BUG-008.md`. **Actual:** edit of a system bank reports success but is a no-op/misleading. **Recommendation:** return an accurate response (403/422 or reflect no-op). **Status:** Open — reproducible.

### BUG-010 — Employee `payment_method` accepts Title-Case but returns snake_case (round-trip breaks)
Module Employees · Low/P4 · Not release blocking · TC-EMP-019n · `bugs/BUG-010.md`. **Actual:** create/update validates `payment_method` against Title-Case labels but `GET` returns snake_case → read-then-write round-trip is rejected. **Recommendation:** accept/emit one canonical casing. **Status:** Open — reproducible.

---

## Reconciliation
10 confirmed product defects. Existing bug files BUG-001/004/005/008/009/010/011/012 carried forward (BUG-002/003/006/007 moved to `reports/51` — need verification/disposition). Two new defects raised from deduped browser findings: **BUG-013** (404 asset) and **BUG-014** (a11y shell). Browser findings BR-014/015 excluded — **superseded** (user creation now works). No item appears in more than one list.
