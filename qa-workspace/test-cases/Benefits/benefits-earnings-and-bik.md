# Test Cases — Earnings, Benefits & BIK

**Modules:** CAT (benefits/earnings, §7), BIK (§8) · **Reqs:** REQ-CAT-001…007, REQ-CAT-012…015, REQ-BIK-001…008

## Catalog — benefits & earnings (CAT)

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-BEN-001 | CAT-015 | Create earning item | Admin | Create Category=Earning, Fixed amount | Saved; emits `earning` line | P2 | Medium | Yes |
| TC-BEN-002 | CAT-015 | Create benefit item | Admin | Create Category=Benefit, Cash | Saved; emits `benefit` line | P2 | Medium | Yes |
| TC-BEN-003 | CAT-001 | Earning → gross | Employee with earning assigned | Run | Earning counts toward gross; grouped as earning | P1 | High | API |
| TC-BEN-004 | CAT-001 | Benefit → pay, grouped as benefit | Cash benefit assigned | Run | Adds to pay; grouped as benefit | P1 | High | API |
| TC-BEN-005 | CAT-003 | Calc: Fixed amount | Fixed GH₵200 | Run | Benefit = 200.00 | P1 | Critical | API |
| TC-BEN-006 | CAT-003 | Calc: % of Basic | 10% of basic 5,000 | Run | Benefit = 500.00 | P1 | Critical | API |
| TC-BEN-007 | CAT-003 | Calc: % of Cash Emoluments | basic + fixed cash benefits base | Run | Benefit = % × (basic + fixed cash benefits) | P1 | Critical | API |
| TC-BEN-008 | CAT-004 | Taxable benefit → PAYE base | Taxable cash benefit | Run | Added to PAYE base | P1 | Critical | API |
| TC-BEN-009 | CAT-004 | Non-taxable benefit excluded from base | Non-taxable benefit | Run | Paid but NOT in PAYE base | P1 | Critical | API |
| TC-BEN-010 | CAT-005 | Effective window (catalog) | Item effective future | Run before window | Item skipped | P2 | Medium | API |
| TC-BEN-011 | CAT-006 | Inactive item skipped | Item status Inactive | Run | Not applied | P2 | Medium | API |
| TC-BEN-012 | CAT-007 | Alert threshold breach | Item with threshold | Run amount over threshold | `benefit_threshold_breach` soft warning | P3 | Medium | API |
| TC-BEN-013 | CAT-012 | Scope to department | Item scoped to dept A | Run dept A vs B | Applied only to dept A | P1 | High | API |
| TC-BEN-014 | CAT-013 | Per-employee override window | Override amount + dates | Run within vs outside window | Applied only inside window | P1 | High | API |
| TC-BEN-015 | CAT-014 | Catalog approval workflow | Approval enabled | Create change → before approval | Change not live until approved; activity trail | P2 | Medium | Yes |
| TC-BEN-016 | CAT-015 | Permission gating | Non-permitted user | CRUD via UI + API | Blocked both | P1 | High | API |

## Benefits in Kind (BIK)

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-BIK-001 | BIK-001 | BIK = Non-Cash benefit | Admin | Create benefit Nature=Non-Cash w/ rate/base/cap | Treated as BIK | P1 | High | Yes |
| TC-BIK-002 | BIK-002 | Value = fixed | Fixed BIK value | Run | BIK value = fixed | P1 | Critical | API |
| TC-BIK-003 | BIK-002 | Value = rate% × base | 5% × base | Run | BIK value = 5% × base | P1 | Critical | API |
| TC-BIK-004 | BIK-003 | Base = Basic | base=Basic | Run | Value uses basic | P1 | Critical | API |
| TC-BIK-005 | BIK-003 | Base = Cash Emoluments excl BIK | base set | Run | Uses cash emoluments excluding BIK | P1 | Critical | API |
| TC-BIK-006 | BIK-003 | Base = Cash Emoluments incl BIK | base set | Run | Uses cash emoluments including BIK | P1 | Critical | API |
| TC-BIK-007 | BIK-003 | Base = Qualifying Employment Income | base set | Run | Uses qualifying income | P1 | Critical | API |
| TC-BIK-008 | BIK-004 | Monthly cap bites | computed > cap | Run | Value capped at monthly cap | P1 | High | API |
| TC-BIK-009 | BIK-005 | Cap warning | cap bites | Run | `bik_cap_applied` warning shows computed vs applied | P2 | Medium | API |
| TC-BIK-010 | BIK-004 | Cap does not bite | computed < cap | Run | Full computed value used | P2 | Medium | API |
| TC-BIK-011 | BIK-006 | **Taxable BIK not paid** | Taxable BIK | Run | Adds to PAYE base; `bik` line; net pay unaffected | P1 | Critical | API |
| TC-BIK-012 | BIK-006 | BIK excluded from payslip earnings | BIK employee, paid run | Generate payslip | BIK absent from Earnings section | P1 | High | API |
| TC-BIK-013 | BIK-007 | Country-scoped BIK match | BIK scoped to country | Run matching vs non-matching tax profile | Applied only to matching profile | P2 | Medium | API |
| TC-BIK-014 | BIK-007 | Auto-enrolled BIK no per-employee row | Auto-enroll BIK | Run | Applies without explicit row | P2 | Medium | API |
| TC-BIK-015 | BIK-008 | **Pipeline position before % items** | BIK + Tier/PAYE | Inspect pipeline trace | BIK valued before percentage statutory items; bases correct | P1 | Critical | API |
| TC-BIK-016 | BIK-002 | Value re-derived via oracle | Known rate/base/cap | Compute expected | Engine BIK == oracle (incl. cap) | P1 | Critical | API |

## Notes
- TC-BIK-011/012 enforce invariant #6 (BIK taxed, never paid). TC-BIK-015 enforces pipeline ordering.
- "% of Cash Emoluments" base = basic + fixed cash benefits (PRD §7) — oracle must match this definition.
