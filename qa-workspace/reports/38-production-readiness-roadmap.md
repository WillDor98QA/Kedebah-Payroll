# 38 — Production-Readiness Roadmap (Payroll Module)

> 2026-06-30 · Companion to `reports/37-payroll-gap-analysis.md`. Read-only planning artifact — no tests run, ledger unchanged. Sequenced path from today's state (**~55% production-ready**) to certifiable. *(Numbered 38, not 37, because `reports/36` is the documentation-reconciliation report.)*

## 1. Readiness verdict

**NOT certifiable today.** One Critical product defect (BUG-011) makes the product unusable for newly-provisioned users and simultaneously blocks the security-critical per-role enforcement audit. The **payroll calculation/lifecycle engine is production-trustworthy** (oracle-verified); the **end-user product around it is not** (access, UX, enforcement, performance unproven).

## 2. Certification gates (must all be GREEN)

| Gate | Today | Exit criteria |
|---|---|---|
| G1 — Module access | 🔴 | A provisioned role user can launch Payroll (BUG-011 fixed) |
| G2 — Per-role enforcement | 🔴 NOT VERIFIED | Observed permission matrix for all 4 roles (menus/403/direct-URL/escalation) |
| G3 — Core defects | 🔴 | BUG-009, BUG-011, BUG-012 resolved & regressed |
| G4 — Core payroll browser UX | 🟠 | Run-Payroll, Reports, Payslips, Employees, Dashboard verified in browser |
| G5 — Statutory output | 🟠 | Statutory forms generated & content-verified |
| G6 — Accessibility | 🟠 | Shell violations fixed; payroll pages WCAG-scanned + keyboard pass |
| G7 — Performance | 🔴 NOT VERIFIED | Load/volume baseline at target scale |
| G8 — Integrations | 🟠 | Bank delivery, email content, finance posting verified |
| G9 — Engine regression | 🟢 | 234 PASS catalogue cases green in CI (maintain) |

## 3. Sequenced plan (dependency-ordered)

### Phase A — Unblock (Environment + Dev) · **P0 · blocks everything**
1. **Fix BUG-011** — provision the Payroll module to role accounts / auto-provision on user create. *(Dependency for B, and for G1/G2.)*
2. Fix **BUG-012** (honour admin-set password / real reset endpoint) and **BUG-009** (token → 401 not 500).
**Exit:** any role account launches Payroll.

### Phase B — Security & enforcement · **P0/P1 · depends on A**
3. Run the **ready** `role-enforcement.browser.spec.ts` for all 4 roles → observed permission matrix; clear the ~26 enforcement cases.
4. Negative/security: direct-URL, API authz bypass, privilege escalation, session expiry, CSRF/XSS, lockout, rate-limit.
**Exit:** G2 green; security backlog evidenced.

### Phase C — Core payroll browser UX · **P1 · parallel after A**
5. Browser specs (chromium + Pixel-7) for: Dashboard, Employees (CRUD/import/grid), **Run-Payroll wizard**, Approve/Pay, Payslips (download), Reports (filters/export), Loans/Benefits/Deductions UI.
6. Cross-browser smoke (Firefox/WebKit) on login + 2–3 critical flows.
**Exit:** G4 green; workflow coverage → ~85%.

### Phase D — Statutory, a11y, integration · **P2**
7. Statutory **form generation** (GRA/SSNIT outputs) content-verified; unblock protected-pay HARD config.
8. Accessibility: fix BR-001/002/003/007; axe + keyboard/SR on payroll pages; per-dialog a11y.
9. Integration: bank-file delivery, email content/delivery, finance posting, CSV/Excel import/export.
**Exit:** G5/G6/G8 green.

### Phase E — Performance · **P2/P3**
10. Load/stress/volume (large payroll 1k+, concurrent users), export/render performance, memory.
**Exit:** G7 green.

### Phase F — Certify
11. Full regression (maintain 234 PASS), reconcile, sign-off.

## 4. Critical path & dependencies

```
A (BUG-011 fix) ─┬─► B (enforcement + security)
                 ├─► C (core payroll browser UX)
                 └─► D (statutory/a11y/integration) ─► E (performance) ─► F (certify)
```
**Single most important action:** Phase A.1 — fix BUG-011. It is the gate for G1 and G2 and the long pole for certification.

## 5. What is already done (do not redo)

- API engine + lifecycle + alerts + bank/payslip content + audit + injection/tenant = **234 PASS, oracle-verified** → maintain in CI (G9 green).
- Enterprise onboarding flow (login/reset/change/business/launcher) verified end-to-end.
- Settings & Users/Roles browser coverage + IAM (create/role-assign) verified.

## 6. Readiness trajectory (evidence-based estimate)

| Milestone | Production-ready % | Confidence |
|---|---:|---|
| Today | ~55% | Medium (engine) / Low (product) |
| After Phase A | ~62% | access restored |
| After Phase B | ~75% | enforcement + security proven |
| After Phase C | ~85% | core UX proven |
| After Phase D | ~92% | statutory/a11y/integration |
| After Phase E/F | ~98%+ | certifiable |

> Percentages are planning estimates anchored to the §11 coverage figures in `reports/37`; only executed-and-evidenced results may move the "verified" numbers.
