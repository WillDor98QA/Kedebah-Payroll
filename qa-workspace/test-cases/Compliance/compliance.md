# Test Cases — Compliance & Self-Service

**Module:** COMP · **PRD:** §23 (+ §16, §20) · **Reqs:** REQ-COMP-001…007

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-COMP-001 | COMP-001 | Every mutation logged | Any create/edit/delete | Perform mutation; check audit | Action attributed + timestamped | P1 | High | API |
| TC-COMP-002 | COMP-002 | Change history | Edit a record | Open change history | Before/after captured | P2 | Medium | Yes |
| TC-COMP-003 | COMP-003 | Approval trail | Run through approval | Open approval trail | Each approval step recorded | P2 | Medium | Yes |
| TC-COMP-004 | COMP-004 | Statutory filing history | Filed forms exist | Open Compliance → Statutory Filings | Filing history shown | P2 | Medium | Yes |
| TC-COMP-005 | COMP-005 | Compliance alerts | Alert conditions exist | Open compliance alerts | Alerts surfaced (backed by audit) | P3 | Medium | Yes |
| TC-COMP-006 | COMP-006 | **Dual audit trail immutable** | Lifecycle events + system mutations | Attempt to edit/delete audit entries (UI + API) | Both trails immutable — no edit/delete | P1 | High | API |
| TC-COMP-007 | COMP-006 | Audit completeness across lifecycle | Full run lifecycle | Inspect both trails | Pay-run lifecycle log + system-wide trail both present | P1 | High | API |
| TC-COMP-008 | COMP-007 | **Gap: My Earnings placeholder** | Self-Service | Open My Earnings | Placeholder, no backend — matches §25 | P3 | Low | Yes |
| TC-COMP-009 | COMP-007 | **Gap: My Loans placeholder** | Self-Service | Open My Loans | Placeholder, no backend — matches §25 | P3 | Low | Yes |
| TC-COMP-010 | COMP-007 | **Gap: Queries placeholder** | Self-Service | Open Queries | Placeholder, no backend — matches §25 | P3 | Low | Yes |

## Notes
- TC-COMP-006/007 protect audit immutability (compliance-critical). Pair with LIFE-019.
- ALRT acknowledgement (REQ-ALRT-014) overlaps Compliance alerts — covered in Alerts integration during Payroll wave.
