# Test Cases — Taxes, Forms & Filings

**Module:** FORM · **PRD:** §20 · **Reqs:** REQ-FORM-001…009

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-FORM-001 | FORM-001 | Liabilities on approve | Processed run | Approve | Liabilities per authority (GRA/SSNIT/NPRA) with due dates generated | P1 | High | API |
| TC-FORM-002 | FORM-001 | Due dates from filing rules | Approved run | Inspect liabilities | GRA 15th, SSNIT/NPRA 14th of following month | P2 | High | API |
| TC-FORM-003 | FORM-002 | **One form per filing period** | Two runs same period bucket (form type+authority+period) | Approve both | Both roll into ONE form (e.g. GRA-PAYE-Apr-2026) | P1 | High | API |
| TC-FORM-004 | FORM-003 | **Attach to Pending form (recompute)** | Bucket has Pending form | Approve second run | Liabilities attached; totals/employee lines recomputed; NO duplicate form | P1 | High | API |
| TC-FORM-005 | FORM-004 | **Locked form → supplementary** | Bucket form already Pending-Approval/Filed | Approve another run | New `-SUPP` form + `is_supplementary` flag; original untouched | P1 | Critical | API |
| TC-FORM-006 | FORM-004 | Filed form not mutated | Filed form exists | Approve run same bucket | Filed form unchanged; SUPP created | P1 | Critical | API |
| TC-FORM-007 | FORM-005 | Files modal 3 outputs enablement | Approved run | Open Files | GRA PAYE (form exists), SSNIT Tier1 (form exists), Bank file (Approved/Paid) — correct enablement | P1 | High | Yes |
| TC-FORM-008 | FORM-006 | Muted unavailable note | Not-yet-approved run | Open Files | "Generated automatically once approved" note shown | P3 | Low | Yes |
| TC-FORM-009 | FORM-007 | Forms own approval flow | Generated form | Move through form approval | Form approval enforced before submission | P2 | Medium | Yes |
| TC-FORM-010 | FORM-008 | Filing status tracking | Forms exist | Open Taxes & Forms | pending/submitted/overdue tracked | P2 | Medium | Yes |
| TC-FORM-011 | FORM-009 | GRA PAYE export integrity + speed | Large tax form | Export GRA PAYE Schedule | Generates near-instant; output structurally correct (byte-identical to prior method) | P2 | Medium | API |
| TC-FORM-012 | FORM-001 | Liability amounts re-derived | Approved run | Compare liabilities to oracle | Per-authority totals == sum of employee statutory (oracle) | P1 | High | API |

## Notes
- TC-FORM-005/006 = invariant #7 (filed forms never silently mutated). Highest compliance risk.
- TC-FORM-003/004: design the scenario with a regular + bonus run paid the same month (PRD example).
