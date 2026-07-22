# Test Cases — Payroll Run Types

**Module:** RUN · **PRD:** §15, §24 · **Reqs:** REQ-RUN-001…009
Inclusion contract is the oracle (PRD §15/§24 tables).

## Regular

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-RUN-001 | RUN-001 | Regular includes everything | Persona w/ basic+benefits+deductions+loan+BIK+reliefs | Create+process Regular | basic ✅, recurring benefits ✅, deductions ✅, full statutory, loans, BIK, reliefs | P1 | Critical | API |
| TC-RUN-002 | RUN-001 | Regular only overtime ad-hoc | Regular run | Add one-time earning (non-overtime) vs overtime adj | Only overtime adjustments accepted as ad-hoc | P2 | High | API |
| TC-RUN-003 | RUN-002 | No-group population | Mixed employees | Create Regular, no pay group | All active-salary, eligible-at-period-end added | P1 | High | API |
| TC-RUN-004 | RUN-009 | Regular advances calendar | Regular run | Mark Paid | Calendar advances (cross-ref CYCLE-007) | P1 | Critical | API |

## Bonus

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-RUN-005 | RUN-003 | Bonus excludes basic/benefits/deductions | Bonus run | Process | basic ❌, recurring benefits ❌, deductions ❌ | P1 | Critical | API |
| TC-RUN-006 | RUN-003 | Bonus Tier1/2/3 = 0 | Bonus run | Process | Tier1/2/3 = 0 (no basic) | P1 | High | API |
| TC-RUN-007 | RUN-003 | Bonus tax applies | Bonus run | Process | Bonus tax per STAX | P1 | Critical | API |
| TC-RUN-008 | RUN-004 | Bonus period optional | Bonus run, no period | Process | Computes; bonus cap keys off pay-date year | P2 | High | API |
| TC-RUN-009 | RUN-009 | Bonus does NOT advance calendar | Bonus run | Mark Paid | Calendar unchanged | P1 | High | API |

## Off-Cycle

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-RUN-010 | RUN-005 | Default pays only entered amounts | Off-cycle, all flags No | Enter one-time amount; process | Only entered amounts paid; no recurring | P1 | High | API |
| TC-RUN-011 | RUN-006 | Benefits flag Yes | Off-cycle, Benefits=Yes | Process | Recurring benefits included | P1 | High | API |
| TC-RUN-012 | RUN-006 | Deductions flag Yes | Off-cycle, Deductions=Yes | Process | Recurring deductions included | P1 | High | API |
| TC-RUN-013 | RUN-006 | Regular-salary flag Yes | Off-cycle, Regular salary=Yes | Process | Basic + Tier1/2 + %-of-basic + PAYE base follow | P1 | High | API |
| TC-RUN-014 | RUN-006 | Flag badges shown | Off-cycle create/draft | Inspect | Three flag badges visible | P3 | Low | Yes |
| TC-RUN-015 | RUN-007 | Own date range | Off-cycle | Enter date range | Range stored on run | P2 | Medium | Yes |
| TC-RUN-016 | RUN-009 | Off-cycle no advance | Off-cycle | Mark Paid | Calendar unchanged | P1 | High | API |

## Termination

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-RUN-017 | RUN-008 | Termination includes basic + statutory | Termination run | Process | basic ✅, full statutory ✅ | P1 | High | API |
| TC-RUN-018 | RUN-008 | No recurring benefits/deductions | Termination run | Process | recurring benefits ❌, deductions ❌ | P1 | High | API |
| TC-RUN-019 | RUN-008 | Entitlements/recoveries as adjustments | Termination run | Add leave payout + recovery adjustments | Applied line by line | P1 | High | API |
| TC-RUN-020 | RUN-008 | Records last working day | Termination run | Set last working day | Stored on run | P2 | Medium | Yes |
| TC-RUN-021 | RUN-009 | Termination no advance | Termination run | Mark Paid | Calendar unchanged | P1 | High | API |
| TC-RUN-022 | RUN-008 | Termination loans resolve | Terminating employee w/ loan | Process | Loans resolve on included pay (per §24) | P2 | High | API |

## Notes
- TC-RUN-004/009/016/021 jointly enforce invariant #4 (only Regular advances calendar).
- Build a "run-type matrix" parametrised test asserting each cell of the §24 table.
