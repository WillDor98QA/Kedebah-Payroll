# Test Cases — Tax & Statutory Configuration + Reliefs

**Modules:** TAX (§10), RELF (§11) · **Reqs:** REQ-TAX-001…013, REQ-RELF-001…006
Calculation oracle = independent re-derivation of PRD formulas (see Test Strategy §3).

## Statutory configuration (TAX)

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-TAX-001 | TAX-002 | **Seed verification — PAYE bands** | Ghana seed loaded | Open Statutory Items → PAYE → bands | 7 bands exactly: 0%≤490, 5%≤600, 10%≤730, 17.5%≤3896.67, 25%≤19896.67, 30%≤50416.67, 35% above | P1 | Critical | API |
| TC-TAX-002 | TAX-002 | Seed — Tier 1/2/3 | Seed loaded | Inspect Tier items | Tier1 5.5/13, Tier2 0/5 of basic; Tier3 per scheme | P1 | Critical | API |
| TC-TAX-003 | TAX-002 | Seed — bonus/overtime/casual/pension | Seed loaded | Inspect items | Bonus 5% within cap; Overtime junior 5%/10%; Casual 5%; Pension 35% cap present | P1 | Critical | API |
| TC-TAX-004 | TAX-001 | Configure statutory item fields | Admin | Create/edit item: engine key, stage+sequence, base type, switches, cumulative window, rate version, bands | All fields persist | P1 | High | Yes |
| TC-TAX-005 | TAX-003 | Rate version dating | Existing item | Add new rate version with effective date | New version stored; old retained (history) | P2 | High | Yes |
| TC-TAX-006 | TAX-003 | Calc uses dated rate | Two rate versions | Run for period before vs after effective date | Correct version applied per period | P1 | High | API |
| TC-TAX-007 | TAX-004 | Resolver — mandatory floor | Employee, no enrollments | Resolve items | Mandatory items present | P1 | Critical | API |
| TC-TAX-008 | TAX-004 | Resolver — auto-enroll match | Eligibility rule matches employee | Resolve | Auto-enrolled item present | P1 | High | API |
| TC-TAX-009 | TAX-004 | Resolver — explicit exempt subtracts | Mandatory item exempted (with reason) | Resolve | Item excluded; `mandatory_item_exempted` warning | P1 | High | API |
| TC-TAX-010 | TAX-005 | **No income-tax engine → hard block** | Employee resolves to no income-tax item | Process run | Employee Error; `missing_income_tax_engine`; not paid untaxed | P1 | Critical | API |
| TC-TAX-011 | TAX-006 | Eligibility OR combination | Two rules (country OR department) | Employee matches one | Item enrolled (OR semantics) | P2 | High | API |
| TC-TAX-012 | TAX-006 | Eligibility scope negative | Employee matches no rule | Resolve | Auto-item NOT enrolled | P2 | Medium | API |
| TC-TAX-013 | TAX-007 | Tax preset one-click | Preset "Ghana Full-Time" | Apply to new hire | All bundled items enrolled in one action | P1 | High | Yes |
| TC-TAX-014 | TAX-008 | Per-employee rate override | Enrolled item | Set override rate | Calc uses override, not default | P2 | High | API |
| TC-TAX-015 | TAX-009 | Voluntary Tier 3 scheme | Scheme with min/max | Enroll employee | Tier 3 computed per scheme within min/max | P2 | Medium | API |
| TC-TAX-016 | TAX-010 | Exemption requires reason | Admin | Exempt item without reason | Rejected; reason mandatory | P2 | Medium | Yes |
| TC-TAX-017 | TAX-012 | Filing-rule due dates | Filing rules configured | Approve a run; inspect liabilities | GRA due 15th, SSNIT/NPRA 14th of following month | P2 | High | API |
| TC-TAX-018 | TAX-013 | Statutory config permission | Non-tax-setup user | Attempt edit (UI + API) | Blocked both layers | P1 | High | API |
| TC-TAX-019 | TAX-001 | Negative: invalid band overlap | Admin | Create bands with gap/overlap | Validation prevents inconsistent bands (exploratory if unspecified) | P3 | Medium | Yes |

## Tax Reliefs (RELF) — values re-derived independently

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-RELF-001 | RELF-001 | Fixed Annual ÷ 12 | Dependent Relief GH₵1,200/yr assigned | Run; inspect relief | Monthly = GH₵100.00 | P1 | High | API |
| TC-RELF-002 | RELF-002 | Per-Unit annual × units ÷ 12 | Children's Education GH₵600/child, 2 children | Run | Monthly = 600×2÷12 = GH₵100.00 | P1 | High | API |
| TC-RELF-003 | RELF-002 | Per-Unit **cap at max units** | 5 children, max 3 | Run | Capped at 3 → 600×3÷12 = GH₵150.00 | P1 | High | API |
| TC-RELF-004 | RELF-003 | % assessable income | Disability 25% | Run | Relief = 25% × month assessable income | P1 | High | API |
| TC-RELF-005 | RELF-004 | SSF auto from Tier1+Tier2 EE | Employee with Tier1 5.5% EE, Tier2 0% EE | Run | SSF relief = Tier1+Tier2 EE actual; no manual amount | P1 | High | API |
| TC-RELF-006 | RELF-005 | **Reliefs run first** | Employee with relief + benefits | Inspect pipeline trace | Base trimmed by reliefs before BIK/percentage/PAYE | P1 | Critical | API |
| TC-RELF-007 | RELF-006 | Per-employee assignment | Two employees, one with relief | Run both | Only assigned employee gets relief | P2 | Medium | API |
| TC-RELF-008 | RELF-001 | Boundary: relief > base | High relief, low income | Run | Base floored (not negative); PAYE 0, no negative tax | P2 | High | API |

## Notes
- TC-TAX-010 is invariant #1 (no untaxed pay). TC-RELF-006 is invariant-supporting (pipeline order).
- Seed-verification tests (TC-TAX-001…003) gate all calculation waves per Test Plan entry criteria.
