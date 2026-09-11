# Beta Environment — Feasibility & Discovery Map

> 2026-09-08 · First access to the **BETA** payroll environment via Playwright MCP. Session persona **Broni Danso** (`dwilliametornam+32@gmail.com`), business **Glenn and Co**.

## 1. Access — CONFIRMED

| Step | Result |
|---|---|
| Client portal `https://v2.kedebahlite.com/clients/sign-in` | ✅ login OK (Email/Username + Password + "Sign In") |
| Realm path | `R-4833-O45` |
| Module launcher `/clients/select-module` | ✅ full suite ACTIVE — Administration, PIM, Project Tracker, Asset/Depot/Warehouse/Inventory Manager, Manufacturing, Retail/Wholesale, Finance, **Payroll Manager**, Procurement, HR Manager, CRM |
| Payroll app | `https://v2payroll.kedebahlite.com/dashboard` — client-side SSO handoff, ~8s cold load |
| Super-admin console | `https://v2super-admin.kedebahlite.com` (separate; `Kedebah | Admin | Sign In`) — **not the payroll test target** |

**Note:** `.env` `API_BASE_URL` (`https://sbx-payroll.kedebahlite/api/v1/payrollApi`) is the OLD sandbox host and looks malformed. Beta API base for `v2payroll` not yet confirmed — capture from network trace before any API-harness work.

## 2. Tenant state — "Glenn and Co" (near-clean)

- **Employees: 2** — `TaShya Xavier Avila Cabrera` (tesyID22, Software Engineer, Active, **Ready**) · `Broni Danso` (EMP-1, no dept, Active, **Incomplete**).
- **Pay runs: 0** (no active, no history).
- **Tax liabilities: 0** (populate after pay-run approval).
- **Budgets: 0**, **statutory contributions: 0** for current period.
- Setup wizard reports **"Payroll setup completed — you can now run payroll"**.

→ A clean tenant that is *already configured* enough to run payroll with 1 employee. Ideal for end-to-end lifecycle testing; needs test data built up (more employees, benefits, deductions) for breadth.

## 3. Navigation map (payroll app)

| Nav | Route | State on beta |
|---|---|---|
| Dashboard | `/dashboard` | Live. Cards: Budget vs Actual (yr selector), Employee Summary by employment type (donut), **Employer Cost by Tier** (statutory/pension by tier), Payroll Cost Summary (gross + employer statutory), Quick Insights. "No pay run for this period." 1 compliance alert. |
| Employees | `/employees` | Table (2). Actions: Export, Import, Add employee, Filters (Status, Departments), search, rows/page, 3 row-action icons. "Back to Settings" breadcrumb. |
| Run Payroll | `/payroll` | Tabs: Run Payroll / Payroll History. **Create Pay Run** ▾ (regular / bonus / off-cycle / termination per description). Filters: Type, Status, Pay date range. "No Active Payrolls." |
| Taxes & Forms | `/taxes` (+ submenu) | Tax-liabilities table (empty). Filters/Columns/Refresh. "Tax liabilities appear here after pay run approval → after funding & remittance → Completed." |
| Reports | `/reports` | Reports Centre. Categories: Payroll Summary (1), Statutory & Compliance (1), Variance & Analysis (1), Annual & Year-End (2), Tax & PAYE (1), Audit & Compliance (5), AI & Pr… (n). Search + popular chips. |
| Settings | `/settings` | 12 setup cards (below). |

### Settings sub-modules (12)
| Card | Route | Status on beta |
|---|---|---|
| Organization Setup | `/settings/organization` | Completed |
| Pay Schedule Setup | `/setup/cycles` | Completed |
| Tax & Statutory Setup | `/setup/statutory-rules` | Completed |
| Employee Setup | `/employees` | Completed (1/2 ready) |
| Bank Setup | `/setup/banks` | Completed |
| Finance Posting | `/setup/finance-posting` | Optional |
| Budgets | `/setup/budgets` | Optional |
| Earnings, Benefits & Deductions | `/setup/earnings-benefits-deductions` | Optional |
| Pay Groups Setup | `/setup/pay-groups` | Optional |
| Attendance Integration | `/setup/attendance-integration` | Optional |
| Users & Roles | `/settings/users` | Completed |
| Approval Setup | `/settings/approval-workflow` | Optional |

## 4. First observations (candidate findings — to verify & log)

| ID | Observation | Severity (prelim) |
|---|---|---|
| BETA-OBS-1 | Every module page renders skeleton loaders for 8–15s on cold load (Settings, Employees, Run Payroll, Taxes). Slow perceived perf. | Perf/UX Minor |
| BETA-OBS-2 | High volume of console **warnings** (100+ within a few minutes; 0 errors so far). Need to capture and classify. | Bug? — TBD |
| BETA-OBS-3 | Dashboard "Employer Cost by Tier" + "Payroll Cost Summary" wording matches the BTL review note (gross cash + employer Tier 1/2/3 only) — **verify the actual breakdown once a run exists**. | Verify |
| BETA-OBS-4 | `.env` API base URL malformed / stale for beta. | Housekeeping |

## 5. What's testable now vs blocked

- **Testable now (UI, non-destructive):** all Settings sub-modules (view + config), Employees CRUD, Reports Centre browse, feasibility of each Create-Pay-Run type, dashboard cards.
- **Testable with test-data build:** full pay-run lifecycle (regular → approve → mark paid), payslips, bank/GRA/SSNIT exports, bonus runs, combined run, budgets, penalties, bulk salary update, benefits model (BTL items 4–7).
- **Needs decision / info:** (a) is "Glenn and Co" the sanctioned mutate-freely tenant, or is there a second isolation tenant? (b) SSNIT employee-rate oracle question (5% vs 5.5%) still open — gates statutory-calc verdicts. (c) Manager/Staff role creds for enforcement testing.

## 6. Proposed execution plan

1. **Phase 0 — Baseline & config audit (no mutation):** capture beta API base + network + console; audit the 5 "Completed" setup cards against Ghana rules (esp. Tax & Statutory — PAYE bands, SSNIT tiers → settle the rate question); Reports Centre inventory; Create-Pay-Run feasibility scan.
2. **Phase 1 — Employee & config CRUD:** add QA employees (ZZQA-prefixed), benefits, deductions, pay groups, budget; verify each against oracle where money is involved. Covers PRQ-003, 006, 007, 008, 016 + BTL 4–7.
3. **Phase 2 — Pay-run lifecycle:** regular run → validation → approve → mark-as-paid (+ file upload PRQ-001) → payslips (PRQ-011) → lock (PRQ-015) → exports (PRQ-014) → tax liabilities → finance posting.
4. **Phase 3 — Bonus & combined:** bonus entry (PRQ-012) → combined regular+bonus (PRQ-013); penalties (PRQ-009).
5. **Phase 4 — Integrations / deferred:** attendance (PRQ-005), leave (PRQ-004), loans/PIM (PRQ-010), role enforcement, performance.

Every result → append-only ledger (`TC-BETA-*`) + evidence under `evidence/beta/` + 4-state reporting. Deliverable: `reports/BETA-*` series.
