# Test Cases — Employee Setup

**Module:** EMP · **PRD:** §13 · **Reqs:** REQ-EMP-001…021

## Onboarding (add / import / sync)

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-EMP-001 | EMP-001 | Add employee happy path | Admin, config done | Complete personal→job→compensation→payment | Employee created in HR + payroll | P1 | High | Yes |
| TC-EMP-002 | EMP-001 | Required-field validation per step | Admin | Leave required field blank, advance | Step blocks with validation | P1 | High | Yes |
| TC-EMP-003 | EMP-001 | Cancel mid-form | Admin | Start, cancel | No partial record persisted | P3 | Low | Yes |
| TC-EMP-004 | EMP-002 | Bulk import valid | Excel template | Upload valid file → preview → process | Preview validates; chunked background processing; rows created | P2 | High | Yes |
| TC-EMP-005 | EMP-002 | Bulk import invalid rows | File with bad rows | Upload → preview | Invalid rows flagged in preview before processing | P2 | High | Yes |
| TC-EMP-006 | EMP-002 | Import History tracked | Completed import | Open Import History | Import recorded with status | P3 | Medium | Yes |
| TC-EMP-007 | EMP-003 
| Sync from HRIS | HR staff exist | Run Sync | Existing staff registered for payroll | P2 | Medium | Yes |

## Compensation types (basic earning resolution)

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-EMP-008 | EMP-004 | Monthly basic | Monthly, base 6,000 | Run | Basic = 6,000.00 | P1 | High | API |
| TC-EMP-009 | EMP-005 | Daily basic | Daily rate 200 × 22 days | Run | Basic = 4,400.00 | P1 | High | API |
| TC-EMP-010 | EMP-006 | Hourly basic | Hourly 50 × 160 hrs | Run | Basic = 8,000.00 | P1 | High | API |
| TC-EMP-011 | EMP-007 | **Zero rate → error** | Daily rate 0 | Process run | Employee Error (not paid 0); flagged in draft | P1 | Critical | API |
| TC-EMP-012 | EMP-007 | Missing quantity → error | Hourly, hours blank | Process | Employee Error | P1 | Critical | API |

## Payment methods (validation matrix)

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-EMP-013 | EMP-008 | Bank Transfer all fields | — | Select Bank Transfer; fill Bank+Branch+Acct No+Acct Name | Saved | P1 | High | Yes |
| TC-EMP-014 | EMP-008 | Bank Transfer missing field | — | Omit Account Name / Account Number | Validation blocks | P1 | High | Yes |
| TC-EMP-015 | EMP-011 | Cascading Bank→Branch | — | Pick bank then branch | Branch list filtered to bank; sort code captured | P1 | High | Yes |
| TC-EMP-016 | EMP-008 | No free-text bank | — | Try typing bank name freely | Not possible (picker only) | P1 | High | Yes |
| TC-EMP-017 | EMP-009 | **MoMo — no Account Name required** | — | Select Mobile Money; enter Number + Network only | Saved without Account Name | P1 | High | Yes |
| TC-EMP-018 | EMP-009 | MoMo missing network | — | Number only, no network | Validation blocks | P2 | Medium | Yes |
| TC-EMP-019 | EMP-010 | Cash — no extra fields | — | Select Cash | Saved with nothing further | P2 | Low | Yes |
| TC-EMP-020 | EMP-012 | Masked numbers | Employee w/ account | View details | Account/MoMo masked (last 4); eye reveals | P2 | Medium | Yes |

## Seven detail tabs

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-EMP-021 | EMP-013 | Payroll Profile readiness | Incomplete employee | Open Payroll Profile tab | Readiness indicator + missing-field checklist accurate | P2 | Medium | Yes |
| TC-EMP-022 | EMP-014 | Salary assignment effective dates | — | Set base salary + effective dates | Saved; structure recorded | P1 | High | Yes |
| TC-EMP-023 | EMP-014 | Mid-cycle date warns | Effective date mid-period | Save | Warning shown | P2 | High | Yes |
| TC-EMP-024 | EMP-014 | **Gap: no auto-proration** | Mid-period salary change | Run that period | Engine pays full period at effective salary (no proration) — matches §25 | P1 | High | API |
| TC-EMP-025 | EMP-016 | Tax & Pension tab | — | Set TIN, NHIS, profile, enroll/exempt/preset, overrides, Tier3, reliefs | All persist | P1 | High | Yes |
| TC-EMP-026 | EMP-016 | Contract renewal alert | Contract near expiry | Open tab / run | `contract_renewal_warning` within threshold | P3 | Low | API |
| TC-EMP-027 | EMP-017 | **Gap: Cost Center not saved** | — | Enter allocations (total 100%), save, reopen | Nothing persisted; sample list — matches §25 | P3 | Low | Yes |
| TC-EMP-028 | EMP-017 | Cost Center 100% UI rule | — | Enter allocations ≠ 100% | UI flags (even though not persisted) | P3 | Low | Yes |
| TC-EMP-029 | EMP-018 | Benefits & Deductions In-Effect | Items at multiple scopes | Open tab | In-Effect = direct + group + dept + auto, resolved | P1 | High | API |
| TC-EMP-030 | EMP-019 | **Gap: Payroll Overrides not saved** | — | Enter override, save, reopen | Nothing persisted — matches §25 | P3 | Low | Yes |

## Readiness gating

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-EMP-031 | EMP-020 | Not-ready excluded/flagged | Employee missing payment details | Add to run | Flagged not-ready | P1 | High | API |
| TC-EMP-032 | EMP-020 | Missing TIN warns only | Employee no TIN, else complete | Run | `missing_tin` warning; PAYE still computes (not blocked) | P1 | High | API |
| TC-EMP-033 | EMP-020 | Missing mandatory statutory blocks | Not enrolled in mandatory | Run | Hard block (missing engine) | P1 | Critical | API |
| TC-EMP-034 | EMP-021 | Exclude incomplete on Process | Run with some incomplete employees | Process → exclude incomplete | Rest proceed; incomplete excluded | P2 | High | Yes |

## Notes
- TC-EMP-011/012/033 feed ALRT hard-blocker cases. TC-EMP-024/027/030 = documented-gap verify-only.
- TC-EMP-017 (MoMo no account name) is a frequent real-world validation defect — high value.
