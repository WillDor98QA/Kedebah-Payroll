# Test Cases — Alerts & Validation

**Module:** ALRT · **PRD:** §18 · **Reqs:** REQ-ALRT-001…014
Engine separates **hard blockers** (employee errors) from **soft warnings** (paid, flagged).

## Hard blockers (employee → Error, blocked)

| TC ID | Req | Alert | Trigger | Expected Result | Pri | Sev | Auto |
|-------|-----|-------|---------|-----------------|-----|-----|------|
| TC-ALRT-001 | ALRT-002 | `missing_income_tax_engine` | Employee resolves to no income-tax item | Hard block; Error status | P1 | Critical | API |
| TC-ALRT-002 | ALRT-004 | Negative net pay | Deductions > gross | Hard block; Error | P1 | Critical | API |
| TC-ALRT-003 | ALRT-005 | Missing/zero salary or rate | Comp setup incomplete | Hard block; Error | P1 | High | API |
| TC-ALRT-004 | ALRT-003 | `protected_pay_floor_breach` (hard mode) | Hard-block rule breached | Hard block; Error | P1 | High | API |

## Soft warnings (paid, flagged → Warning)

| TC ID | Req | Alert | Trigger | Expected Result | Pri | Sev | Auto |
|-------|-----|-------|---------|-----------------|-----|-----|------|
| TC-ALRT-005 | ALRT-003 | `protected_pay_floor_breach` (soft mode) | Alert-only/partial rule | Warning; paid | P2 | Medium | API |
| TC-ALRT-006 | ALRT-006 | `missing_tin` / `missing_tax_profile` | No TIN/profile | Warning; PAYE still computes | P2 | Medium | API |
| TC-ALRT-007 | ALRT-007 | `bik_cap_applied` | BIK capped | Warning (computed vs applied) | P2 | Medium | API |
| TC-ALRT-008 | ALRT-008 | `bonus_threshold_breach` | YTD past 15% cap | Warning | P2 | High | API |
| TC-ALRT-009 | ALRT-009 | `junior_employee_threshold` | OT junior threshold | Warning | P3 | Medium | API |
| TC-ALRT-010 | ALRT-010 | `pension_threshold` | 35% pension cap exceeded | Warning | P2 | High | API |
| TC-ALRT-011 | ALRT-011 | `benefit/deduction_threshold_breach` | Catalog threshold crossed | Warning | P3 | Medium | API |
| TC-ALRT-012 | ALRT-012 | `mandatory_item_exempted` | Mandatory item exempted | Warning | P3 | Medium | API |
| TC-ALRT-013 | ALRT-013 | `contract_renewal_warning` | Contract expiring within threshold | Warning | P3 | Low | API |

## Routing + acknowledgement

| TC ID | Req | Scenario | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|-------|-----------------|-----|-----|------|
| TC-ALRT-014 | ALRT-001 | Hard vs soft routing | Persona mixing hard + soft conditions | Hard → Error (blocked); soft → Warning (paid) | P1 | High | API |
| TC-ALRT-015 | ALRT-014 | Alert persistence + acknowledgement | Run with alerts | Alerts persisted as records; finance can acknowledge each | P2 | Medium | Yes |
| TC-ALRT-016 | ALRT-001 | Consolidated alerts on run | Multi-warning persona | Alerts consolidated at pipeline step j | P2 | Medium | API |

## Notes
- TC-ALRT-001/002 are invariants #1 and #9. These must NEVER regress.
