# Test Cases — Calculation Engine

**Module:** CAL · **PRD:** §14 · **Reqs:** REQ-CAL-001…016
Every monetary value is re-derived independently (`calc-oracle.ts`) and compared to the engine's
stored snapshot (REQ-CAL-015). Tests run primarily at API/detail-modal level for precision.

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-CAL-001 | CAL-001 | Basic per compensation type | Monthly/Daily/Hourly personas | Process run | Basic matches type formula (cross-ref EMP-008..010) | P1 | Critical | API |
| TC-CAL-002 | CAL-002 | Run-type flags resolved | Each run type | Process | {basic,benefits,deductions} inclusion matches §15 table | P1 | High | API |
| TC-CAL-003 | CAL-003 | Bonus amount fixed | Bonus run, fixed 2,000 | Process | Bonus = 2,000 | P1 | High | API |
| TC-CAL-004 | CAL-003 | Bonus amount % basic | Bonus run, 20% of 5,000 | Process | Bonus = 1,000 | P1 | High | API |
| TC-CAL-005 | CAL-004 | Recurring benefits resolved by scope | Benefits at multiple scopes + override window | Process | Correct benefits applied; taxable tracked | P1 | Critical | API |
| TC-CAL-006 | CAL-004 | Earnings vs benefits categorised | Mix of earning + benefit | Process | Each grouped correctly | P1 | High | API |
| TC-CAL-007 | CAL-005 | Deductions before/after split | Before-tax + after-tax deductions | Process | Before-tax reduces base; after-tax net only | P1 | Critical | API |
| TC-CAL-008 | CAL-005 | %-of-net deferred to pass 2 | %-of-net deduction | Process | Not computed in pass 1 | P1 | High | API |
| TC-CAL-009 | CAL-006 | Ad-hoc earnings + dedupe | Off-cycle one-time + duplicate of catalog item | Process | Duplicate skipped; one-time applied | P1 | High | API |
| TC-CAL-010 | CAL-006 | Catalog-linked no-amount inherits | Adjustment row references catalog item, no amount | Process | Inherits catalog amount | P2 | Medium | API |
| TC-CAL-011 | CAL-007 | **Gross pay sum** | Persona with basic+bonus+earnings+cash benefits | Process | Gross = basic + bonus + extra earnings + cash benefits (exact) | P1 | Critical | API |
| TC-CAL-012 | CAL-008 | Ad-hoc deductions w/ treatment | Off-cycle/termination deduction | Process | Applied with correct tax treatment | P1 | High | API |
| TC-CAL-013 | CAL-009 | **Tax pipeline order a→j** | Persona w/ reliefs+BIK+loan+Tier+bonus+overtime+pension+PAYE+flat | Inspect pipeline trace | Steps execute in exact a–j order | P1 | Critical | API |
| TC-CAL-014 | CAL-010 | Protected-pay step | Protected-pay persona | Process | Floor enforced per rule (cross-ref PROT) | P1 | Critical | API |
| TC-CAL-015 | CAL-011 | %-of-net second pass | %-of-net + tax + protected pay | Process | Computed on post-tax approximate net | P1 | High | API |
| TC-CAL-016 | CAL-012 | **Net pay formula** | Standard persona | Process | Net = gross − total deductions − employee statutory (exact) | P1 | Critical | API |
| TC-CAL-017 | CAL-012 | **Negative net → error** | Deductions > gross | Process | Employee Error; not paid | P1 | Critical | API |
| TC-CAL-018 | CAL-013 | **Employer cost** | Persona w/ Tier1/2/3 + employer-only benefit | Process | Employer cost = gross + employer statutory + employer-only benefits (exact) | P1 | High | API |
| TC-CAL-019 | CAL-014 | Status: Calculated | Clean persona | Process | Status = Calculated | P1 | High | API |
| TC-CAL-020 | CAL-014 | Status: Warning | Soft-warning persona (e.g. missing TIN) | Process | Status = Warning (paid) | P1 | High | API |
| TC-CAL-021 | CAL-014 | Status: Error | Hard-blocker persona | Process | Status = Error (blocked) | P1 | High | API |
| TC-CAL-022 | CAL-015 | Snapshot fidelity | Processed employee | Open detail modal + payslip | Both read same stored snapshot; no recompute; values identical | P1 | High | API |
| TC-CAL-023 | CAL-016 | Rounding consistency | Persona producing fractional cents | Process | Totals = sum of rounded lines; consistent rounding | P2 | High | API |
| TC-CAL-024 | CAL-007/012 | **End-to-end integration persona** | Full-feature persona (basic+benefit+BIK+loan+reliefs+before/after-tax+%-net+protected pay) | Process | Every line + gross/net/employer cost == oracle to the cent | P1 | Critical | API |

## Notes
- TC-CAL-013 (pipeline order) and TC-CAL-024 (integration) are the keystone calculation tests.
- TC-CAL-017 = invariant #9 (negative net = error). TC-CAL-022 supports snapshot-based payslip (SLIP).
