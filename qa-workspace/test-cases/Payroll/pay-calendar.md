# Test Cases — Pay Schedules & Pay Calendar

**Module:** CYCLE · **PRD:** §4 · **Reqs:** REQ-CYCLE-001…015
Filed under Payroll (configuration prerequisite for runs).

## Schedule configuration

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-CYCLE-001 | CYCLE-001 | Each frequency selectable | Admin | Create schedule for Weekly/Bi-Weekly/Semi-Monthly/Monthly/Quarterly | All 5 create valid calendars | P1 | High | Yes |
| TC-CYCLE-002 | CYCLE-002 | First-period anchor (calendar-aligned) | Monthly 1st–31st | Create | Periods snap to month-end | P1 | High | API |
| TC-CYCLE-003 | CYCLE-002 | First-period anchor (custom shape) | Monthly 15th–14th | Create + roll | Custom 15–14 shape preserved on roll | P1 | High | API |
| TC-CYCLE-004 | CYCLE-003 | Pay date offset | Offset = 3 | Create | Pay date = period end + 3 days | P1 | High | API |
| TC-CYCLE-005 | CYCLE-003 | Offset 0 = last day | Offset = 0 | Create | Pay date = period end | P2 | Medium | API |
| TC-CYCLE-006 | CYCLE-004 | Cutoff days | Cutoff = 5 | Create | Cutoff = period end − 5 | P3 | Low | API |

## Rolling horizon + lifecycle

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-CYCLE-007 | CYCLE-005 | Buffer = 1 Current + 3 Scheduled | New schedule | Inspect calendar | Exactly 1 Current + 3 Scheduled auto-created | P1 | High | API |
| TC-CYCLE-008 | CYCLE-006 | Lifecycle states | Calendar exists | Inspect statuses | Scheduled→Current→Completed model present | P1 | High | API |
| TC-CYCLE-009 | CYCLE-007 | **Regular-Paid advances + tops buffer** | Pay May regular | Mark Paid | May→Completed; next→Current; buffer back to 3 Scheduled | P1 | Critical | API |
| TC-CYCLE-010 | CYCLE-008 | Non-regular no advance | Bonus/off-cycle/termination paid | Mark Paid | Current unchanged; buffer unchanged | P1 | High | API |
| TC-CYCLE-011 | CYCLE-009 | Create-run default = Current | After paying May | Open Create Regular Pay Run | Defaults to June (next open/Current) | P2 | Medium | Yes |

## Date math

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-CYCLE-012 | CYCLE-010 | **Weekend pay-date → Friday** | Period ends Sun 31 May 2026 | Inspect pay date | Pays Fri 29 May 2026 | P2 | High | API |
| TC-CYCLE-013 | CYCLE-010 | Saturday pay-date → Friday | Pay date lands Saturday | Inspect | Shifts to preceding Friday | P2 | High | API |
| TC-CYCLE-014 | CYCLE-011 | Monthly month-end snap | Monthly aligned, Jan→Feb→Mar | Roll calendar | 31/28(29)/31 end dates correct | P1 | High | API |
| TC-CYCLE-015 | CYCLE-012 | Semi-monthly split incl. short Feb | Semi-monthly | Roll into Feb | 1–15 / 16–28(29) correct | P2 | High | API |
| TC-CYCLE-016 | CYCLE-013 | Quarterly +3 months | Quarterly | Roll | Each period spans 3 calendar months | P3 | Medium | API |
| TC-CYCLE-017 | CYCLE-011 | Leap-year Feb 29 | Monthly, Feb 2028 | Roll | Feb end = 29 | P3 | Medium | API |

## Frequency change safety

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-CYCLE-018 | CYCLE-014 | Change regenerates only empty future Scheduled | Calendar w/ empty future periods | Change frequency | Only future Scheduled with no runs deleted/regenerated under new frequency | P1 | High | API |
| TC-CYCLE-019 | CYCLE-015 | **History preserved on change** | Completed + Current + period-with-draft-run | Change frequency | Those untouched | P1 | High | API |
| TC-CYCLE-020 | CYCLE-014 | Change effective next open period | Mid-year change | Change | New frequency effective from next open period | P2 | Medium | API |

## Notes
- TC-CYCLE-009/010 = invariant #4 partner (calendar advance). TC-CYCLE-019 protects payroll history.
- Date-math tests need a deterministic clock/fixture (see `automation/utils/date-helpers`).
