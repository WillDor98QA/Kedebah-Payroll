# Admin Gap Analysis — Kedebah Payroll

> **Authoritative source for remaining Admin work.** Generated 2026-06-29 from the append-only ledger `evidence/exec/records.ndjson` (reconciled), the Markdown catalogue `test-cases/**`, the permanent specs `automation/tests/**` + `helpers/tc-registry.ts`, the requirements catalogue, and the bug register. PASS-sticky policy: a historical PASS is never overwritten by a later BLOCKED.

## Reconciled partition of all 417 (current — wave 2)

| Bucket | Count |
|---|---|
| Verified PASS | 217 |
| Confirmed FAIL (standing defect) | 2 |
| **Admin automation gap (remaining backlog)** | **66** |
| Verify-only / §25-pending | 9 |
| N/A (ledger §25) | 8 |
| External — API contract (D) | 56 |
| External — Manager/Staff creds (E) | 17 |
| External — browser/UI/login (F) | 42 |
| **TOTAL** | **417 ✓** |

**Backlog trajectory: 97 (start) → 80 (wave 1) → 66 (wave 2). Total completed across waves: 33 → PASS.**
Wave 2 additions (permanent in `helpers/tc-registry.ts`, executed live, recorded): Bank 5, Loans 4, read-based 8, **Alerts 11 + EMP-validation 2 (verified vs the engine's /tax-alerts ledger), Benefits/BIK 3 (% of cash-emoluments base, BIK excluded from earnings)**. Proven BLOCKED this wave (external/depth, not "needs automation"): ALRT-004/009/010/011 (protected-pay-hard / overtime / pension-cap / benefit-threshold contracts), BIK-007 (qualifying-income base not selectable), DED-004/013 + CAL-008 (deduction %-cash / %-net calc-methods rejected by API), BEN-010/014 + DED-011 (effective-window gating needs a regular-run harness), LOAN-008/016 (paid-run harness), TAX-006 (no 2nd dated rate version).

> Live per-case truth: [coverage-dashboard.md](../test-management/coverage-dashboard.md) + [08-automation-coverage-matrix.md](08-automation-coverage-matrix.md) reconcile to **217 PASS / 2 FAIL / 190 BLOCKED / 8 N/A**.
Completed (permanent automation added to `helpers/tc-registry.ts`, executed live, recorded):
- **Bank Setup (5):** TC-BANK-007, -009, -010, -012, -013 (branch CRUD, duplicate-sort-code 422, non-seeded edit persists, delete guards)
- **Loans (4):** TC-LOAN-005, -006, -011, -012 (rate≥ref no BIK, exempt no BIK, independent multi-loan balances, combined repayment line)
- **Read-based (8):** TC-CYCLE-004, -011, TC-FORM-002, -012, TC-TAX-011, -012, TC-SEC-002, TC-CAL-013
- Proven BLOCKED this phase (remain in backlog, automation-depth not external): TC-LOAN-008, -016 (need paid-run harness), TC-TAX-006 (no 2nd dated rate version seeded).

> The Part 3 enumeration below was authored at the start of this phase (88 rows). The 8 read-based cases above are now PASS; the live per-case truth is in [coverage-dashboard.md](../test-management/coverage-dashboard.md) and [08-automation-coverage-matrix.md](08-automation-coverage-matrix.md), which reconcile to 201 PASS / 3 FAIL / 205 BLOCKED / 8 N/A.

---

## PART 4 — Blocker categories (refined with live discovery)

Discovery this phase confirmed real API routes: `/employer-loans`, `/banks`, `/bank-branches`, `/statutory-items` (+`/eligibility-rules`, `/rate-versions`), `/tax-reliefs`, `/tax-alerts`, `/pay-runs/{id}/{employees,process,process-validation,cancel,audit-logs}`, `/benefits`, `/deductions`, `/employees`. Routes that resolve to SPA-HTML (no API contract) at every probed name: relief→employee assignment, statutory exemption/override/preset, pay-run adjustments, bank-file/payment-file export, admin payslip listing (only self-service `/my/payslips` exists).

| Cat | Meaning | Count | Notes |
|---|---|---|---|
| **A** | Executable immediately (impl exists) | 0 | all impl'd cases already ran |
| **B** | Needs additional automation only | ~53 | contract exists; craft scenario + assert |
| **C** | Needs Page Object updates | 0 | no partial page objects pending |
| **D** | Needs API contract (proven unexposed) | ~24 | relief-assignment, exemption/override/preset, adjustments, payment-file |
| **E** | Needs Manager/Staff credentials | 3 | TC-AUTH-017, TC-SLIP-011, TC-SLIP-012 (self-service / non-admin) |
| **F** | Needs browser-only execution | ~5 | bank-file/MoMo/cash export rendered client-side |
| **G** | Genuine product defect | 3 | TC-AUTH-013, TC-SEC-010, TC-TAX-002 (BUG-009 + injection + Tier-rate) |
| | **Total non-PASS (excl. 9 verify-only + 8 N/A)** | **88 + 3 = 91** | (88 gap + 3 defect) |

> Category counts for the 88 gap cases are the engineering estimate after discovery; the exact D/E/F reclassification is finalised per case in Part 3 below. The 9 verify-only/§25-pending and 8 N/A are documented gaps, not work.

---

## PART 3 — Every remaining Admin case (individually, once)

Effort: **S** = read/assert against existing data or single CRUD; **M** = craft scenario (create + process + assert); **L** = multi-step persona / full paid lifecycle. Executable-today: **Y** = contract proven available; **N** = needs external dependency first.

### Alerts (ALRT) — 15 · all NOT AUTOMATED
| TC | Req | Description | Status | Why not PASS | Exec today | Effort | Dependency |
|---|---|---|---|---|---|---|---|
| TC-ALRT-001 | REQ-ALRT-002 | Hard block: missing income-tax engine | BLOCKED | no impl; needs persona with no PAYE engine | Y | M | craft incomplete employee → process → read errors |
| TC-ALRT-002 | REQ-ALRT-004 | Hard block | BLOCKED | no impl | Y | M | persona crafting |
| TC-ALRT-003 | REQ-ALRT-005 | Hard block | BLOCKED | no impl | Y | M | persona crafting |
| TC-ALRT-004 | REQ-ALRT-003 | Hard block | BLOCKED | no impl | Y | M | persona crafting |
| TC-ALRT-005 | REQ-ALRT-003 | Warning; paid | BLOCKED | no impl | Y | M | soft-warning persona |
| TC-ALRT-006 | REQ-ALRT-006 | Warning; PAYE still computes | BLOCKED | no impl | Y | M | soft-warning persona |
| TC-ALRT-007 | REQ-ALRT-007 | Warning (computed vs applied) | BLOCKED | no impl | Y | M | `/tax-alerts` read |
| TC-ALRT-008 | REQ-ALRT-008 | Warning | BLOCKED | no impl | Y | M | `/tax-alerts` read |
| TC-ALRT-009 | REQ-ALRT-009 | Warning | BLOCKED | no impl | Y | M | `/tax-alerts` read |
| TC-ALRT-010 | REQ-ALRT-010 | Warning | BLOCKED | no impl | Y | M | `/tax-alerts` read |
| TC-ALRT-011 | REQ-ALRT-011 | Warning | BLOCKED | no impl | Y | M | `/tax-alerts` read |
| TC-ALRT-012 | REQ-ALRT-012 | Warning | BLOCKED | no impl | Y | M | `/tax-alerts` read |
| TC-ALRT-013 | REQ-ALRT-013 | Warning | BLOCKED | no impl | Y | M | `/tax-alerts` read |
| TC-ALRT-014 | REQ-ALRT-001 | Hard vs soft routing | BLOCKED | no impl | Y | L | mixed persona |
| TC-ALRT-016 | REQ-ALRT-001 | Consolidated alerts on run | BLOCKED | no impl | Y | M | `/tax-alerts?pay_run_id` |

### Authentication (AUTH) — 1
| TC-AUTH-017 | REQ-AUTH-010 | API enforcement despite hidden UI | BLOCKED | proving UI-hidden-but-API-enforces needs a restricted (non-admin) role | **N** | M | **E: Manager/Staff credentials** |

### Benefits (BEN) — 6
| TC-BEN-007 | REQ-CAT-003 | Calc: % of Cash Emoluments | BLOCKED | benefit calc_method for cash-emoluments base not yet confirmed | Y | M | discover `/benefits` calc_method enum |
| TC-BEN-010 | REQ-CAT-005 | Effective window (catalog) | BLOCKED | effective-date fields on benefit not confirmed | Y | M | discover effective_from/to on assignment |
| TC-BEN-011 | REQ-CAT-006 | Inactive item skipped | BLOCKED | create inactive benefit previously rejected | Y | S | retry status=inactive on `/benefits` |
| TC-BEN-012 | REQ-CAT-007 | Alert threshold breach | BLOCKED | benefit threshold + warning surfacing unconfirmed | Y | M | `alert_thresholds` field |
| TC-BEN-013 | REQ-CAT-012 | Scope to department | BLOCKED | dept-scope field on benefit unconfirmed | Y | M | discover scope field |
| TC-BEN-014 | REQ-CAT-013 | Per-employee override window | BLOCKED | per-employee override + dates unconfirmed | Y | M | discover override contract |

### Benefits in Kind (BIK) — 6
| TC-BIK-003 | REQ-BIK-002 | Value = rate% × base | BLOCKED | percentage_of_basic BIK create returned reject earlier | Y | S | retry bikCheck % method |
| TC-BIK-005 | REQ-BIK-003 | Base = Cash Emoluments excl BIK | BLOCKED | BIK base-type field unconfirmed | Y | M | discover base_amount_type |
| TC-BIK-007 | REQ-BIK-003 | Base = Qualifying Employment Income | BLOCKED | BIK base-type field unconfirmed | Y | M | discover base_amount_type |
| TC-BIK-012 | REQ-BIK-006 | BIK excluded from payslip earnings | BLOCKED | payslip earnings section is client-rendered | partial | M | breakdown assert (no payslip API) |
| TC-BIK-013 | REQ-BIK-007 | Country-scoped BIK match | BLOCKED | scope field unconfirmed | Y | M | discover scope |
| TC-BIK-014 | REQ-BIK-007 | Auto-enrolled BIK no per-employee row | BLOCKED | auto-enroll scope unconfirmed | Y | M | discover auto-enroll |

### Calculation Engine (CAL) — 8
| TC-CAL-001 | REQ-CAL-001 | Basic per compensation type | BLOCKED | daily/hourly comp not settable via `/salary` (known gap) | **N** | M | **D: daily/hourly contract** |
| TC-CAL-008 | REQ-CAL-005 | %-of-net deferred to pass 2 | BLOCKED | needs %-of-net deduction + pass inspection | Y | M | mkDeduction percentage_of_net |
| TC-CAL-009 | REQ-CAL-006 | Ad-hoc earnings + dedupe | BLOCKED | pay-run adjustment route not exposed | **N** | M | **D: adjustments contract** |
| TC-CAL-010 | REQ-CAL-006 | Catalog-linked no-amount inherits | BLOCKED | adjustment route not exposed | **N** | M | **D: adjustments contract** |
| TC-CAL-012 | REQ-CAL-008 | Ad-hoc deductions w/ treatment | BLOCKED | adjustment route not exposed | **N** | M | **D: adjustments contract** |
| TC-CAL-013 | REQ-CAL-009 | Tax pipeline order a→j | BLOCKED | readable from `paye_band_trace`/breakdown | Y | S | assert breakdown trace order |
| TC-CAL-015 | REQ-CAL-011 | %-of-net second pass | BLOCKED | %-of-net deduction inspection | Y | M | mkDeduction percentage_of_net |
| TC-CAL-024 | REQ-CAL-007/012 | End-to-end integration persona | BLOCKED | composite persona | Y | L | multi-component employee |

### Calendar (CYCLE) — 2
| TC-CYCLE-004 | REQ-CYCLE-003 | Pay date offset | BLOCKED | read pay-date vs period-end from `/payroll-periods` | Y | S | assert offset |
| TC-CYCLE-011 | REQ-CYCLE-009 | Create-run default = Current | BLOCKED | assert default period on `/pay-runs` create | Y | S | create-run inspect |

### Dashboard (DASH) — 1
| TC-DASH-003 | REQ-DASH-001 | Permission-appropriate widgets | BLOCKED | per-role widget gating needs non-admin | **N** | S | **E: Manager/Staff credentials** |

### Deductions (DED) — 4
| TC-DED-004 | REQ-CAT-009 | Calc: % of Cash Emoluments | BLOCKED | cash-emoluments method unconfirmed | Y | M | discover deduction calc_method |
| TC-DED-010 | REQ-CAT-012 | Eligibility scope | BLOCKED | scope field unconfirmed | Y | M | discover scope |
| TC-DED-011 | REQ-CAT-013 | Override window | BLOCKED | override dates unconfirmed | Y | M | discover override |
| TC-DED-013 | REQ-CAT-009 | %-of-net not in pass 1 | BLOCKED | %-of-net pass inspection | Y | M | mkDeduction percentage_of_net |

### Employees (EMP) — 6
| TC-EMP-007 | — | (validation) | BLOCKED | no impl | Y | M | process-validation read |
| TC-EMP-012 | REQ-EMP-007 | Missing quantity → error | BLOCKED | needs incomplete comp employee | Y | M | `/pay-runs/{id}/process-validation` |
| TC-EMP-023 | REQ-EMP-014 | Mid-cycle date warns | BLOCKED | hire-date mid-period employee | Y | M | process-validation warnings |
| TC-EMP-032 | REQ-EMP-020 | Missing TIN warns only | BLOCKED | employee w/o TIN → warning | Y | M | process-validation warnings |
| TC-EMP-033 | REQ-EMP-020 | Missing mandatory statutory blocks | BLOCKED | employee w/o statutory → error | Y | M | process-validation errors |
| TC-EMP-034 | REQ-EMP-021 | Exclude incomplete on Process | BLOCKED | exclude_incomplete_employees flag | Y | M | process with exclude flag |

### Forms & Filings (FORM) — 2
| TC-FORM-002 | REQ-FORM-001 | Due dates from filing rules | BLOCKED | `/tax-forms` readable (FORM-010 passes) | Y | S | assert due dates |
| TC-FORM-012 | REQ-FORM-001 | Liability amounts re-derived | BLOCKED | `/tax-forms` readable | Y | M | assert liability vs oracle |

### Lifecycle (LIFE) — 6
| TC-LIFE-004 | REQ-LIFE-001 | Return to previous stage | BLOCKED | transition endpoint set unconfirmed | Y | M | discover `/pay-runs/{id}/{action}` |
| TC-LIFE-005 | REQ-LIFE-002 | Draft editable + live preview | BLOCKED | draft edit/preview | Y | M | pay-run update |
| TC-LIFE-009 | REQ-LIFE-003 | Hard blockers stop affected only | BLOCKED | partial-block persona | Y | L | mixed persona run |
| TC-LIFE-011 | REQ-LIFE-004 | Reject requires reason | BLOCKED | reject transition + reason | Y | M | `/pay-runs/{id}/reject` |
| TC-LIFE-016 | REQ-LIFE-007 | Mark Paid side-effects | BLOCKED | full paid lifecycle | Y | L | paid-run harness |
| TC-LIFE-017 | REQ-LIFE-007 | Mark Paid non-regular | BLOCKED | full paid lifecycle | Y | L | paid-run harness |

### Loans (LOAN) — 5 (impl present; need paid-run depth)
| TC-LOAN-008 | REQ-LOAN-003 | Repayment clamped to balance | BLOCKED | repayment line not surfaced on off-cycle process (proven) | Y | M | paid-run harness |
| TC-LOAN-010 | REQ-LOAN-005 | Mark Paid decrements by actual | BLOCKED | balance only decrements on paid run | Y | M | paid-run harness |
| TC-LOAN-013 | REQ-LOAN-004 | Auto-stop when repaid | BLOCKED | needs payoff via paid run | Y | M | paid-run harness |
| TC-LOAN-014 | REQ-LOAN-004 | Continue while balance remains | BLOCKED | needs paid run | Y | M | paid-run harness |
| TC-LOAN-016 | REQ-LOAN-002 | Loan BIK value re-derived | BLOCKED | concessional BIK not surfaced on off-cycle (proven) | Y | M | regular/paid run + oracle |

### Payments (PAYM) — 5
| TC-PAYM-003 | REQ-PAYM-002 | Bank file structure | BLOCKED | bank-file export client-rendered (no API route) | partial | M | **F/D: export contract** |
| TC-PAYM-007 | REQ-PAYM-005 | MoMo rows in file | BLOCKED | export client-rendered | partial | M | **F/D: export contract** |
| TC-PAYM-008 | REQ-PAYM-006 | Cash excluded | BLOCKED | export client-rendered | partial | M | **F/D: export contract** |
| TC-PAYM-014 | REQ-PAYM-011 | Per-employee payment status | BLOCKED | payment-status route unconfirmed | Y | M | discover payment status route |
| TC-PAYM-015 | REQ-PAYM-011 | Mark all as paid | BLOCKED | mark-paid route via lifecycle | Y | M | paid-run harness |

### Reliefs (RELF) — 5
| TC-RELF-001 | REQ-RELF-001 | Fixed Annual ÷ 12 = 100 | BLOCKED | relief→employee assignment not API-exposed | **N** | M | **D: relief-assignment contract** |
| TC-RELF-002 | REQ-RELF-002 | Per-Unit × units ÷ 12 | BLOCKED | assignment not exposed | **N** | M | **D: relief-assignment contract** |
| TC-RELF-003 | REQ-RELF-002 | Per-Unit cap at max units | BLOCKED | assignment not exposed | **N** | M | **D: relief-assignment contract** |
| TC-RELF-004 | REQ-RELF-003 | % assessable income | BLOCKED | assignment not exposed | **N** | M | **D: relief-assignment contract** |
| TC-RELF-007 | REQ-RELF-006 | Per-employee assignment | BLOCKED | assignment not exposed | **N** | M | **D: relief-assignment contract** |

### Run Types (RUN) — 3
| TC-RUN-010 | REQ-RUN-005 | Default pays only entered amounts | BLOCKED | adjustment/entry route | Y | M | discover entry contract |
| TC-RUN-019 | REQ-RUN-008 | Entitlements/recoveries as adjustments | BLOCKED | adjustments route not exposed | **N** | M | **D: adjustments contract** |
| TC-RUN-022 | REQ-RUN-008 | Termination loans resolve | BLOCKED | termination-run + loan payoff | Y | L | termination paid run |

### Security (SEC) — 1
| TC-SEC-002 | REQ-SEC-001 | API perm matrix — create/edit/delete | BLOCKED | admin-side matrix readable (like AUTH-013) | Y | S | assert admin CRUD perms |

### Payslips (SLIP) — 2
| TC-SLIP-011 | REQ-SLIP-009 | List own payslips | BLOCKED | only self-service `/my/payslips` exists | **N** | S | **E: Staff credentials** |
| TC-SLIP-012 | REQ-SLIP-009 | Current payslip | BLOCKED | self-service only | **N** | S | **E: Staff credentials** |

### Special Tax (STAX) — 1
| TC-STAX-005 | REQ-STAX-003 | Fully over cap | BLOCKED | needs bonus run fully over 15% cap | Y | M | craft over-cap bonus run |

### Tax (TAX) — 9
| TC-TAX-006 | REQ-TAX-003 | Calc uses dated rate | BLOCKED | `/statutory-items/{id}/rate-versions` readable | Y | S | assert dated rate |
| TC-TAX-009 | REQ-TAX-004 | Resolver — explicit exempt subtracts | BLOCKED | exemption write route not exposed | **N** | M | **D: exemption contract** |
| TC-TAX-010 | REQ-TAX-005 | No income-tax engine → hard block | BLOCKED | all employees auto-enroll PAYE by country scope | Y | L | craft no-PAYE persona |
| TC-TAX-011 | REQ-TAX-006 | Eligibility OR combination | BLOCKED | `/statutory-items/{id}/eligibility-rules` readable | Y | S | assert OR rules |
| TC-TAX-012 | REQ-TAX-006 | Eligibility scope negative | BLOCKED | eligibility-rules readable | Y | S | assert non-match |
| TC-TAX-013 | REQ-TAX-007 | Tax preset one-click | BLOCKED | preset route not exposed | **N** | M | **D: preset contract** |
| TC-TAX-014 | REQ-TAX-008 | Per-employee rate override | BLOCKED | override route not exposed | **N** | M | **D: override contract** |
| TC-TAX-015 | REQ-TAX-009 | Voluntary Tier 3 scheme | BLOCKED | scheme enrollment route not exposed | **N** | M | **D: enrollment contract** |
| TC-TAX-016 | REQ-TAX-010 | Exemption requires reason | BLOCKED | exemption write route not exposed | **N** | M | **D: exemption contract** |

### Confirmed defects (G) — 3 (not "needs automation"; need a dev fix)
| TC-AUTH-013 | REQ-AUTH-007 | Admin full access | FAIL | some modules return HTTP 500 (BUG-009 family) | — | — | dev fix |
| TC-SEC-010 | REQ-SEC-010 | Reflected XSS via params | FAIL | reflected/500 on malformed input | — | — | dev fix |
| TC-TAX-002 | REQ-TAX-002 | Statutory seed | FAIL | Tier-rate discrepancy (BUG-002) | — | — | dev fix |

---

## Test Data Register (AIQA_ / ZZQA artifacts)

Automation creates isolated records prefixed `AIQA_` (banks/branches/loans) or `ZZQA`/`ZZ-QA` (employees/benefits/deductions/runs). Cleanup behaviour:
- **Banks / bank-branches / employer-loans:** hard-deleted in-test (DELETE → 204). No residue.
- **Pay-runs:** cancelled in-test (`/pay-runs/{id}/cancel`). Remain as cancelled drafts (no hard-delete API).
- **Employees:** no hard-delete API → deactivated in `afterAll` (renamed `ZZQA-DEACTIVATED`, status inactive). Residual inactive employees accumulate; these are the only persistent artifacts and are inert.
- **Benefits / deductions:** hard-deleted in-test where created.

**Residual artifacts to track:** cancelled `AIQA_*` / `ZZ-QA Live` pay-runs and `ZZQA-DEACTIVATED` employees in the William & Co sandbox. No production-affecting data created.

---

## Reconciliation

193 PASS + 3 FAIL + 88 admin-gap + 9 verify-only + 8 N/A + 54 (D) + 20 (E) + 42 (F) = **417** ✓ — matches `evidence/exec/records.ndjson` (1271 records) and `test-management/coverage-dashboard.md`.
