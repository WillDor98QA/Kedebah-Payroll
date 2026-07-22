# Test Cases — Bank Setup (configuration prerequisite)

**Module:** BANK · **PRD:** §6 · **Reqs:** REQ-BANK-001…011
Filed under Payroll (configuration). Backs employee bank-transfer details + the bank payment file (§19).

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-BANK-001 | BANK-001 | Seed counts | Ghana seed | Open Bank Setup; count banks/branches | 27 banks, 1,370+ branches present | P2 | Medium | API |
| TC-BANK-002 | BANK-001 | Seed sort codes | Seed | Inspect sample branches | Each branch has real 6-digit sort code | P2 | Medium | API |
| TC-BANK-003 | BANK-002 | **Seeded identity not editable** | Seeded bank | Attempt edit name/sort code (UI + API) | Blocked both layers | P1 | High | API |
| TC-BANK-004 | BANK-002 | **Seeded record not deletable** | Seeded bank/branch | Attempt delete (UI + API) | Blocked both layers | P1 | High | API |
| TC-BANK-005 | BANK-003 | Seeded status toggle | Seeded branch | Set Inactive | Status changes; branch removed from new selections | P2 | Medium | Yes |
| TC-BANK-006 | BANK-004 | Add new bank | Admin | Create bank (name/short/institution code) | Saved, fully editable | P2 | Medium | Yes |
| TC-BANK-007 | BANK-004 | Add new branch | Bank exists | Create branch (sort code/name) | Saved | P2 | Medium | Yes |
| TC-BANK-008 | BANK-005 | **Bank name unique** | Existing bank | Create duplicate name | Rejected (unique) | P2 | Medium | Yes |
| TC-BANK-009 | BANK-006 | **Branch sort code unique** | Existing sort code | Create duplicate sort code | Rejected (unique) | P2 | High | Yes |
| TC-BANK-010 | BANK-007 | Edit non-seeded | New bank/branch | Edit identity fields | Allowed | P3 | Low | Yes |
| TC-BANK-011 | BANK-008 | **Delete-bank guard** | Bank with branches | Delete bank | Blocked (has branches) | P2 | Medium | Yes |
| TC-BANK-012 | BANK-009 | **Delete-branch guard** | Branch linked to employee | Delete branch | Blocked (linked to employee) | P2 | High | Yes |
| TC-BANK-013 | BANK-007 | Delete unlinked non-seeded branch | New, unlinked branch | Delete | Succeeds | P3 | Low | Yes |
| TC-BANK-014 | BANK-010 | **No free-text bank anywhere** | Employee payment form | Inspect bank-transfer entry | Cascading Bank→Branch picker only; no free-text field | P1 | High | Yes |
| TC-BANK-015 | BANK-011 | **Manager view-only Banks (API)** | Payroll Manager | Direct API create/edit/delete bank | 403 | P1 | High | API |
| TC-BANK-016 | BANK-003 | Inactive bank excluded from picker | Bank set Inactive | Add employee → bank picker | Inactive bank not selectable | P2 | Medium | Yes |
