# Test Cases — Payslips

**Module:** SLIP · **PRD:** §21, §23 · **Reqs:** REQ-SLIP-001…010
PDF assertions parse the generated file (see `automation/utils/pdf-helpers`).

## Admin payslip path

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-SLIP-001 | SLIP-001 | Download gated on Paid+Paid | Paid run, employee payment Paid | Open employee row | Download Payslip available | P1 | High | Yes |
| TC-SLIP-002 | SLIP-001 | Not available before Paid | Approved (not paid) run | Open employee row | Download Payslip NOT shown | P1 | High | Yes |
| TC-SLIP-003 | SLIP-001 | Not available if employee not paid | Paid run, employee status not Paid | Open row | Download not shown for that employee | P2 | Medium | Yes |
| TC-SLIP-004 | SLIP-002 | Snapshot-based (no recompute) | Paid employee | Download; compare to stored snapshot | PDF values == snapshot exactly | P1 | High | API |
| TC-SLIP-005 | SLIP-003 | PDF identity/header | Paid employee | Inspect PDF | Org header/logo, period, pay date, ref, name/code/dept/position/TIN present | P2 | Medium | API |
| TC-SLIP-006 | SLIP-004 | PDF payment details masked | Paid employee | Inspect PDF | Method, bank/branch or network, masked account/wallet | P2 | Medium | API |
| TC-SLIP-007 | SLIP-005 | **PDF earnings exclude BIK** | Employee with BIK | Inspect Earnings section | Cash earnings + cash benefits only; BIK absent | P1 | High | API |
| TC-SLIP-008 | SLIP-006 | Two deduction groups | Employee w/ statutory + other deductions | Inspect PDF | Statutory Deductions + Other Deductions shown separately | P2 | Medium | API |
| TC-SLIP-009 | SLIP-007 | **Same-name combine (loans)** | Employee w/ 2 employer loans | Inspect PDF | Single summed "Employer Loan Repayment" line; audit unaffected | P2 | Medium | API |
| TC-SLIP-010 | SLIP-008 | PDF totals + words | Paid employee | Inspect PDF | Gross, total deductions, net pay, net-in-words all correct | P1 | High | API |

## Self-service API (scoped)

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-SLIP-011 | SLIP-009 | List own payslips | Staff logged in | GET `/my/payslips` | Only own payslips listed | P1 | High | API |
| TC-SLIP-012 | SLIP-009 | Current payslip | Staff | GET `/my/payslips/current` | Current period payslip returned | P1 | High | API |
| TC-SLIP-013 | SLIP-009 | Download one + all | Staff | Download single + bulk | PDFs returned, scoped to self | P1 | High | API |
| TC-SLIP-014 | SLIP-009 | No admin perm needed | Staff (no admin perms) | Call self-service API | Allowed | P1 | High | API |
| TC-SLIP-015 | SLIP-009 | **Cross-employee blocked (IDOR)** | Staff A | Request Staff B's payslip id | Denied (cross-ref SEC-014) | P1 | Critical | API |
| TC-SLIP-016 | SLIP-010 | **Gap: this-app My Payslips placeholder** | This app router | Open Self-Service → My Payslips | Unused placeholder (real UI in kedebah_v2_pim) — matches §23/§25 | P3 | Low | Yes |

## Notes
- TC-SLIP-007 = invariant #6 partner (BIK excluded from payslip earnings). TC-SLIP-015 = invariant #10.
- If PIM portal is in scope (open question #5), add UI cases for Payroll→Payslips (current/history/filters/bulk).
