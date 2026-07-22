# 40 — BLOCKED-Case Recovery (Phase 6, forensic)

> 2026-06-30 · Forensic reclassification + recovery. Evidence-driven, no reliance on historical summaries. Sources: `evidence/exec/records.ndjson`, `automation/helpers/tc-registry.ts`, browser specs/findings, bugs, requirements. The enterprise SSO is now understood and admin credentials validated — so previous BLOCKED reasons were re-examined live.

## STEP 1 — Enumeration of BLOCKED cases (by reason)

**196 BLOCKED tcIds** (174 catalogue + 22 exploratory) at the start of this phase.

| Reason group | Count | Nature |
|---|---:|---|
| Missing API Contract | 73 | Write/assign endpoints not exposed (membership, reliefs, exemptions, presets, overrides, protected-pay) |
| Missing automation (pending implementation) | 50 | Catalogue cases never ported into the test registry (mostly TC-AUTH-*) |
| Browser-only | 33 | UI tests needing a Playwright path |
| Missing Credentials / Persona | 23 | Per-role / self-service needing a non-admin session |
| Missing Module Access | 11 | Payroll module entitlement (enterprise launcher) |
| Infrastructure / Environment | ~6 | Shared-sandbox multi-run isolation; missing seed data |

## STEP 2 — Which reasons are now obsolete?

The enterprise architecture changed; assumptions were re-tested **live**:

- **"Missing Credentials" → OBSOLETE.** All four role credentials are validated (Admin/Manager/Reports/Employee log in; passwords established — `reports/35`). Credentials are no longer the blocker.
- **BUT the gating blocker moved, it did not disappear.** Per-role/self-service execution needs a **Payroll module session**, and **BUG-011 (Critical)** leaves every role account with an empty Module Launcher → no Payroll entry. So the 23 credential cases + 11 module cases are **STILL BLOCKED**, now under the corrected reason **"no Payroll module entitlement (BUG-011)"**.
- **"Missing API Contract" → re-confirmed STILL BLOCKED (fresh live evidence).** Re-probed every endpoint as admin on **2026-06-30T19:07** — all absent: `GET …/members, /employee-reliefs, /employee-exemptions, /statutory-presets, /…-overrides, /protected-pay-rules → 200 SPA-HTML` (no API route); `POST → 405`. The mid-engagement subscription renewal did **not** add these contracts.
- **Authentication (SSO) → genuinely RECOVERABLE.** With the enterprise login understood, the "pending implementation" AUTH cases became executable.

## STEP 3/4 — Recovery executed (this phase)

Ran `tests/browser/auth-recovery.browser.spec.ts` against the enterprise portal (evidence `evidence/browser/auth-recovery/*.png`):

| TC | Scenario | Result |
|---|---|---|
| TC-AUTH-002 | Login by **username** (`pawilliamcoenterprises`) | ✅ **PASS** (recovered) |
| TC-AUTH-005 | Token persisted (cookie `kedebah_session`) | ✅ **PASS** (recovered) |
| TC-AUTH-010 | Wrong password rejected | ✅ **PASS** (recovered) |
| TC-AUTH-011 | Unknown identifier rejected | ✅ **PASS** (recovered) |
| TC-AUTH-012 | Empty-field validation | ✅ **PASS** (recovered) |
| TC-AUTH-003 | Login by **10-digit phone** (`0200720509`) | ⛔ **STILL BLOCKED** — identifier rejected; needs product confirmation whether phone login is supported (candidate gap, not asserted as a defect without confirmation) |

**5 cases recovered BLOCKED → PASS.** Canonical reconciles: PASS **234 → 239**, BLOCKED **174 → 169**, FAIL 1, N/A 8 = 417.

## STEP 6 — Product issues found during recovery
None turned a BLOCKED into a confirmed FAIL this phase. TC-AUTH-003 (phone login) is logged as still-blocked with evidence pending product confirmation (no bug raised without confirmation).

## Outcome
The SSO/credential change recovered the **authentication** backlog (5 cases) but did **not** recover the rest: the gating blockers are unchanged — **BUG-011 module access**, **absent API contracts** (re-confirmed live), **missing automation**, and **shared-sandbox infrastructure**. See `reports/41` for the full per-case reclassification and `reports/42` for the execution summary.
