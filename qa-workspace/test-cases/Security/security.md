# Test Cases — Security (cross-cutting)

**Module:** SEC · **PRD:** §2 + SECURITY TESTING section · **Reqs:** REQ-SEC-001…010
**Principle:** The **API permission check is the security boundary** (PRD §2). Every UI-gating test
has a matching direct-API test.

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-SEC-001 | SEC-001 | API perm matrix — view | Each role | For each protected GET, call with/without `view-*` perm | Permitted→200, else 403 | P1 | Critical | API |
| TC-SEC-002 | SEC-001 | API perm matrix — create/edit/delete | Each role | For each mutating route, call with/without perm | Permitted→2xx, else 403; no data change on 403 | P1 | Critical | API |
| TC-SEC-003 | SEC-002 | Direct-URL access to forbidden page | User lacking perm | Paste deep URL of forbidden module | Blocked/redirected; no data leaked in network | P1 | High | Yes |
| TC-SEC-004 | SEC-003 | Expired token rejected | Token expired | Call API with expired token | 401; redirect to login in UI | P1 | High | API |
| TC-SEC-005 | SEC-003 | Tampered token rejected | Modified JWT/token | Call API with altered token | 401; no access | P1 | High | API |
| TC-SEC-006 | SEC-004 | Manager → bank edit denied (API) | Manager | Direct API edit/delete bank | 403 | P1 | High | API |
| TC-SEC-007 | SEC-004 | Staff → admin API denied | Staff | Call admin payroll API | 403 | P1 | High | API |
| TC-SEC-008 | SEC-005 | SQL injection in inputs | Any form/search | Submit `'; DROP TABLE--`, `' OR 1=1--` in search/name/account fields | Treated as literal; no error leak, no data dump | P1 | High | Yes |
| TC-SEC-009 | SEC-006 | Stored XSS | Editable text field (e.g. bank name, employee name, narration) | Save `<script>alert(1)</script>`; reopen + render in lists/exports | Escaped, not executed anywhere it's displayed | P1 | High | Yes |
| TC-SEC-010 | SEC-006 | Reflected XSS via params | Search/query param | Inject script in URL param | Escaped in response | P1 | High | Yes |
| TC-SEC-011 | SEC-007 | Malformed input | Numeric/date fields | Send strings to numeric, oversized payloads, wrong types via API | Graceful 4xx validation; no 500/crash | P2 | Medium | API |
| TC-SEC-012 | SEC-008 | Duplicate approve | Run pending approval | Double-click/replay Approve | Single approval; no duplicate forms/liabilities | P1 | High | API |
| TC-SEC-013 | SEC-008 | Duplicate mark-paid | Approved run | Replay Mark-Paid | Single payment; loan balances decrement once; calendar advances once | P1 | Critical | API |
| TC-SEC-014 | SEC-009 | IDOR on self-service payslips | Staff A logged in | Call `/my/payslips/{id}` with Staff B's payslip id | Denied; only own records | P1 | Critical | API |
| TC-SEC-015 | SEC-009 | Self-service list scope | Staff A | List payslips | Only Staff A's records returned | P1 | High | API |
| TC-SEC-016 | SEC-010 | Sensitive masking default | Employee w/ bank+MoMo | View payment details | Account/MoMo masked (last 4); reveal via eye only | P2 | Medium | Yes |
| TC-SEC-017 | SEC-008 | Idempotent bank-file export | Approved run | Generate bank file twice | Two identical files; each recorded in audit; no double payment effect | P3 | Medium | API |
| TC-SEC-018 | SEC-001 | Privilege escalation attempt | Manager | Attempt to assign self admin role / call role API | Denied | P1 | Critical | API |

## Exploratory security charters
- CSRF protection on state-changing endpoints (not specified in PRD — verify defensive posture).
- Rate-limiting / brute-force on login (TC-AUTH-010/011 repeated).
- Mass-assignment: send extra fields (e.g. `is_supplementary`, `status`) on create/update APIs.
- File-upload (proof of payment, bulk import): type/size validation, path traversal in filenames.
