# Test Cases — Pay Run Lifecycle & Approval

**Module:** LIFE · **PRD:** §16 · **Reqs:** REQ-LIFE-001…009
Flow: Draft → Processing → Processed → Pending Approval → Approved → Paid (Reject→draft; Cancel; Return-to-previous).

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-LIFE-001 | LIFE-001 | Happy-path transitions | Draft run | Draft→Process→Submit→Approve→Mark Paid | Each transition succeeds in order | P1 | High | Yes |
| TC-LIFE-002 | LIFE-001 | Illegal transition blocked | Draft run | Attempt Mark Paid directly (skip approval) | Blocked | P1 | High | API |
| TC-LIFE-003 | LIFE-001 | Reject → draft | Pending approval | Reject with reason | Returns to Draft; reason recorded | P1 | High | Yes |
| TC-LIFE-004 | LIFE-001 | Return to previous stage | Multi-stage approval | Return-to-previous | Moves back one stage | P2 | Medium | Yes |
| TC-LIFE-005 | LIFE-002 | Draft editable + live preview | Draft run | Edit employees/adjustments | Preview recomputes totals/warnings/per-employee live | P1 | High | Yes |
| TC-LIFE-006 | LIFE-003 | Process persists results | Draft | Process | Engine runs all employees; results persisted | P1 | Critical | API |
| TC-LIFE-007 | LIFE-003 | Pre-process blockers listed | Run with incomplete employees | Process | Blockers listed before processing | P1 | High | Yes |
| TC-LIFE-008 | LIFE-003 | Exclude incomplete to proceed | Run with blockers | Process → exclude incomplete | Rest processed; excluded skipped | P2 | High | Yes |
| TC-LIFE-009 | LIFE-003 | Hard blockers stop affected only | Mix of clean + hard-blocked employees | Process | Hard-blocked → Error; others processed | P1 | Critical | API |
| TC-LIFE-010 | LIFE-004 | Multi-stage approval enforced | Workflow w/ 2 stages | Approve stage 1 then 2 | Both stages required before Approved | P1 | High | Yes |
| TC-LIFE-011 | LIFE-004 | Reject requires reason | Pending approval | Reject without reason | Blocked; reason mandatory | P2 | Medium | Yes |
| TC-LIFE-012 | LIFE-004 | Approver permission | Non-approver | Attempt approve (UI + API) | Blocked both | P1 | High | API |
| TC-LIFE-013 | LIFE-005 | **On-Approve: liabilities + forms** | Processed run | Approve | Tax liabilities + period forms generated (cross-ref FORM) | P1 | Critical | API |
| TC-LIFE-014 | LIFE-005 | **Files available after approval (not gated on payment)** | Approved (not paid) run | Open Files | PAYE/SSNIT/bank file downloadable | P1 | Critical | Yes |
| TC-LIFE-015 | LIFE-006 | **Gap: journal flag logged only** | Approve with "post journal entries" on | Approve; check Finance + audit | Flag recorded in audit; NO entries posted to Finance — matches §25 | P3 | Medium | API |
| TC-LIFE-016 | LIFE-007 | **Mark Paid side-effects** | Approved Regular run w/ loans | Mark Paid | Loan decrement + calendar advance + payment status updates all fire | P1 | Critical | API |
| TC-LIFE-017 | LIFE-007 | Mark Paid non-regular | Approved bonus run | Mark Paid | Loan decrement + status update; NO calendar advance | P1 | High | API |
| TC-LIFE-018 | LIFE-008 | Cancel with reason | Any pre-paid run | Cancel | Cancelled; reason in audit | P2 | Medium | Yes |
| TC-LIFE-019 | LIFE-009 | **Immutable audit per transition** | Run through full lifecycle | Inspect pay-run audit log | Entry per transition: who/when/from/to/message; immutable | P1 | High | API |
| TC-LIFE-020 | LIFE-002 | Edit blocked after processing | Processed run | Attempt edit employees | Blocked (no longer Draft) | P2 | Medium | API |

## Notes
- TC-LIFE-013/014/016 are keystones: approval generates compliance outputs; payment triggers money side-effects.
- Pair with SEC-012/013 (duplicate approve / mark-paid idempotency).
