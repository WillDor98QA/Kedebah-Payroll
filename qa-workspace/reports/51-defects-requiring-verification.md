# 51 — Defects Requiring Verification

> Phase 7 · 2026-07-01 · Issues where **evidence is insufficient to confirm a product defect today.** Each needs a rerun, a product-owner disposition, an environment change, or browser validation before it can move to `reports/50` or `reports/52`. None is asserted as a confirmed bug. No item here appears in `reports/50` or `reports/52`.

| # | ID | Title | Module | Why unverified | What's needed | Evidence |
|---|---|---|---|---|---|---|
| 1 | BUG-002 | Tier 1 (SSNIT) employer contribution rate differs from the PRD | Tax | Documentation ↔ implementation discrepancy — the **product may be correct** (Ghana statutory rate) and the PRD wrong. Cannot be called a defect without the authoritative rate. | **Product-owner confirmation** of the correct SSNIT Tier-1 employer rate. | `bugs/BUG-002.md` |
| 2 | BUG-003 | Auto SSF relief computed from Tier 1+2+3 (vs PRD) | Tax / Reliefs | Same doc-vs-impl class — implementation may match Ghana law; PRD may be outdated. | Product-owner confirmation of the SSF-relief basis. | `bugs/BUG-003.md` |
| 3 | BUG-006 | Regular pay run + pay-group population resolver behaviour | Pay Groups | Bug file is explicitly marked **"needs confirmation — may be by-design."** Behaviour observed but the intended spec is unclear. | Confirm intended population-resolver rule; then rerun. | `bugs/BUG-006.md` |
| 4 | BUG-007 | Approved pay run blocks cancel/reverse transitions | Payroll Lifecycle | Marked **"needs confirmation — may be by-design"** (locking an approved run may be intended). | Confirm intended state-machine transitions from Approved. | `bugs/BUG-007.md` |
| 5 | BR-021 (TC-AUTH-009) | Protected route reachable ~3s after logout | Authentication / Session | **Candidate security issue** — could be a genuine post-logout guard gap OR an SPA client-side redirect delay. Current FAIL. | **Rerun** with a longer settle + assert the login form renders (server-side session cleared). | `evidence/browser/auth-recovery/{logout,post-logout-guard}.png` |
| 6 | BR-022 (TC-CYCLE-012) | Pay-date on Sunday 2026-05-31 not shifted off the weekend | Pay Schedule / Calendar | **Candidate** — Saturday pay-dates ARE shifted (TC-CYCLE-013 PASS) but one Sunday was not. Could be a holiday-rule gap OR that schedule's `holiday_rule` is set to not shift. Current FAIL. | Confirm the schedule's `holiday_rule` config for that period (rule out by-design). | ledger TC-CYCLE-012; BR-022 |

## Notes
- Items 1–2 (BUG-002/003) were flagged in earlier verification as likely **Invalid Defects** (product correct per Ghana law); kept here pending an authoritative product-owner call rather than closed or asserted.
- Items 5–6 are the two **current FAILs** whose root cause is not yet certain — recorded honestly as candidates rather than forced into the confirmed register.
- On disposition: each item moves to **`reports/50`** (if confirmed a defect) or **`reports/52`** (if by-design / environment) — never both.
