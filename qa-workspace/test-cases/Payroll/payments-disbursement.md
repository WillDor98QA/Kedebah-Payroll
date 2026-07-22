# Test Cases — Payments & Disbursement

**Module:** PAYM · **PRD:** §19 · **Reqs:** REQ-PAYM-001…015
Bank file assertions parse the generated `.xlsx` (see `automation/utils/xlsx-helpers`).

## Files action + bank payment file

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-PAYM-001 | PAYM-001 | Files action on Approved (Run Payroll tab) | Approved run | Open Files | Action available | P2 | Medium | Yes |
| TC-PAYM-002 | PAYM-001 | Files action on Paid (History tab) | Paid run | Open Files (Payroll History) | Action available | P2 | Medium | Yes |
| TC-PAYM-003 | PAYM-002 | Bank file structure | Approved run, bank payees | Generate Generic Bank Payment File | Single sheet: metadata block + header + rows + bold TOTAL + "{n} Employee(s)" | P1 | High | API |
| TC-PAYM-004 | PAYM-003 | Bank file columns/order | Generated file | Inspect header | 14 columns in exact order (#, Employee ID, Full Name, Department, Position, Account Number, Bank Name, Bank Sort Code, Bank Branch, Net Pay, Payment Reference, Narration/Remarks, Email, Contact Number) | P1 | High | API |
| TC-PAYM-005 | PAYM-004 | **Sort: bank then employee name** | Multiple banks/employees | Generate | Rows sorted by bank name, then employee name | P1 | High | API |
| TC-PAYM-006 | PAYM-010 | Correct sort code per employee | Employees across branches | Generate | Each row's sort code = employee's selected branch sort code | P1 | High | API |
| TC-PAYM-007 | PAYM-005 | MoMo rows in file | MoMo payees | Generate | Network in Bank Name, wallet in Account Number; sorted into list | P2 | Medium | API |
| TC-PAYM-008 | PAYM-006 | **Cash excluded** | Cash payees present | Generate | No cash employees in file | P1 | High | API |
| TC-PAYM-009 | PAYM-007 | **Missing-details excluded** | Employee missing bank/MoMo details | Generate | Excluded from file | P1 | High | API |
| TC-PAYM-010 | PAYM-002 | TOTAL row correctness | Multiple payees | Generate | Bold TOTAL = sum of Net Pay column | P1 | High | API |
| TC-PAYM-011 | PAYM-009 | Payment Reference dash | Generated file | Inspect | Payment Reference column = "-" (manual) | P3 | Low | API |
| TC-PAYM-012 | PAYM-008 | **Gap: skip reasons not in modal** | Excluded employees | Open Files modal | Skip reasons NOT shown in UI (in API response only) — matches §25 | P3 | Low | Yes |
| TC-PAYM-013 | PAYM-014 | Export recorded in audit | Generate bank file | Inspect run audit | Export logged | P2 | Medium | API |

## Per-run payment actions

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-PAYM-014 | PAYM-011 | Per-employee payment status | Approved/Paid run | Update one employee's status | Status updates | P2 | Medium | Yes |
| TC-PAYM-015 | PAYM-011 | Mark all as paid | Run w/ multiple employees | Mark all paid | All set paid in one action | P2 | Medium | Yes |
| TC-PAYM-016 | PAYM-012 | Proof of payment upload | Paid run | Upload evidence doc | Stored on run for audit | P3 | Low | Yes |
| TC-PAYM-017 | PAYM-013 | Run currency default | New run | Inspect currency | Defaults to org currency | P3 | Low | API |
| TC-PAYM-018 | PAYM-015 | **Gap: Payments submenu previews** | — | Open Batches/Bank Files/Mobile Money/Multi-Currency/Failed | Previews only — matches §25 | P3 | Low | Yes |

## Notes
- TC-PAYM-005/006/008/009/010 are disbursement-correctness essentials (finance depends on them).
- Negative: generate file for a run with ALL cash/incomplete employees → empty payable list handled gracefully.
