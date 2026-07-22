# Test Cases — Employer Loans

**Module:** LOAN · **PRD:** §12 · **Reqs:** REQ-LOAN-001…009
Functional path = **Management → Loans**. Loans submenu pages are previews (§25, verify-only).

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-LOAN-001 | LOAN-001 | Create loan | Admin, employee exists | Create loan: principal, rate, per-period repayment, term | Loan saved + tracked | P1 | High | Yes |
| TC-LOAN-002 | LOAN-001 | Edit/close loan | Existing loan | Edit terms; close | Updates persist | P2 | Medium | Yes |
| TC-LOAN-003 | LOAN-001 | Permission gating | Non-permitted user | CRUD via UI + API | Blocked both | P1 | High | API |
| TC-LOAN-004 | LOAN-002 | **Loan BIK when rate < reference** | Loan interest below reference rate | Run regular payroll | `bik` line "Employer Loan BIK" added to chargeable income; value = monthly subsidy; **not paid in cash** | P1 | Critical | API |
| TC-LOAN-005 | LOAN-002 | No BIK when rate ≥ reference | Loan at/above reference rate | Run | No loan BIK line | P1 | High | API |
| TC-LOAN-006 | LOAN-008 | Exempt loan → no BIK | Loan assessed exempt | Run | No BIK even if subsidised | P2 | Medium | API |
| TC-LOAN-007 | LOAN-003 | Repayment from net after tax | Active loan, repayment set | Run | Repayment deducted after tax; reduces net | P1 | Critical | API |
| TC-LOAN-008 | LOAN-003 | Repayment clamped to balance | Remaining balance < scheduled repayment | Run | Repayment = remaining balance (not more) | P1 | Critical | API |
| TC-LOAN-009 | LOAN-005 | **Draft does NOT decrement balance** | Loan, draft run | Process to draft/processed (not paid); check balance | Balance unchanged | P1 | Critical | API |
| TC-LOAN-010 | LOAN-005 | Mark Paid decrements by actual taken | Approved run with repayment | Mark Paid; check balance | Balance reduced by repayment actually taken | P1 | Critical | API |
| TC-LOAN-011 | LOAN-006 | **Independent multi-loan balances** | Employee with 2 active loans | Run + Mark Paid | Each balance decremented independently by its own repayment | P1 | High | API |
| TC-LOAN-012 | LOAN-007 | Combined payslip line | Employee with 2 loans | Generate payslip | Single "Employer Loan Repayment" = sum; per-loan detail intact in audit | P2 | Medium | API |
| TC-LOAN-013 | LOAN-004 | Auto-stop when repaid | Loan near payoff, auto-stop on | Run until balance 0; next run | No repayment after balance 0 | P2 | High | API |
| TC-LOAN-014 | LOAN-004 | Continue while balance remains | Loan, auto-stop off | Multiple runs | Repayments continue while balance > 0 | P2 | Medium | API |
| TC-LOAN-015 | LOAN-009 | **Gap: Loans submenu previews** | — | Open Loan Requests/Eligibility/Approval/Active/Repayments pages | Preview only (no live backend) — matches §25 | P3 | Low | Yes |
| TC-LOAN-016 | LOAN-002 | Loan BIK value re-derived | Subsidised loan, known reference rate | Compute expected monthly subsidy via oracle | Engine BIK value == oracle value | P1 | Critical | API |
