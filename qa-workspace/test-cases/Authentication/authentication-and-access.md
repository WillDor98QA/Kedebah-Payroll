# Test Cases — Authentication & Access Control

**Module:** AUTH · **PRD:** §2 · **Reqs:** REQ-AUTH-001…011
**Fields:** TC ID · Req · Scenario · Preconditions · Steps · Expected Result · Pri · Sev · Auto(mation candidate)

> Severity scale: Critical / High / Medium / Low. Auto: Yes / No / API (API-level).

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-AUTH-001 | AUTH-001 | Login by **email** | Valid user with email | 1. Open Login 2. Enter email in identifier 3. Enter password 4. Submit | Logged in; redirected to landing; token stored | P1 | Critical | Yes |
| TC-AUTH-002 | AUTH-001 | Login by **username** | Same user has username | 1. Enter alphanumeric username 2. Password 3. Submit | Same user authenticated | P1 | Critical | Yes |
| TC-AUTH-003 | AUTH-001 | Login by **10-digit phone** | Same user has phone | 1. Enter 10-digit number 2. Password 3. Submit | Detected as phone; same user authenticated | P1 | Critical | Yes |
| TC-AUTH-004 | AUTH-001 | Identifier auto-detection boundary | — | Enter 9-digit & 11-digit numbers | Not mis-detected as phone; handled per rule (username/error) | P2 | Medium | Yes |
| TC-AUTH-005 | AUTH-002 | Token + permissions persisted | Valid creds | Login → inspect cookies/localStorage | Access token + permission set present | P1 | High | API |
| TC-AUTH-006 | AUTH-002 | Protected route after login | Logged in | Navigate to a permitted route | Route renders, no redirect to login | P1 | High | Yes |
| TC-AUTH-007 | AUTH-003 | Redirect-after-expiry | Session expired mid-nav with `?redirect=` | 1. Hit protected URL while expired 2. Re-login | Returned to originally requested page | P2 | Medium | Yes |
| TC-AUTH-008 | AUTH-004 | Logout clears session | Logged in | Click Logout | Logout endpoint called; session cleared; Login shown | P1 | High | Yes |
| TC-AUTH-009 | AUTH-004 | Post-logout route guard | Just logged out | Navigate back to protected route | Redirected to Login; no stale token use | P1 | High | Yes |
| TC-AUTH-010 | AUTH-005 | Wrong password | Valid identifier | Enter correct identifier + wrong password | Rejected; error message; no token | P1 | High | Yes |
| TC-AUTH-011 | AUTH-005 | Unknown identifier | — | Enter non-existent identifier | Rejected; generic error (no user-enumeration leak) | P1 | High | Yes |
| TC-AUTH-012 | AUTH-005 | Empty fields validation | — | Submit with empty identifier / password | Inline validation; no submission | P2 | Medium | Yes |
| TC-AUTH-013 | AUTH-007 | Admin full access | Payroll Admin | Visit each module; attempt view/create/edit/delete | All actions available on every module | P1 | High | Yes |
| TC-AUTH-014 | AUTH-008 | Manager operational CRUD | Payroll Manager | Create/edit/delete on operational module (e.g. catalog, pay run) | Allowed | P1 | High | Yes |
| TC-AUTH-015 | AUTH-008 | Manager view-only on Banks (UI) | Payroll Manager | Open Bank Setup | View allowed; create/edit/delete controls hidden/disabled | P1 | High | Yes |
| TC-AUTH-016 | AUTH-009 | Menu gating by permission | User missing a module perm | Inspect nav menu | Items for missing-perm modules hidden | P2 | Medium | Yes |
| TC-AUTH-017 | AUTH-010 | **API enforcement** despite hidden UI | Manager (no bank-edit perm) | Call bank-edit API directly (bypass UI) | 403/forbidden — server rejects | P1 | Critical | API |
| TC-AUTH-018 | AUTH-011 | Self-service own record | Staff account | Access My Payslips (self-service) | Reaches own pay info without admin perm | P1 | High | API |
| TC-AUTH-019 | AUTH-011 | Self-service cannot reach admin | Staff account | Navigate to an admin route/API | Denied | P1 | High | API |

## Negative / boundary notes
- Identifier detection edge cases (TC-AUTH-004): `@`-containing but malformed email; alphanumeric that is exactly 10 digits with a letter.
- Error messages must not enumerate valid users (TC-AUTH-011) — security-relevant.
- Concurrent-session / token-refresh behaviour: explore once app available (not specified in PRD — exploratory only).
