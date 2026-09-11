# Beta — Phase 0: Statutory & Config Audit

> 2026-09-08 · Read-only audit of `Glenn and Co` config on beta. Evidence: `evidence/beta/07..10*.png`.

## Tax & Statutory Configuration (`/setup/statutory-rules`)

Nine tabs: Statutory Items · Eligibility · Presets · Reliefs · Filing · Penalties · Loan Rate · Voluntary Schemes · Authorities.

### Statutory Items (9)

| Item | Code | Engine | Base | Rate (config) | Status | Notes |
|---|---|---|---|---|---|---|
| PAYE (Income Tax) | `paye` | Progressive Bands | Qualifying Employment Income | **7 bands** | Mandatory | Ghana 2024 has 7 bands ✅ plausible |
| Tier 1 | `tier_1` | Percentage Split | Basic Salary | **13.5%** | Mandatory | Party: **Both**; reduces taxable income; effective 2024-01-01. EE/ER split not shown on item detail |
| Tier 2 | `tier_2` | Percentage Split | Basic Salary | **5%** | Mandatory | Reduces taxable income |
| Tier 3 | `tier_3` | Percentage Split | Basic Salary | 0% — **"No active rate"** | Configurable | ⚠️ no rate version seeded |
| Bonus Tax | `bonus_tax` | Flat | Bonus Amount | **5%** | Automatic | Ghana bonus 5% up to 15% of annual basic ✅ |
| Overtime Tax (Junior) | `overtime_junior` | Flat | Overtime Amount | 0% — **"No active rate"** | Mandatory | ⚠️ no rate version seeded (should be 5% junior) |
| Pension Excess | `pension_excess` | — | Qualifying Employment Income | 0% — **"No active rate"** | Mandatory | ⚠️ no rate version seeded |
| Board Member Tax | `board_member_tax` | Flat | Qualifying Employment Income | **20%** | Configurable | ✅ Ghana director WHT 20% |
| Casual Worker Flat Tax | `casual_flat` | Flat | Daily Pay Total | **5%** | Configurable | ✅ Ghana casual 5% |

### SSNIT employee/employer split — STILL OPEN
- The item detail for Tier 1 shows **Current Rate 13.5%**, **Contribution Party "Both"**, engine "Percentage Split" — but does **not** expose the employee 5.5% / employer 13% split on that panel. The 13.5% / 5% figures are the **destination split** (Tier 1 vs Tier 2 of the 18.5% total), not the EE/ER split.
- **Resolution path:** run one real payroll on beta with a known basic salary and read the actual employee SSNIT deduction + employer contribution from the payslip/run breakdown. That is the authoritative answer per the user's instruction ("verify against beta first"). Do this as the first money-check in Phase 1.

### Presets (2) — Board/Casual tax IS wired
- **Ghana Board Member** (Board): enroll flat 20%, exempt from 3 others. Active.
- **Ghana Casual Worker** (Casual): enroll flat 5%, exempt from 3 others. Active.
- → Applied from employee profile via "Manage Tax Setup". Addresses prior PI-2 ("employment type not wired to tax engine") **at config level** — must still verify it fires in a real run.

### Penalties (1) — PRQ-009 built
- Ghana / Pension / tiered %: **1–30d 3%, 31–60d 6%, 61–90d 9%, 91d+ 12%**, 0-day grace, effective Jan 2024 → open. "Type fallback".
- "Add penalty rule" available. PRQ-009 also wants **fixed-amount** penalties — to verify in the Add dialog.

### Loan Rate — staff-loan BIK reference (Act 896)
- **No reference rate set** → "staff-loan BIK stays at zero". Good inline guidance (12-month / 3× basic exemption). Relevant to PRQ-010 + BTL BIK item.

## Candidate findings (to log with evidence in Phase 1+)

| ID | Finding | Prelim severity |
|---|---|---|
| BETA-F-001 | 3 mandatory statutory items have **no active rate** on a tenant the wizard reports as "setup completed": Overtime Junior (should be 5%), Pension Excess, Tier 3. Payroll can be run in this state → overtime/excess/Tier-3 silently computed at 0%. | **Major** — needs confirmation a run is actually allowed & what it produces |
| BETA-F-002 | Every settings/module page shows skeleton loaders **8–30s** on cold load (Tax & Statutory took ~30s to render the items table). | Perf/UX **Major** |
| BETA-F-003 | **Icon fonts fail to load app-wide.** Console floods with `OTS parsing error: invalid sfntVersion` + `Failed to decode downloaded font` for `bootstrap-icons.woff/woff2` and `remixicon.woff/woff2/ttf` under `/build/icon-fonts/…`. Result: nav icons, button glyphs, and status icons render blank (many icon-only buttons in the accessibility tree have **no accessible name at all**). Compounds prior a11y findings BR-001/BR-007. Evidence: `evidence/beta/console-warnings.log` (122 msgs, 0 errors, ~100 font failures). | **Major** (UI + a11y) |
| BETA-F-005 | CSS files (`main-*.css`, `app-*.css`) preloaded but "not used within a few seconds" — preload misconfiguration, minor perf waste. | Minor |
| BETA-F-004 | Tier 1 detail panel does not expose the employee/employer contribution split — only the combined 13.5%. Hard for an admin to verify statutory correctness. | Minor (UX/transparency) |

## Phase 0 verdicts (4-state)

| Area | Historical | Current | Product Health | Release Readiness |
|---|---|---|---|---|
| Statutory config present & Ghana-shaped | n/a (new env) | **PASS** | NO KNOWN DEFECT | NOT VERIFIED (needs run) |
| Statutory rate completeness | n/a | **FAIL** (candidate) | OPEN — BETA-F-001 | BLOCKED |
| Board/Casual tax wiring | n/a | PASS (config) | NO KNOWN DEFECT | NOT VERIFIED (needs run) |
| Penalties (PRQ-009) | n/a | PASS (feature present) | — | NOT VERIFIED |
| Perf (page load) | n/a | **FAIL** (candidate) | OPEN — BETA-F-002 | — |

## Beta endpoints (captured from network trace)
- **API base:** `https://v2payroll.kedebahlite.com/api/v1/payrollApi` (all requests 200, no errors)
- Key routes seen: `/user`, `/organization-data`, `/dashboard/compliance-alerts`, `/statutory-items`, `/tax-setup-presets`, `/tax-reliefs`, `/filing-rules`, `/penalty-rules`, `/loan-reference-rates`, `/pay-groups`, `/authorities`, `/voluntary-scheme-configs`, `/employees/lookup-resources`, `/settings/business-currencies/details`
- `.env` `API_BASE_URL` should be updated to the above for any API-harness work.

## Next (Phase 1)
1. ~~Capture beta API base + network/console trace~~ ✅ done — BETA-F-003 = broken icon fonts.
2. Check remaining statutory tabs (Eligibility, Reliefs, Filing, Voluntary Schemes, Authorities) + the other 4 "Completed" setup cards (Org, Pay Schedule, Bank, Users&Roles).
3. Create a QA employee with a **known basic salary (GHS 3,000)**, mark payroll-ready.
4. Run a regular pay run for the current period → read PAYE + employee SSNIT + employer SSNIT → **settle the SSNIT split** and validate PAYE against `calc-oracle`.
5. From there: approval → mark-as-paid (+file upload) → payslip → lock → exports → tax liabilities.
