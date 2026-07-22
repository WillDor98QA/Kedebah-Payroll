# 23 — Exploratory Findings Register (live)

> Source of truth: `evidence/browser/findings.ndjson` (append-only, 20 findings). Every entry is backed by a captured artifact (screenshot / axe / console / network). Regenerated 2026-06-30.

**Totals:** 20 findings — 2 Critical, 12 Major, 5 Minor, 1 Info.

| ID | Sev | Pri | Category | Module | Finding | Status |
|---|---|---|---|---|---|---|
| BR-001 | Critical | P1 | Accessibility | App Shell (global) | Screen-reader users cannot identify icon-only top-bar controls (display/grid/fullscreen/chat/notific… | FAIL |
| BR-002 | Major | P2 | Accessibility | App Shell (global) | Low-vision users may not be able to read text that fails minimum contrast. | FAIL |
| BR-003 | Minor | P3 | Accessibility | App Shell (global) | Assistive-tech landmark navigation is impaired (no single main landmark; content outside regions). | FAIL |
| BR-004 | Major | P2 | Bug | App Shell (global) | A resource fails to load on every authenticated page (console 404). | FAIL |
| BR-005 | Minor | P3 | Performance/UX | Settings | The 10 Settings setup cards remain in skeleton-loading state for a noticeable time after navigation … | OBSERVATION |
| BR-006 | Major | P2 | Bug | Settings | Failed network request / console error on the Settings hub. | FAIL |
| BR-007 | Major | P2 | Accessibility | Settings | Settings hub has serious/critical a11y violations. | FAIL |
| BR-008 | Minor | P3 | UX | Settings | Setup card(s) without a visible status badge: Organization Setup | OBSERVATION |
| BR-009 | Major | P2 | Bug | Settings | Failed network request / console error on the Settings hub. | FAIL |
| BR-010 | Major | P2 | Accessibility | Settings | Settings hub has serious/critical a11y violations. | FAIL |
| BR-011 | Minor | P3 | UX | Settings | Setup card(s) without a visible status badge: Organization Setup | OBSERVATION |
| BR-012 | Info | P3 | Undocumented Behaviour | Organization Setup | Organization Setup is a browser-only module (no API contract); documenting genuine behaviour. | OBSERVATION |
| BR-013 | Major | P2 | Bug | Organization Setup | Console/network errors on Organization Setup. | FAIL |
| BR-014 | Major | P1 | Product Observation | Users & Roles | An Administrator cannot create or invite users — user management is gated by an inactive subscriptio… | BLOCKED |
| BR-015 | Major | P1 | Product Observation | Users & Roles | An Administrator cannot create or invite users — user management is gated by an inactive subscriptio… | BLOCKED |
| BR-016 | Major | P1 | Bug | Users & Roles | Admin cannot set a working password when creating a user — the created account cannot be logged into… | FAIL |
| BR-017 | Minor | P2 | Bug | Users & Roles | role_ids passed at user-create time are silently ignored. | FAIL |
| BR-018 | Major | P1 | Product Observation | Users & Roles / Auth | New users face a forced first-login password change AND the auth is a multi-domain SSO (payroll.kede… | FAIL |
| BR-019 | Major | P1 | Technical Debt | Users & Roles / Auth | QA automation SUBMITTED forced-password-change forms on the 4 real accounts — the provided temp pass… | OBSERVATION |
| BR-020 | Critical | P0 | Bug | Enterprise Onboarding / Us | Newly-created role users authenticate, change password, and select the business, but the Enterprise … | FAIL |

## Latest — Enterprise onboarding (this phase)

- **BR-020 (Critical/P0)** — Enterprise Module Launcher empty for **all** role accounts → no module access → cannot enter Payroll. **Formalised as [BUG-011](../bugs/BUG-011.md).** Evidence `evidence/browser/enterprise-*/D-module-launcher.png`.
- **BR-018 (Major/P1)** — Multi-domain SSO + forced password change onboarding flow (`sbxkedebah-v2.npontu.com`). Now *characterised and navigable* (stages 1–5 PASS), not a blocker.
- **BR-019 (Major/P1)** — Forced first-login + reset passwords are themselves must-change; QA-set passwords documented in `reports/35`. (Earlier 'all temp passwords changed' wording corrected — only onboarded accounts changed.)
- **BR-016 (Major/P1)** — Admin-set password at `POST /users` silently ignored. **Formalised as [BUG-012](../bugs/BUG-012.md).**
- **BR-017 (Minor/P2)** — `role_ids` at user-create silently ignored (assign via `POST /roles/{id}/assign-users`).

