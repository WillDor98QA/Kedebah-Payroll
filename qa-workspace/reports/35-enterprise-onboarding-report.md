# 35 — Enterprise Onboarding Programme (live, evidence-based)

> 2026-06-30. The product evolved: the authoritative entry point is now the **Kedebah Enterprise portal** (`sbxkedebah-v2.npontu.com`). This report maps and verifies the full onboarding journey end-to-end and locates the exact blocker. Everything below is **observed live**. (Supersedes the interim SSO-blocker note; corrections flagged.)

## 0. Headline

The new end-to-end journey is **Enterprise Login → Auth → (forced) Password Change → Business Selection → Enterprise Module Launcher → Payroll**. I drove it live as **Payroll Admin** and verified **stages 1–5 PASS**. The journey then **stops at the Module Launcher**: it shows **"No modules found"** — there is **no Payroll module tile to launch** for the role account, so Payroll itself is never reached. **The blocker is module provisioning, not credentials and not SSO.**

## 1. Verified onboarding stages (live)

| # | Stage | URL | Result | Evidence |
|---|---|---|---|---|
| 1 | Central Enterprise Login | `sbxkedebah-v2.npontu.com/clients/sign-in` (Email/Username + Password + "Sign In", "Welcome back") | ✅ **PASS** | `enterprise/0-signin-page.png`, `A-after-login.png` |
| 2 | Authentication | — | ✅ **PASS** — temp password accepted | `A-after-login.png` |
| 3 | Forced Password Change | `/clients/change-password-required` (current + new + confirm) | ✅ **PASS** — committed | `B-change-password.png` |
| 4 | Business Selection | `/R-2171-WRY/clients/select-module` (Current Business = William & Co Enterprises; switch-business dropdown) | ✅ **PASS** | `D-module-launcher.png` |
| 5 | Enterprise Module Launcher | same | ✅ reached, ❌ **empty** | `D-module-launcher.png` |
| 6 | Payroll Module Launch | → `payroll.kedebah.com` | ⛔ **BLOCKED** — no module tile | `D-module-launcher.png` |
| 7–8 | Payroll App / Workflows | — | ⛔ not reachable for this account | — |

Ledger: `TC-ENT-001..003` PASS, `TC-ENT-004/005` BLOCKED (BR-020).

## 2. The blocker (BR-020 · Critical)

The Enterprise Module Launcher renders **"No modules found for ''"** (empty Enterprise Modules list) for **Payroll Admin** on **William & Co Enterprises**, even in a clean state. **Provisioning a user in Payroll (via the Payroll API) does not grant that user the Payroll _module_ at the enterprise/identity level.** New role users are therefore stranded at the launcher and cannot enter Payroll at all — which also blocks the per-role enforcement audit (it needs a Payroll session).

**Root cause:** enterprise module access is provisioned separately from the Payroll role. **Fix:** grant the Payroll module to the four role accounts in the enterprise portal (or auto-provision the module when a payroll user is created). Once any role account has the Payroll module, the existing harness completes the enforcement audit immediately (see §5).

## 3. ⚠️ Final password register (all four onboarded)

All four accounts are now onboarded; these are the **current** passwords (see §3b for the per-stage results):

| Role | Email | Current password | How it got here |
|---|---|---|---|
| **Admin** | dwetornam+3@gmail.com | **`QaPhase4_admin_9X!`** | Forced change committed (temp `gQRlmF8cgA` consumed). |
| **Employee** | dwetornam+1@gmail.com | **`QaPhase4_employee_9X!`** | Forced change committed (temp `iM25NapSO5` consumed). |
| **Manager** | dwetornam@gmail.com | **`Payroll2026#e`** | Owner email-reset → `password#23e` (itself must-change) → set `Payroll2026#e`. |
| **Reports** | dwetornam+2@gmail.com | **`password#23e`** | Owner email-reset (Forgot Password). |

The onboarding spec is **idempotent** (tries final → reset → temp passwords in turn).

## 3b. All four roles onboarded — verified results

| Role | Email | Onboarded / password | Launcher reached | Modules present? |
|---|---|---|:--:|:--:|
| **Admin** | dwetornam+3@gmail.com | ✅ now `QaPhase4_admin_9X!` | ✅ | ❌ **No modules found** |
| **Employee** | dwetornam+1@gmail.com | ✅ now `QaPhase4_employee_9X!` | ✅ | ❌ **No modules found** |
| **Manager** | dwetornam@gmail.com | ✅ reset → `password#23e` (was must-change) → now **`Payroll2026#e`** | ✅ | ❌ **No modules found** |
| **Reports** | dwetornam+2@gmail.com | ✅ reset → `password#23e` | ✅ | ❌ **No modules found** |

**Confirmed across ALL FOUR roles:** every role account — Admin, Manager, Reports, Employee — authenticates, onboards, and reaches the Enterprise Module Launcher, and **every one shows "No modules found."** BUG-011 is **systemic and total**: no role account has any module access, so none can enter Payroll. Password reset (`/clients/forgot-password`, email-based) works; Manager's reset password was itself flagged must-change and was set to `Payroll2026#e`.

**Final password register:** Admin `QaPhase4_admin_9X!` · Employee `QaPhase4_employee_9X!` · Manager `Payroll2026#e` · Reports `password#23e`.

## 4. Framework changes (extends, deletes nothing)

- **New entry point:** `tests/browser/enterprise-onboarding.browser.spec.ts` — discovery + full E2E driver (login → change-password → business → launcher → Payroll), with stage-by-stage evidence and resilient locators. Exports `ENTERPRISE_URL` + `ROLE_CREDS` for reuse.
- **All existing Payroll automation is preserved** (API specs, browser Settings/IAM specs, ledger, reports). Nothing removed.
- **Login contract documented:** enterprise login = text "Email/Username" + password + "Sign In"; forced change = 3 password fields on `/clients/change-password-required`; launcher = `/R-<code>/clients/select-module`.

## 5. Ready to complete on unblock

The role-enforcement harness (`tests/browser/role-enforcement.browser.spec.ts`: menu capture + backend authorization probes with 403=denied / 422=authz-passed + privilege-escalation findings) is **built and ready**. The moment the **Payroll module is provisioned** for a role account, the enforcement audit + the 26 credential-dependent cases execute end-to-end. The **configured** Role×Permission matrix (`reports/34` §2) stands; **observed** enforcement remains pending only this provisioning step.

## 6. Findings
- **`BR-020`** (= **[BUG-011](../bugs/BUG-011.md)**, Critical/P0) — Enterprise Module Launcher empty for **all four** role accounts → Payroll module not provisioned → cannot enter Payroll.
- **`BR-018`** (Major/P1) — multi-domain SSO + forced password change; now **characterised and fully navigable** (stages 1–5 PASS), not a blocker.
- **`BR-019`** (Major/P1) — forced first-login / reset passwords are themselves must-change. **Final state:** all four accounts onboarded with established passwords (see §3) — Admin/Employee via forced change, Manager/Reports via owner email-reset.
- Related IAM: **`BR-016`** (= **[BUG-012](../bugs/BUG-012.md)**, admin-set password silently ignored at create), **`BR-017`** (`role_ids` at create ignored).

## Test Data note
All four role-account passwords are now established and documented in §3 (Admin `QaPhase4_admin_9X!`, Employee `QaPhase4_employee_9X!`, Manager `Payroll2026#e`, Reports `password#23e`) — please retain or reset as you prefer. No business data mutated.
