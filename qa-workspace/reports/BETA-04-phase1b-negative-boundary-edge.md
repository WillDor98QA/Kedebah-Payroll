# Beta — Phase 1b: Negative / Boundary / Edge Pass

> 2026-09-08→09 · Layered coverage over the features exercised in Phase 1 (Add Employee, pay-run state machine, PRQ-001 file upload). Ledger now **39 checks — 31 PASS / 6 FAIL (candidate) / 2 NOTE**. Evidence: `evidence/beta/N01..N14*.png`.

## 1. Input validation — Add Employee (all PASS)

| Case | Result |
|---|---|
| Every step submitted blank | Per-field "…is required" errors, no advance ✅ |
| Work email `not-an-email` | "Please enter a valid email address" ✅ |
| Base salary **−1,000** and **0** | Both blocked ✅ (message reads "is required", not "must be > 0" — copy issue, BETA-F-009) |
| Base salary **250,000** | Accepted, no artificial cap ✅ |
| Bank Transfer, no bank/branch/account/name | Blocked ✅ ("Bank and branch are required" renders 3× — cosmetic dup, BETA-F-009) |
| **Duplicate Employee ID** `ZZQA-001` | `POST /employees` → **422** "The employee id has already been taken", no duplicate created ✅ — **but only caught server-side at final submit (step 6)**; a blur-check at step 1 would save the user filling all six steps. |

## 2. Boundary — PAYE (all PASS, to the cent)

**High earner GH₵ 250,000/mo** (ZZQA HighEarner) — exercises the previously-untested **25 / 30 / 35%** bands:

| Metric | Oracle | Beta |
|---|---|---|
| Employee SSNIT (5.5%) | 13,750.00 | — |
| Chargeable income | 236,250.00 | — |
| PAYE (7-band: …+16,000@25% +30,520@30% +185,833.33@35%) | 78,770.34 | — |
| **Employee statutory total** | **92,520.34** | **92,520.34** ✅ |
| **Net pay** | **157,479.66** | **157,479.66** ✅ |

Run finance journal (3 employees, total basic 258,000): PAYE 80,061.97 · Tier1 EE 14,190 (5.5%) · Tier1 ER 20,640 (8%) · Tier2 ER 12,900 (5%) — all consistent, balanced Dr = Cr = 291,540.

**All seven Ghana PAYE bands now verified** (low-earner trace 0/5/10/17.5% in Phase 1 + this).

## 3. State machine (mixed)

| Case | Result | Verdict |
|---|---|---|
| Second Regular run after September Paid | Auto-targets **next open period** (October); September cannot be re-selected | ✅ PASS (good guard) |
| Reject with empty reason | Confirm button **disabled** until a reason is typed | ✅ PASS |
| Reject with reason | Run → back to **Processed** (not deleted); dialog explains this clearly | ✅ PASS |
| Processed run, future pay date, on the **active list** | **Hidden** by the default pay-date filter → tab shows "No Active Payrolls / you don't have any payrolls in draft or approved status" | ❌ **FAIL — BETA-F-008** |
| Delete / discard a draft (BTL onboarding #2) | **No delete action** anywhere (list card or detail) | ❌ **Not built — BTL #2** |

## 4. Employment-type wiring

| Case | Result | Verdict |
|---|---|---|
| **Board-type employee**, created without applying the "Ghana Board Member" tax preset | Taxed as **regular** — full graduated PAYE (37% effective on 250k) + employee SSNIT 5.5% + employer SSNIT 13%. **No warning.** Expected: flat 20% Board WHT, SSNIT-exempt. | ❌ **FAIL — BETA-F-007** (confirms prior "employment type not wired to tax engine") |

## 5. File upload abuse (PRQ-001)

| Case | Result | Verdict |
|---|---|---|
| `.html` file as payment document | `POST /pay-runs/1/payment-documents` → **422**, no document added | ✅ PASS (server-side type check) |

Not yet tested: oversized (>10MB), 0-byte, many-files-at-once.

## 6. Security

**BETA-SEC-001 — INCONCLUSIVE.** A direct `fetch` of the payment-doc path (`/tenant/glenn_and_co/3/<file>.pdf`) returns the SPA `index.html` shell (200, text/html, 5,550 B) for every variant — with credentials, without, and for a non-existent id — so authorisation cannot be judged from outside. Re-test by capturing the actual download request when clicking the link in an unauthenticated / incognito session.

## 7. New findings this phase

| ID | Sev | Finding |
|---|---|---|
| **BETA-F-007** | Major (candidate) | Board employment type does not trigger Board tax treatment; taxed as regular PAYE + SSNIT, silently |
| **BETA-F-008** | Major (candidate) | Active pay-run list's default date filter hides processed runs with a future pay date; misleading empty state |
| **BETA-F-009** | Minor (copy) | "is required" shown for out-of-range salary values; "Bank and branch are required" renders 3× |
| **BTL #2** | Not built | No delete / discard for a payroll draft |

## 8. Dup-ID UX gap (not a defect, worth flagging)
Employee-ID uniqueness is enforced only at the final wizard step. Recommend an on-blur check at step 1.

## 9. Test data added
- Employee #4 **ZZQA HighEarner** (ZZQA-HI1, Board, GH₵ 250,000, Cash).
- Pay run **Regular Payroll · October 2026** — Processed (rejected back from Pending Approval). Not payable, not deletable. Calendar advanced to October.
