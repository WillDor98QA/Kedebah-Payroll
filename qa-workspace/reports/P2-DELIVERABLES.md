# P2 Deliverables — Payroll Sprint Backlog Status

> 2026-09-08 · Status snapshot from stakeholder review. Source: PRD PRQ-001…016 (see [Payroll_Sprint_Review_Backlog.md](../docs/Payroll_Sprint_Review_Backlog.md)) and the QA [TEST-PLAN-sprint-backlog.md](TEST-PLAN-sprint-backlog.md).
>
> **Reading note:** ✅ / "DONE" below = **product/dev build status** (dev believes the feature is shipped). It is **not** a QA verdict. QA verification runs the feasibility gate then full test execution against the live app; results are recorded separately in the append-only ledger and `reports/sprint-backlog-certification.md`.

---

## 1. Summary

| Bucket | Count | PRQs |
|---|---:|---|
| Built — ready for QA verification | 12 | 001, 003, 006, 007, 008, 009, 011, 012, 013, 014, 015, 016 |
| Genuine to-be-done | 4 | 002, 004, 005, 010 |
| **Total in scope** | **16** | PRQ-001…016 |

PRQ-002 was previously excluded from the QA test plan by decision; it is now **TBD if necessary**.

---

## 2. Built — ready for QA verification

| PRQ | Feature | Build | QA status |
|---|---|:--:|---|
| **001** | File upload on Mark-as-Paid + payroll history summary | ✅ | Not verified — pending feasibility gate + execution |
| **003** | Standard benefits policy list (Ghana jurisdiction) | ✅ | Not verified |
| **006** | Dynamic payment-frequency periods at setup | ✅ | Not verified |
| **007** | Payroll budget setup + processing-amount deviation-trend dashboard | ✅ | Not verified |
| **008** | Employee summary dashboard by employee type | ✅ | Not verified |
| **009** | Penalties by amount and percentage in Tax & Statutory Setup | ✅ | Not verified |
| **011** | Payslip download (individual + bulk) | ✅ | Not verified |
| **012** | Dynamic bonus entry (varying amounts per employee) | ✅ | Not verified |
| **013** | Combined Regular + Bonus payroll run | ✅ | Not verified — depends on 012 |
| **014** | Bank payment file export, GRA PAYE schedule & SSNIT export | ✅ | Not verified |
| **015** | Payroll lock after approval | ✅ | Not verified |
| **016** | Bulk salary update tool | ✅ | Not verified |

---

## 3. Genuine to-be-done

| PRQ | Feature | Status / next step | Deadline |
|---|---|---|---|
| **002** | Third-party tax payment file **import** (GRA, SSNIT, Petra) | **TBD if necessary** — decision pending on whether this is in scope | — |
| **004** | Leave policy setup + with/without-pay integration with payroll | **Further discussion needed** — parked pending scope clarification | — |
| **005** | Attendance integration + automated insertion & review action | **Further discussion needed** — parked pending scope clarification | — |
| **010** | Loan & salary advance initiation from staff PIM · HR loan-management view · payroll integration · loan approval workflow | **Ongoing — closure targeted Friday EOD** | Fri EOD |

---

## 4. Review note — Dashboard cost summary

The dashboard **cost summary** must show **only**:

- **Gross Salary (Cash)**
- **Employer pension contributions** — Tier 1 (8%), Tier 2 (5%), Tier 3

✅ Confirmed / actioned.

QA check: verify the dashboard cost-summary breakdown contains exactly these lines and no others (no employee-side deductions, no PAYE, no net). Fold into PRQ-007 (deviation dashboard) and PRQ-008 (employee summary dashboard) coverage.

---

## 5. QA implications

1. **Scope shift** — the QA test plan (2026-08-17 draft) treated all 15 items as unconfirmed. 12 are now dev-complete → go straight from feasibility scan to full execution on those.
2. **Parked items** — PRQ-004, PRQ-005, and PRQ-002 move to "blocked pending decision"; no test-case design effort until scope is settled.
3. **Priority** — PRQ-010 is the near-term deadline (Friday EOD); sequence its verification first among the to-be-done set.
4. **Pre-req unchanged** — the SSNIT employee-rate discrepancy (5% app vs 5.5% oracle) still gates every statutory-calc verdict (PRQ-003, 009, 013, 014).
5. **Environment** — verification runs against enterprise portal → **Mary and Co** (owner `eetornam5@gmail.com`), Payroll API `payroll.kedebah.com`; **Sam & Sons** available as the second isolated tenant.

---

## 6. Payroll updates arising from BTL onboarding

Field-driven change requests / defects surfaced during the BTL client onboarding. ✅ = dev fix applied (not QA-verified).

| # | Item | Type | Build | QA status / notes |
|---|---|---|:--:|---|
| 1 | Pay period compulsory fix — cannot select previous dates | Fix | ✅ | Not verified — check boundary: today, first-of-period, and a back-dated date are all rejected; confirm no regression to legitimate current-period selection. Relates to PRQ-006. |
| 2 | Delete payroll drafts | Feature | 🔄 | Not built. Verify a draft run can be deleted; approved/paid runs cannot. Relates to PRQ-015 (lock after approval). |
| 3 | Inactive-on-payroll employee still included in pay run | Bug | ✅ | Not verified — run a pay cycle with an employee set inactive; confirm they are excluded from calc, totals, bank file, and payslips. |
| 4 | Benefits not showing under employee automatically after creating + adding to that employee | Bug | 🔄 | Not fixed. Create a benefit, assign to a specific employee, confirm it appears on the employee record and applies in the next run. Relates to PRQ-003. |
| 5 | Bulk adjustment for benefits — bulk-adjust cash benefits where each staff has a different entitlement amount | Feature | 🔄 | Not built. Overlaps PRQ-016 (bulk salary update) and PRQ-012 (per-employee entry table pattern). |
| 6 | Single reusable cash-benefit/allowance allocated to each staff with a per-staff amount (instead of creating an individual benefit each time) | Feature | 🔄 | Not built. One benefit definition, per-employee amount override. Design overlaps items 4 & 5. |
| 7 | Benefits-in-Kind seeding | Feature | 🔄 | Not built. Pre-load standard Ghana Benefits-in-Kind (accommodation, vehicle, etc.) with correct taxability. Relates to PRQ-003. |

**Cluster note:** items 4, 5, 6, 7 are all **benefits-model gaps** — assignment visibility, per-employee amounts, bulk adjustment, and BIK seeding. Worth verifying as one workstream against PRQ-003, and reconciling with the known pay-group / silent-accept anti-pattern findings before design sign-off.
