# 32 — Users & Roles: Admin Capability Proof (evidence-based)

> 2026-06-30 · Discovery-driven proof (no assumptions). Question: *Can an Administrator create, manage and test user roles?* Evidence: captured API responses + UI screenshots (`evidence/browser/users-roles/`). Sandbox `payroll.kedebah.com`, Payroll Admin, tenant William & Co.

## VERDICT

**User creation is IMPOSSIBLE — proven, due to a genuine environment limitation.** The server hard-blocks it:

> `POST /users` → **HTTP 422** — `{"message":"Your subscription is not active. Renew your subscription in Company Admin before adding users.","errors":[]}`

Reproduced with **every** payload variant (with password, without password, with role, without role). Therefore the requested QA-user lifecycle — create `QA_Manager` / `QA_HR` / `QA_Finance` / `QA_Employee` → assign roles → **log in as each** → verify permissions → delete — **cannot be performed**: no user can be created, so none can be logged in as. *(This is the directive's outcome #2: impossible due to a genuine product/environment limitation, proven with evidence.)*

## Capability matrix (each requested capability, with evidence)

| Capability | Mechanism probed | Result | Evidence |
|---|---|---|---|
| **Create User** | `POST /users` | ❌ **422 subscription gate** | API message (above); UI "Add User" present but gated |
| **Invite User** | `/users/invite`, `/user-invitations` | ❌ no working POST (`/users/invite` GET→500; `/user-invitations` GET→empty) | API |
| **Edit User** | `PUT /users/{id}` | ❌ 405 on the canonical route (UI has an edit icon via a different internal endpoint, not exercised) | API 405 |
| **Delete User** | `DELETE /users/{id}` | ⚠️ route exists (404 for missing id) — **not exercised** (will not delete the 3 real users) | API |
| **Activate User** | `/users/{id}/activate` | ❌ 405 (GET/HEAD only on probed route) | API |
| **Deactivate User** | `/users/{id}/deactivate` | ❌ 405 (probed route) | API |
| **Reset Password** | `/users/{id}/reset-password` | ❌ 405 (probed route) | API |
| **Assign Role (user)** | `POST\|PUT /users/{id}/roles` | ❌ 405 (GET/HEAD only) — and no user to assign to | API |
| **Remove Role (user)** | same | ❌ 405 | API |
| **Create Role** | `POST /roles` | ✅ **201** (verified on `AIQA_*`, cleaned up) — *not* subscription-gated | API |
| **Edit Role** | `PUT /roles/{id}` | ✅ **200** | API |
| **Delete Role** | `DELETE /roles/{id}` | ✅ **204** | API |
| **Assign Permissions (to role)** | `PUT /roles/{id}` / `POST /roles/{id}/permissions` | ❌ **silent no-op** — PUT 200 but `permissions_count` stays 0 (all field variants); POST→405 | API |

## What the UI exposes (corroborating screenshot)

`evidence/browser/users-roles/1-landing.png` (`/settings/users`): a full **Users** management page with **Add User**, **Manage Roles**, **Convert Staff** buttons, per-user **view / edit / delete** icons, Filters/Columns/Export, and the 3 existing users (Jon Bull, Kiara Rosales, Manuan Buina) — all **"No roles"**, **Active**. So the management *surface* exists in the Admin UI, but the create path is blocked by the same subscription gate the API enforces.

## What was positively verified

- **Roles can be created, edited and deleted** by the Admin (201/200/204), proven on disposable `AIQA_*` roles and cleaned up.
- The **permission model exists**: roles `Payroll Manager` (17 perms), `Payroll Employee` (3), `Payroll Reports` (4), `Payroll Admin` (39); permissions include `admin-create-users`, `admin-create-roles`, `admin-assign-user-roles`, `admin-assign-role-permissions`.

## What is BLOCKED (with proven reason)

- **All user-creation / user-role testing** — tenant **subscription inactive** (server gate, exact message captured). This is an **environment limitation**, not a QA gap.
- **Role→permission assignment** — silent no-op via the exposed API (separate product limitation; recommend a dev ticket — accept-and-ignore).

## Evidence inventory
- API captures: `scratchpad/users-lifecycle.mjs`, `users2.mjs`, `users3.mjs` console output (status codes + exact messages above).
- UI screenshots: `evidence/browser/users-roles/{1-landing,2-add-user-form,2-add-user-modal,3-after-submit}.png`.
- Ledger: `TC-URB-001` BLOCKED (subscription gate), `TC-URB-002` PASS (role CRUD), `TC-URB-003` BLOCKED (permission no-op); findings `BR-014/BR-015`.
- Console health on `/settings/users`: 1 failed request — the global `index.global.min.css` 404 (BR-006), no JS errors.

## Required action to make this module fully testable
**Renew/activate the sandbox tenant subscription in Company Admin.** Once active, re-run the lifecycle: create `QA_Manager/QA_HR/QA_Finance/QA_Employee` (with admin-set passwords), assign roles, log in as each, verify permission enforcement, capture evidence, then deactivate/delete. The automation harness is ready (`tests/browser/users-roles.browser.spec.ts` + the API lifecycle probe) to execute this end-to-end the moment the subscription gate is lifted.
