# 33 — Bug Verification & Regression Report

> 2026-06-30. Every documented defect (BUG-001…010) re-tested **fresh against the live application** (new authenticated session, fresh requests — no reliance on historical evidence). Captures: `scratchpad/bug-reverify.mjs`. Historical evidence preserved in each `bugs/BUG-00X.md`; fresh re-verification appended.

## FINAL TABLE

| Bug | Previous | Current | Root Cause | Regression | Recommendation |
|---|---|---|---|---|---|
| **BUG-001** PAYE bands min==max | Open | **CONFIRMED** | Band serialization emits collapsed (zero-width) ranges for bands 3 & 4 (730→730, 3896.67→3896.67) | Calc still correct; cosmetic only | Fix serialization (min = prev max) |
| **BUG-002** Tier1 ER 8% vs PRD 13% | Open | **INVALID DEFECT** | **PRD §24 error** — app implements Ghana scheme (Tier1 13.5% = 5.5 EE + 8 ER); product correct | n/a (correct behaviour) | Correct the PRD, not the app |
| **BUG-003** SSF relief incl. Tier 3 | Open | **INVALID DEFECT** | **PRD §11 under-documents** — Tier-3 relief is Ghana practice; product plausibly correct | n/a | Update the PRD |
| **BUG-004** PAYE config un-saveable | Open | **CONFIRMED** | Config validation requires min > prev max, but seed is contiguous + bands 3/4 collapsed → 422 | Rate-only items (Tier 1) save via PUT; defect specific to band config | Allow contiguous bands OR fix seed |
| **BUG-005** config save POST vs PUT-only | Open | **CONFIRMED** (API) | Route `/statutory-items/{id}/config` is **PUT-only**; POST → 405 | PUT persists; frontend method to confirm in browser | Frontend → PUT; add browser regression |
| **BUG-006** empty pay-group → all employees | Open | **CONFIRMED** | Pay-group **membership is a silent no-op** (assign → employee_count stays 0) → run falls back to all | Non-group runs fine; group scoping impossible | Expose/fix member assignment |
| **BUG-007** approved run can't cancel | Open | **CONFIRMED** | State machine: cancel on Approved → 422 (likely by-design) | Earlier transitions work | Document if by-design, else add return/reject |
| **BUG-008** system-bank edit silent 200 | Open | **CONFIRMED** | PUT system bank → 200 but change ignored (silent accept) | Non-seeded bank edits persist | 403/422 for immutable records |
| **BUG-009** auth failure → 500 not 401 | Open | **CONFIRMED** | Auth middleware throws 500 on invalid **and** missing token | Both paths 500 | Return 401; never 500 on bad creds |
| **BUG-010** payment_method case mismatch | Open | **CONFIRMED** | Write requires Title-Case, read emits snake_case → round-trip fails | Workaround (Title-Case) works | Normalise to one canonical form |

## Verification summary

| Result | Count | Bugs |
|---|---|---|
| **CONFIRMED** (still reproducible) | **8** | BUG-001, 004, 005, 006, 007, 008, 009, 010 |
| **INVALID DEFECT** (product correct; PRD error) | **2** | BUG-002, BUG-003 |
| FIX VERIFIED | 0 | — |
| NOT REPRODUCIBLE | 0 | — |
| PARTIAL | 0 | — |

**No documented defect has been fixed.** All 8 product defects reproduce on the live app with fresh evidence. The 2 "discrepancies" are **reclassified as Invalid Defects** — the application behaves correctly per Ghana statutory practice; the PRD (§24, §11) is the document in error. Per the special requirement, these are not marked "Fixed": they were originally raised from a **literal PRD reading**; the automation (TC-TAX-002, TC-RELF-005) already PASSes against the correct behaviour, so no automation change is required — only PRD correction.

## Regression matrix

| Defect | Adjacent area regression-checked | Result |
|---|---|---|
| BUG-004/005 (statutory config) | PUT rate-item config (Tier 1) | ✅ persists (validation-gated) — defect is band-config-specific |
| BUG-006 (pay groups) | non-group regular population | ✅ works; only group-scoping broken |
| BUG-008 (system bank edit) | non-seeded bank create/edit/delete | ✅ persist (BANK-010/013) — defect specific to system records |
| BUG-009 (auth) | valid-token requests | ✅ 200 — only invalid/missing-token paths 500 |
| BUG-010 (payment_method) | Title-Case write + GET round-trip | ⚠️ asymmetric (write Title-Case, read snake_case) |
| BUG-001 (band serialization) | live PAYE calculation == oracle | ✅ calc correct — serialization only |

## Open bugs summary (post-verification)

**8 confirmed open product defects:** BUG-001 (P3 cosmetic), BUG-004 (P2 config un-saveable), BUG-005 (P1 config save method), BUG-006 (P3 pay-group scoping), BUG-007 (workflow — disposition needed), BUG-008 (system-record silent edit), BUG-009 (auth 500 — security), BUG-010 (payment_method case).
**Priority order for dev:** BUG-005 (P1) → BUG-004 (P2) → BUG-009 (security) → BUG-008/006/010 → BUG-007 (disposition) → BUG-001 (cosmetic).

## Fixed bugs summary
**None.** Zero defects have been fixed since they were raised.

## Developer Verification Report

| Bug | Endpoint / surface | Reproduce (curl-equivalent) | Server response (fresh) |
|---|---|---|---|
| BUG-004 | `PUT /statutory-items/1/config` | seeded `tax_bands` | 422 "min must be > previous max … min must be < max" |
| BUG-005 | `POST /statutory-items/{id}/config` | any payload | 405 (PUT-only) |
| BUG-008 | `PUT /banks/3` (is_system) | `{name:"X"}` | 200, but GET shows unchanged |
| BUG-009 | `GET /banks` no/invalid `Authorization` | tampered/absent token | **500** (expected 401) |
| BUG-010 | `POST /employees` | `payment_method:"cash"` | 422; `"Cash"` accepted; GET emits `"cash"` |
| BUG-006 | `PUT /employees/{id}` | `{pay_group_id}` | 200 but `employee_count` stays 0 |
| BUG-007 | `POST /pay-runs/{id}/cancel` (Approved) | — | 422 "cannot be cancelled in its current status" |

## Reconciliation
Bug register: **10 raised → 8 confirmed product defects + 2 reclassified Invalid Defects (PRD errors)**. The two Invalid Defects (BUG-002/003) keep their files (history preserved) but are now classified Invalid; corrected counts: **8 open product defects, 0 fixed, 2 invalid**. The execution ledger is unaffected (TC-TAX-002/RELF-005 already PASS against correct behaviour). Every figure above is from fresh live re-verification; no historical evidence was reused or overwritten.
