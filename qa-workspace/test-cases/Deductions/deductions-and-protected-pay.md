# Test Cases — Deductions & Protected Pay

**Modules:** CAT (deductions, §7), PROT (§9) · **Reqs:** REQ-CAT-008…013, REQ-PROT-001…009

## Deductions catalog (CAT)

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-DED-001 | CAT-008 | Create each deduction type | Admin | Create Statutory/Voluntary/Loan/Benefit/Custom | Saved with classification | P2 | Low | Yes |
| TC-DED-002 | CAT-009 | Calc: Fixed | Fixed GH₵150 | Run | Deduction = 150.00 | P1 | Critical | API |
| TC-DED-003 | CAT-009 | Calc: % of Basic | 5% of 4,000 | Run | Deduction = 200.00 | P1 | Critical | API |
| TC-DED-004 | CAT-009 | Calc: % of Cash Emoluments | base set | Run | = % × cash emoluments | P1 | Critical | API |
| TC-DED-005 | CAT-009 | **Calc: % of Net Pay (second pass)** | %-of-net deduction | Run | Computed in pass 2 after tax + protected pay on realistic net | P1 | Critical | API |
| TC-DED-006 | CAT-010 | Before-Tax reduces PAYE base | Before-tax deduction | Run | PAYE base reduced; tax lower | P1 | Critical | API |
| TC-DED-007 | CAT-010 | After-Tax net only | After-tax deduction | Run | Net reduced; PAYE base unchanged | P1 | Critical | API |
| TC-DED-008 | CAT-010 | **Default = After Tax** | Deduction with treatment unspecified | Run | Treated as After Tax | P1 | High | API |
| TC-DED-009 | CAT-011 | Priority recorded | Two deductions diff priority | Inspect | Priority stored for trim order | P2 | High | API |
| TC-DED-010 | CAT-012 | Eligibility scope | Deduction scoped to person | Run others | Applied only to scope | P1 | High | API |
| TC-DED-011 | CAT-013 | Override window | Override dates | Run inside/outside | Applied only inside window | P1 | High | API |
| TC-DED-012 | CAT-015 | Permission gating | Non-permitted user | CRUD UI + API | Blocked both | P1 | High | API |
| TC-DED-013 | CAT-009 | %-of-net not in pass 1 | %-of-net + before-tax mix | Inspect pipeline | %-of-net deferred to pass 2, not pass 1 | P1 | High | API |

## Protected Pay (PROT)

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-PROT-001 | PROT-001 | Floor: absolute | Rule net ≥ GH₵1,000 | Run heavy-deduction employee | Floor = 1,000 enforced per mode | P1 | High | API |
| TC-PROT-002 | PROT-001 | Floor: % of gross | Rule 40% gross | Run | Floor = 40% × gross | P1 | High | API |
| TC-PROT-003 | PROT-001 | Floor: % of basic | Rule 50% basic | Run | Floor = 50% × basic | P1 | High | API |
| TC-PROT-004 | PROT-002 | **Hard Block** | Hard-block rule, deductions breach floor | Process run | Employee Error; run cannot process until deductions reduced | P1 | Critical | API |
| TC-PROT-005 | PROT-003 | **Partial Apply + Alert** | Partial rule, breach | Process | Deductions trimmed by priority until floor met; carryover recorded; alert raised | P1 | Critical | API |
| TC-PROT-006 | PROT-004 | Alert Only | Alert-only rule, breach | Process | Nothing trimmed; warning raised; net below floor allowed | P2 | Medium | API |
| TC-PROT-007 | PROT-005 | **Statutory never trimmed** | Partial rule, large PAYE+Tier1 | Process | PAYE & Tier1 untouched; only catalog deductions trimmed | P1 | Critical | API |
| TC-PROT-008 | PROT-006 | Priority trim order | Multiple deductions varied priority | Partial trim | Lowest priority trimmed first; highest survives longest | P1 | High | API |
| TC-PROT-009 | PROT-007 | Carryover recorded | Partial trim | Inspect run | Deferred amount recorded as carryover | P2 | High | API |
| TC-PROT-010 | PROT-008 | **Gap: no auto-recovery** | Carryover from prior run | Next run | Carryover NOT auto-recovered — matches §25 | P3 | Medium | API |
| TC-PROT-011 | PROT-009 | Audit storage | Any protected-pay employee | Inspect snapshot | Rule, floor, net before/after, deferred stored | P2 | Medium | API |
| TC-PROT-012 | PROT-003 | Floor exactly met (boundary) | Deductions bring net == floor | Process | No trim needed; net == floor; no carryover | P2 | Medium | API |

## Notes
- TC-PROT-007 = invariant #2 (statutory never trimmed). TC-PROT-010 = documented-gap verify-only.
- %-of-net deductions (TC-DED-005) interact with protected pay (computed after pass-1 trim) — combine in an integration case during Payroll wave.
