# Test Cases — Pay Groups

**Module:** PG · **PRD:** §5 · **Reqs:** REQ-PG-001…006

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-PG-001 | PG-006 | Create pay group | Admin | Create group with name + members | Group saved with membership | P2 | Medium | Yes |
| TC-PG-002 | PG-006 | Edit membership | Existing group | Add/remove members | Membership updated | P2 | Medium | Yes |
| TC-PG-003 | PG-006 | Delete pay group | Group with no active run | Delete | Removed (guard if linked to run — verify) | P2 | Medium | Yes |
| TC-PG-004 | PG-006 | Permission gating | Non-permitted user | Attempt CRUD (UI + API) | Blocked both layers | P1 | High | API |
| TC-PG-005 | PG-001 | Group pre-populates run | Group with 3 members | Create run for that group | Exactly those 3 members loaded | P1 | High | Yes |
| TC-PG-006 | PG-002 | No-group regular run = all active | Mixed active/expired-salary employees | Create regular run with no pay group | All active-salary employees (eligible at period end) added; expired excluded | P1 | High | API |
| TC-PG-007 | PG-002 | Eligibility at period end | Employee salary expires before period end | Create regular run | That employee excluded | P1 | High | API |
| TC-PG-008 | PG-003 | Shared benefit applies to members | Benefit assigned at group level | Run for group | Every member gets benefit without per-employee row | P1 | High | API |
| TC-PG-009 | PG-003 | Shared deduction applies | Deduction at group level | Run | All members deducted | P1 | High | API |
| TC-PG-010 | PG-004 | Group protected-pay rule | Group with protected-pay rule | Run heavy-deduction member | Rule applied to members | P2 | Medium | API |
| TC-PG-011 | PG-005 | **Layered resolution order** | Item at all-emp, dept, group, individual levels for same employee | Open employee "In Effect" view | Resolution all→dept→group→individual; final set correct | P1 | High | API |
| TC-PG-012 | PG-005 | Individual override beats group | Group amount + individual override | View In Effect + run | Individual override wins | P1 | High | API |
