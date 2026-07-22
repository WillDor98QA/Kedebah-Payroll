# 39 — Final Payroll Testing Backlog (master roadmap)

> 2026-06-30 · Definitive remaining-work register. Read-only; derived from `reports/37` (gap analysis) + `reports/38` (roadmap), reconciled to the ledger. Nothing invented — every row maps to a blocked/untested item, a defect, or a NOT-VERIFIED discipline. *(Numbered 39; `reports/36` is the reconciliation report.)*

**Type** = API / Browser / Manual / Performance / Security / Accessibility / Exploratory / Integration.
**Effort**: S ≤0.5d · M ≤2d · L ≤1wk · XL >1wk.

| # | Pri | Area | Module | Requirement | Test Case | Type | Reason | Effort | Dependency | Risk | Order |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | P0 | Access provisioning | Enterprise Onboarding | REQ-SETUP | TC-ENT-004/005 | Browser/Dev | **BUG-011** — module launcher empty; no role can enter Payroll | M (dev) | — | **Critical** — product unusable | 1 |
| 2 | P0 | Auth integrity | Users & Roles | IAM | TC-URB-005 | API/Dev | **BUG-012** — admin-set password silently ignored | S (dev) | — | Major — onboarding broken | 2 |
| 3 | P1 | Auth robustness | Security | REQ-SEC | TC-SEC (BUG-009) | API/Dev | invalid/missing token → 500 not 401 | S (dev) | — | Major — info leak/UX | 3 |
| 4 | P0 | Role enforcement | Users & Roles | REQ-SEC/AUTH | TC-RBAC-* (26 cases) | Security/Browser | observed permission matrix unproven (harness READY) | M | #1 | **Critical** — authz unverified | 4 |
| 5 | P1 | Privilege escalation | Security | REQ-SEC | new | Security | vertical/horizontal escalation, direct-URL, API authz bypass | M | #1,#4 | Critical | 5 |
| 6 | P1 | Session/CSRF/XSS/lockout/rate-limit | Security | REQ-SEC | new | Security/Exploratory | NOT VERIFIED | M | #1 | High | 6 |
| 7 | P1 | Run-Payroll wizard | Payroll Processing | REQ-CYCLE/RUN | TC-RUN/CYCLE (browser) | Browser | core workflow UI unverified (API only) | L | #1 | High — primary user flow | 7 |
| 8 | P1 | Approve / Pay | Payroll Lifecycle | REQ-LIFE | browser | Browser | lifecycle UI unverified | M | #1,#7 | High | 8 |
| 9 | P1 | Payslips UI/download | Payslips | REQ-SLIP | TC-SLIP (browser) | Browser | content PASS; download UX untested | M | #1,#7 | Medium | 9 |
| 10 | P1 | Reports UI/export | Reports | REQ-RPT | TC-RPT (browser) | Browser | filters/sort/export UX untested | M | #1 | Medium | 10 |
| 11 | P1 | Employees UI/import | Employees | REQ-EMP | TC-EMP (browser) | Browser | CRUD form/grid/bulk-import untested | L | #1 | Medium | 11 |
| 12 | P1 | Dashboard UI | Dashboard | REQ-DASH | TC-DASH (1 FAIL) | Browser | 1 FAIL + 3 blocked; UI unverified | S | #1 | Medium | 12 |
| 13 | P1 | Statutory forms | Statutory | REQ-FORM/STAX | TC-FORM | API/Browser | form generation blocked/unverified | L | — | High — compliance | 13 |
| 14 | P2 | Protected-pay HARD config | Payroll Processing | REQ-PROT | TC-ALRT-004 | API | rule not configurable (API contract) | M | dev | Medium | 14 |
| 15 | P2 | Pay-group membership | Pay Groups | REQ-PG | TC-PG | API | member-assign silent no-op / 405 | M | dev | Medium | 15 |
| 16 | P2 | Statutory exemption/override/preset | Tax/Deductions | REQ-STAX/RELF | TC-TAX/DED | API | silent no-op / 405 (blocked) | M | dev | Medium | 16 |
| 17 | P2 | Accessibility — shell fixes | App Shell | — | BR-001/002/003/007 | Accessibility/Dev | icon-name, contrast, landmark, link-name | M | — | Medium — WCAG/legal | 17 |
| 18 | P2 | Accessibility — payroll pages | All UI | — | new | Accessibility | axe + keyboard/SR on payroll pages; per-dialog | L | #7–12 | Medium | 18 |
| 19 | P2 | Responsive (mobile) | All UI | — | new | Browser | Pixel-7 runs on payroll pages | M | #7–12 | Low-Med | 19 |
| 20 | P3 | Cross-browser | All UI | — | new | Browser | Firefox/WebKit smoke on critical flows | S | #7 | Low | 20 |
| 21 | P2 | Performance/load/volume | All | — | new | Performance | NOT VERIFIED — large payroll, concurrency | L–XL | — | High at scale | 21 |
| 22 | P3 | Integration — bank delivery | Payments | REQ-PAYM/BANK | new | Integration | file content PASS; delivery NOT VERIFIED | M | — | Medium | 22 |
| 23 | P3 | Integration — email content | Alerts/Notif | REQ-ALRT | new | Integration | reset-send observed; content/delivery NOT VERIFIED | S | — | Low-Med | 23 |
| 24 | P3 | Integration — finance/HRIS | Compliance | — | new | Integration | NOT VERIFIED | L | — | Medium | 24 |
| 25 | P3 | Import/export CSV/Excel | Employees/Reports | REQ-EMP/RPT | new | Browser/Integration | NOT VERIFIED | M | #11 | Low-Med | 25 |
| 26 | P3 | Visual regression baseline | All UI | — | new | Browser | no baseline suite | M | #7–12 | Low | 26 |
| 27 | P3 | Logout / session persistence | Enterprise/Auth | REQ-AUTH | new | Browser | NOT VERIFIED | S | #1 | Low | 27 |
| 28 | P3 | Remaining defects regression | Multiple | — | BUG-001..008,010 | API/Browser | re-verify after fixes | M | dev | Low | 28 |

## Summary by priority
- **P0 (4):** #1 BUG-011, #2 BUG-012, #4 role enforcement, (#1 gates #4). The certification long pole.
- **P1 (9):** auth robustness, escalation/security, core payroll browser UX (Run-Payroll/Approve/Pay/Payslips/Reports/Employees/Dashboard), statutory forms.
- **P2 (8):** config blockers, accessibility, responsive, performance.
- **P3 (7):** cross-browser, integrations, import/export, visual regression, logout, defect regression.

## Recommended execution order
**1–3** (unblock + core defects) → **4–6** (enforcement + security) → **7–12** (core payroll browser UX) → **13–16** (statutory + config) → **17–20** (a11y + responsive + cross-browser) → **21** (performance) → **22–28** (integration, import/export, visual, logout, regression).

## Reconciliation
All references trace to: ledger `evidence/exec/records.ndjson` (417 cases · 234 PASS · 1 FAIL · 174 BLOCKED · 8 N/A), `bugs/BUG-001…012` (12), `evidence/browser/findings.ndjson` (BR-001…020), `requirements/` (261 reqs, 163 with ≥1 verified rule). No item is invented; every row is a blocked case, an open defect, or a NOT-VERIFIED discipline named in `reports/37`.
