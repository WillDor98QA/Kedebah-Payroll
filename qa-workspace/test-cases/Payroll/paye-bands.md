# Test Cases — PAYE Progressive Bands

**Module:** PAYE · **PRD:** §10, §17, §24 · **Reqs:** REQ-PAYE-001…010
Monthly bands (cumulative marginal): 0%≤490 · 5%≤600 · 10%≤730 · 17.5%≤3,896.67 · 25%≤19,896.67 ·
30%≤50,416.67 · 35% above. Tax on **chargeable income** (qualifying employment income after
reliefs/BIK/before-tax deductions). All expected values re-derived by `calc-oracle.ts`.

## Band coverage + boundaries

| TC ID | Req | Scenario (chargeable income) | Expected PAYE (oracle) | Pri | Sev | Auto |
|-------|-----|------------------------------|------------------------|-----|-----|------|
| TC-PAYE-001 | PAYE-001 | 490.00 (band-1 ceiling) | 0.00 | P1 | Critical | API |
| TC-PAYE-002 | PAYE-001 | 400.00 (within band 1) | 0.00 | P1 | Critical | API |
| TC-PAYE-003 | PAYE-002 | 600.00 (band-2 ceiling) | (110×5%) = 5.50 | P1 | Critical | API |
| TC-PAYE-004 | PAYE-002 | 550.00 (within band 2) | (60×5%) = 3.00 | P1 | Critical | API |
| TC-PAYE-005 | PAYE-003 | 730.00 (band-3 ceiling) | 5.50 + (130×10%) = 18.50 | P1 | Critical | API |
| TC-PAYE-006 | PAYE-004 | 3,896.67 (band-4 ceiling) | 18.50 + (3,166.67×17.5%) = 572.67 (verify rounding) | P1 | Critical | API |
| TC-PAYE-007 | PAYE-005 | 19,896.67 (band-5 ceiling) | band1-4 + (16,000×25%) | P1 | Critical | API |
| TC-PAYE-008 | PAYE-006 | 50,416.67 (band-6 ceiling) | band1-5 + (30,520×30%) | P1 | Critical | API |
| TC-PAYE-009 | PAYE-007 | 60,000.00 (into band 7) | band1-6 + ((60,000−50,416.67)×35%) | P1 | Critical | API |
| TC-PAYE-010 | PAYE-008 | 490.01 (just over band 1) | ≈0.0005 → rounds per engine; assert tiny marginal only | P2 | High | API |
| TC-PAYE-011 | PAYE-008 | 600.01 (just over band 2) | 5.50 + 0.001 marginal | P2 | High | API |
| TC-PAYE-012 | PAYE-008 | Mid-band 5,000 | Full cumulative sum to 5,000 | P1 | Critical | API |
| TC-PAYE-013 | PAYE-008 | Mid-band 25,000 | Full cumulative sum to 25,000 | P1 | Critical | API |

## Base assembly + UI

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-PAYE-014 | PAYE-009 | Chargeable base = qualifying income − reliefs + taxable BIK − before-tax deductions | Persona w/ reliefs, BIK, before-tax deduction | Process | Base assembled exactly per §14 pipeline | P1 | Critical | API |
| TC-PAYE-015 | PAYE-009 | Non-taxable items excluded from base | Non-taxable benefit + after-tax deduction | Process | Neither affects chargeable income | P1 | High | API |
| TC-PAYE-016 | PAYE-010 | Band-by-band breakdown UI | Processed employee | Open detail modal | Table shows income range, rate, regular income, regular PAYE matching calc | P2 | Medium | Yes |
| TC-PAYE-017 | PAYE-008 | Zero chargeable income | Reliefs ≥ income | Process | PAYE = 0; never negative | P2 | High | API |

## Notes
- Exact expected values in TC-PAYE-006…009 must be computed by the oracle at run time (placeholder
  arithmetic shown for the first bands); the test asserts engine == oracle, removing manual error.
- Verify the engine's rounding rule (per-band vs final) via TC-PAYE-010/011 and TC-CAL-023.
