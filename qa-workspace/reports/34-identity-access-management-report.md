# 34 — Identity & Access Management (IAM) Programme

> Phase 3 IAM · 2026-06-30 · everything verified **live** (no reliance on prior reports). Evidence: `scratchpad/iam.mjs`, `evidence/browser/iam/*.png`, `evidence/browser/users-roles/*.png`, ledger `TC-URB-00X`, findings `BR-014…017`. Sandbox `payroll.kedebah.com`, Payroll Admin, tenant William & Co.

## 0. Headline (the live truth)

- **User creation NOW WORKS** — the subscription is **active** again (it was server-gated minutes earlier; renewed since). Created the 4 requested users with their real emails: **Payroll Manager (#4)**, **Employee (#5)**, **Reports (#6)**, **Admin (#7)** — all `status=active`.
- **Role assignment WORKS** — `POST /roles/{id}/assign-users {user_ids}` attaches a role; verified each user now holds its role.
- **Login-as-each is BLOCKED** — the admin **cannot set a usable password**: `POST /users` accepts `password` but **silently ignores it** (`POST /login` → 422 *"Invalid password"*, identical to a wrong password). Browser login as the new Manager stays on the login page. The 4 users must **self-activate via their email** (`dwetornam+N@gmail.com`, inboxes I don't control) → **per-role session/permission-enforcement testing cannot be executed.**

## 1. Identity & Access Test Report (summary)

| Capability | Result | Evidence |
|---|---|---|
| Create User | ✅ works (4 created) | `iam.mjs`; HTTP 200 id 705/706/707/708 |
| Set password at create | ❌ silent no-op (login "Invalid password") | `BR-016` |
| Assign role at create (`role_ids`) | ❌ silent no-op (roles=[]) | `BR-017` |
| Assign role (dedicated) | ✅ `POST /roles/{id}/assign-users` | verified roles on users |
| Create / Edit / Delete Role | ✅ 201 / 200 / 204 | bug-verify + IAM probes |
| Assign permissions **to** a role | ❌ silent no-op (`permissions_count` stays 0) | BUG re-verify |
| Login as created user | ❌ blocked (no admin-set password) | `evidence/browser/iam/2-after-login.png` |
| Verify per-role permissions (enforcement) | ⛔ cannot run (no user session) | — |

## 2. Role × Permission Matrix (from live config)

| Permission (code) | Admin (39) | Manager (17) | Reports (4) | Employee (3) |
|---|:--:|:--:|:--:|:--:|
| module-payroll-access | ✅ | ✅ | ✅ | ✅ |
| payroll-view-dashboard | ✅ | ✅ | ✅ | ✅ |
| payroll-view-reports | ✅ | ✅ | ✅ | ✅ |
| payroll-export-reports | ✅ | ✅ | ✅ | — |
| payroll-view-employees | ✅ | ✅ | — | — |
| payroll-create/edit-employees | ✅ | ✅ | — | — |
| payroll-delete-employees | ✅ | — | — | — |
| payroll-view/create/edit-payruns | ✅ | ✅ | — | — |
| payroll-approve/process-payruns | ✅ | ✅ | — | — |
| payroll-view-paygroups/banks/earnings/deductions/taxes | ✅ | ✅ (view) | — | — |
| create/edit/delete paygroups/banks/earnings/deductions | ✅ | — | — | — |
| payroll-update-tax-status | ✅ | — | — | — |
| payroll-view/manage-settings | ✅ | — | — | — |
| payroll-view/manage-users · view/create/edit/delete-roles | ✅ | — | — | — |

**Reading:** clean least-privilege gradient — **Admin** = full CRUD + settings/users/roles; **Manager** = operational (view+create+edit+approve+process, **no delete**, no settings/users/roles); **Reports** = dashboard + view/export reports; **Employee** = dashboard + view reports only. *(This is the configured intent; backend enforcement is unverified — see §5.)*

## 3. User Lifecycle Report

- **Create:** ✅ now works (subscription active). Real users #4–#7 created with emails/phones provided.
- **Password (admin-set):** ❌ ignored → **BR-016** (Major). Users can't be logged into without self-activation.
- **Role at create (`role_ids`):** ❌ ignored → **BR-017** (Minor).
- **Read/Search/Filter/Columns/Export/Pagination:** present in the UI (`/settings/users`) — table with 7 users, Filters/Columns/Refresh/Export/Search, "Rows per page", paging (evidence `users-roles/1-landing.png`).
- **Edit / Deactivate / Delete:** per-row icons exist in the UI (view/edit/delete); the canonical API write routes I probed are read-only (405) so the UI uses other internal endpoints — **not exercised on the 3 real pre-existing accounts** (won't mutate real users).

## 4. Role Lifecycle Report

- **Create / Edit / Delete role:** ✅ (201/200/204), verified on disposable `AIQA_*` roles, cleaned up.
- **Assign users to role:** ✅ `POST /roles/{id}/assign-users {user_ids}` (the UI "Manage Roles → Manage Users → Save" workflow). Verified all 4 users.
- **Assign permissions to role:** ❌ silent no-op via the exposed API (`permissions_count` stays 0); seeded roles carry permissions (configured by another path). 
- **Role counts:** Admin 1 user, others 0 before assignment → 1 each after.

## 5. Permission Verification Report

The **configured** matrix is captured (§2). **Enforcement cannot be verified** — it requires logging in as each role, which is blocked by the password limitation (§0/BR-016). The intended checks (menu visibility, blocked pages, 403 on forbidden API, direct-URL, CRUD gating) are **READY** to run via the harness the moment the users self-activate and set passwords. **No enforcement result is asserted without a real session — nothing inferred.**

## 6. Browser Findings Report

`BR-016` (admin-set password ignored, Major/P1), `BR-017` (role_ids-at-create ignored, Minor/P2), plus the app-shell findings carried from M1: `BR-006` (404 `index.global.min.css` on `/settings/users` too), `BR-007` (axe: button-name critical, color-contrast, link-name, landmark) — the Users page inherits the global shell a11y issues.

## 7. Accessibility Report (Users & Roles)

The Users page (`/settings/users`) inherits the global shell axe violations (button-name critical on icon controls, colour-contrast, link-name, missing `<main>`). Per-dialog a11y (Add-User modal, Manage-Roles) is **pending** — the Add-User modal did not open under automation (uses a non-standard trigger). Recommend a focused axe pass once the modal-open interaction is mapped.

## 8. Security Report

- **Session-based privilege-escalation / role-bypass / forbidden-API / horizontal-vertical escalation: NOT TESTABLE** this round — no non-admin session can be established (password limitation). Proven blocker, not skipped.
- **Config-level observations:** roles are least-privilege (Employee = 3 perms); a wildcard `*` permission exists (super-grant) — confirm it is admin-only. Two **silent-accept** anti-patterns observed (password-at-create, role_ids-at-create) — accept-and-ignore is a data-integrity/security smell (mirrors BUG-008 seeded-bank edit).
- Auth robustness defect **BUG-009** (invalid/missing token → 500 not 401) remains CONFIRMED and is relevant to IAM.

## 9. Regression Report

| Item | Previous | Current | Root cause |
|---|---|---|---|
| User creation | BLOCKED (subscription inactive) | **PASS** | **Environment** — subscription **renewed** since the prior check (not a code change). Reclassify the prior gate as an environment state, now cleared. |
| Role CRUD | PASS | PASS | unchanged |
| Role assignment | (untested) | **PASS** | endpoint discovered (`/roles/{id}/assign-users`) |
| Admin-set password | (untested) | **FAIL** | create ignores password (BR-016) |

## 10. Executive Summary

The IAM module is **partially verifiable today**. **Users can be created and roles can be assigned** (both proven live, with evidence), and the **configured Role×Permission matrix is sound** (clean least-privilege gradient Admin▸Manager▸Reports▸Employee). **However, the QA cannot complete permission-enforcement testing** because **the admin cannot provision a working password** — created users return *"Invalid password"* at login and must self-activate via email (BR-016). Until that is addressed (honour admin-set passwords, or provide an admin set/reset-password, or QA gets the activation inboxes), the *"login as each role → verify permissions / 403 / direct-URL / privilege escalation"* programme is **blocked at the login step** — proven, not assumed.

**UX review (creating a user without a role):** **Expected design** — the platform creates the user first (`roles=[]`) then assigns roles in a separate Manage-Roles step (all 3 pre-existing users also have "No roles"). It is a **UX risk**, not a bug: a user with no role has no access, with no prompt/warning at create time. *Recommendation:* warn, or require ≥1 role, at user creation.

## Test Data Register
Created (real accounts, **left in place** for the owner to self-activate): `#4 Payroll Manager` (dwetornam@gmail.com), `#5 Employee` (+1), `#6 Reports` (+2), `#7 Admin` (+3) — each with its role assigned, `status=active`, no QA-set password. Disposable `AIQA_*` roles created during probing were deleted. No real user was mutated/deleted.
