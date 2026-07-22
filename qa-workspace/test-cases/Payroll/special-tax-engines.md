# Test Cases — Special Tax Engines (Bonus / Overtime / Pension Excess)

**Module:** STAX · **PRD:** §17, §24 · **Reqs:** REQ-STAX-001…013
All expected values re-derived by `calc-oracle.ts`.

## Bonus Tax (Act 896 §5.1) — cap 15% of annual basic; 5% final within; excess marginal

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-STAX-001 | STAX-001 | Annual cap = 15% × (12×monthly basic) | Basic 5,000 | Inspect cap | Cap = 0.15 × 60,000 = 9,000 | P1 | Critical | API |
| TC-STAX-002 | STAX-002 | Bonus within cap → 5% final | Bonus 5,000 (< 9,000 cap, YTD 0) | Bonus run | Tax = 5% × 5,000 = 250; never touches PAYE | P1 | Critical | API |
| TC-STAX-003 | STAX-002 | YTD cumulative within cap | Prior YTD bonus 6,000, new 2,000 (total 8,000 < cap) | Bonus run | New 2,000 still 5% final | P1 | Critical | API |
| TC-STAX-004 | STAX-003 | Excess over cap → marginal | YTD 8,000, new 3,000 (1,000 over 9,000 cap) | Bonus run | 2,000 at 5% final; 1,000 excess via marginal PAYE = tax(ref+1,000)−tax(ref) | P1 | Critical | API |
| TC-STAX-005 | STAX-003 | Fully over cap | Cap already reached, new 4,000 | Bonus run | Entire 4,000 marginal | P1 | Critical | API |
| TC-STAX-006 | STAX-004 | Reference = synthetic regular run | Bonus employee w/ benefits+BIK+loan BIK+before-tax+SSF+reliefs | Bonus run | Reference chargeable income includes all those components | P1 | Critical | API |
| TC-STAX-007 | STAX-005 | **Reconciliation invariant** | Same employee: regular run + bonus run same month | Compute both | regular PAYE + bonus marginal PAYE == single-pass PAYE(salary+excess) | P1 | Critical | API |
| TC-STAX-008 | STAX-006 | Detail modal breakdown | Over-cap bonus | Open detail modal | Band-by-band table + reconciliation strip (Regular + Bonus = Month total) | P2 | Medium | Yes |
| TC-STAX-009 | STAX-007 | Threshold alert | YTD passes 15% cap | Bonus run | `bonus_threshold_breach` soft warning | P2 | High | API |
| TC-STAX-010 | STAX-001 | Bonus run Tier1/2/3 = 0 | Bonus only (no basic) | Bonus run | Tier1/2/3 compute to 0 | P1 | High | API |
| TC-STAX-011 | STAX-004 | Bonus run no period (pay-date year) | Bonus run, no period set | Bonus run | Cap keys off pay-date year; computes | P2 | High | API |

## Overtime Tax — junior split vs senior marginal (API-only entry, §25)

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-STAX-012 | STAX-008 | Junior: 5% up to 50% basic | Junior (YTD≤18k), basic 4,000, OT 1,500 | Add OT adj via API; run | 50% basic=2,000 → all 1,500 at 5% = 75; never PAYE | P1 | Critical | API |
| TC-STAX-013 | STAX-008 | Junior: 10% above 50% basic | Junior basic 4,000, OT 3,000 | Run | First 2,000 @5%=100; next 1,000 @10%=100; total 200; never PAYE | P1 | Critical | API |
| TC-STAX-014 | STAX-009 | Senior: marginal PAYE | Senior (>18k qualifying YTD), OT 2,000 | Run | OT added to chargeable income; taxed at PAYE marginal | P1 | High | API |
| TC-STAX-015 | STAX-008 | Junior→senior boundary (18k) | Qualifying YTD exactly 18,000 then above | Run | Threshold transition correct | P2 | High | API |
| TC-STAX-016 | STAX-010 | Config drives rates | Overtime Rules configured | Run | Thresholds/rates from config used | P2 | Medium | API |
| TC-STAX-017 | STAX-010 | Statutory fallback | Overtime engine unconfigured | Run | Fallback applies | P3 | Medium | API |
| TC-STAX-018 | STAX-011 | Junior threshold alert | Junior threshold reached | Run | `junior_employee_threshold` soft warning | P3 | Medium | API |
| TC-STAX-019 | STAX-012 | **Gap: no OT entry screen** | — | Look for OT entry UI on pay run | None — API-only; Attendance OT is sample data (matches §25) | P3 | Medium | Yes |

## Pension Excess (35% cap)

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-STAX-020 | STAX-013 | Cap = 35% qualifying income | High Tier3, total pension > 35% qualifying | Run | Excess above 35% routed back to chargeable income + PAYE'd | P1 | High | API |
| TC-STAX-021 | STAX-013 | Pension within cap | Total pension < 35% | Run | No routing; full pre-tax privilege | P1 | High | API |
| TC-STAX-022 | STAX-013 | Pension excess alert | Cap exceeded | Run | `pension_threshold` warning | P2 | High | API |
| TC-STAX-023 | STAX-013 | Counting-items only | Item flagged not-counting toward cap | Run | Excluded from cap aggregation | P2 | Medium | API |

## Notes
- TC-STAX-007 = invariant #5 (bonus reconciliation) — the single most important STAX test.
- TC-STAX-012/013 boundary at 50%-of-basic; TC-STAX-015 boundary at GH₵18,000 qualifying YTD.
