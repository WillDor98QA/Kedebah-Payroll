# Test Cases — Dashboard

**Module:** DASH · **PRD:** *(no dedicated section)* · **Req:** REQ-DASH-001

> ⚠️ **Scope unconfirmed (open question #2).** The PRD has no dashboard section. A test-cases folder
> exists in the mandated structure, so this file holds **provisional** cases pending confirmation of
> what the Dashboard is (likely the post-login landing/overview). These will be expanded once scope
> is confirmed — no behaviour is invented here.

| TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|---------------|-------|-----------------|-----|-----|------|
| TC-DASH-001 | DASH-001 | Post-login landing renders | Logged in | Land after login | Dashboard/landing renders without error | P2 | Medium | Yes |
| TC-DASH-002 | DASH-001 | No console/network errors | Logged in | Load dashboard; capture console + network | No JS errors, no failed requests | P2 | Medium | Yes |
| TC-DASH-003 | DASH-001 | Permission-appropriate widgets | Admin vs Manager vs Staff | Load per role | Only permitted widgets/links shown (cross-ref AUTH-009) | P2 | Medium | Yes |
| TC-DASH-004 | DASH-001 | Navigation from dashboard | Logged in | Click each nav entry point | Routes resolve to correct modules | P3 | Low | Yes |
| TC-DASH-005 | DASH-001 | Responsive rendering | Logged in | View at desktop/tablet/mobile | Layout adapts, no broken elements | P3 | Low | Yes |

## To confirm before finalising (open question #2)
- Is "Dashboard" the post-login landing, a KPI/overview page, or a menu group?
- What metrics/widgets (if any) are documented as expected? (None in current PRD.)
- Until confirmed, treat dashboard data/metrics as **exploratory-only**, not requirement-backed.
