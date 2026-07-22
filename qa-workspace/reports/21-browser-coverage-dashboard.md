# 21 — Browser QA Coverage Dashboard (live)

> Phase 3 — AI Browser QA Programme. 2026-06-30. Chromium-primary + Pixel-7 mobile (per agreed matrix). Evidence under `evidence/browser/`; findings register `evidence/browser/findings.ndjson`. This dashboard is updated continuously as modules are explored.

## Milestone status

| Milestone | Status |
|---|---|
| **M0 — Harness + feasibility gate** | ✅ PROVEN |
| **M1 — Permanent framework + Settings exploration** | ▶ **In progress** (framework built; Settings hub + Organization Setup explored) |
| M2 — Rest of app + cross-cutting | ⏳ Pending |

## M1 — permanent framework built (reusable, in `automation/`)

| Component | File | Capability |
|---|---|---|
| Browser fixture | `fixtures/browser.fixture.ts` | auto-collects console/pageerror/failed+slow requests; `axe()`, `snap()`, `health()` |
| Recorder | `helpers/browser-recorder.ts` | `recordFinding()` → `evidence/browser/findings.ndjson`; `recordCase()` → master ledger (reconciles into the API dashboard) |
| App shell POM | `pages/app-shell.page.ts` | resilient `ensureReady()` (fresh login + tolerant business-select) + `go(nav)` (client-side routing) |
| Settings POM | `pages/settings.page.ts` | 10 setup cards, statuses, `openCard()` (document-order action locator) |
| Browser project | `playwright.config.ts` `browser`/`browser-mobile` | Desktop Chrome + Pixel 7, trace/video **on**, unauthenticated start |

**Auth learning (baked into the POM):** the SPA keeps the business-account token in memory (not in `storageState`), so stored state yields a stale half-auth that drops to login mid-navigation → browser specs **fresh-login each test** via `ensureReady()`.

## M1 — modules explored (with evidence)

| Module | Result | Evidence |
|---|---|---|
| **Settings hub** (`/settings`) | Renders; **10 cards + statuses captured** (Org Setup=*no badge*, Pay Schedule/Tax/Employee/Bank/EBD/Users&Roles=Completed, Finance/Pay Groups/Approval=Optional). Health **FAIL** (404). | `evidence/browser/settings/hub-desktop.png` |
| **Organization Setup** (`/settings/organization`) | **Reverse-engineered** (no API): 11 fields; sections **Organization Identity · Payroll Context · Business Address · Payroll Contact**. Renders. | `evidence/browser/organization-setup/page-desktop.png` |

**Browser cases recorded to the master ledger:** `TC-DASH-002` → **FAIL** (404 on load — was BLOCKED-Browser); `TC-ORGB-001` (new browser-only) → **PASS** (Org Setup renders). Master ledger now: 234 PASS / **1 FAIL** / 174 BLOCKED = 417.

## M1 — concrete new findings (browser-only)

| ID | Cat | Sev | Finding |
|---|---|---|---|
| BR-006 | Bug | Major | **404 on `index.global.min.css`** — a stylesheet fails to load on `/settings` and `/settings/organization` (pinned exact resource) |
| BR-007 | Accessibility | Major | Settings hub axe: button-name(critical) + **color-contrast 14 nodes** + link-name(3) + heading-order + landmark/region |
| BR-008 | UX | Minor | **Organization Setup card shows no status badge** (every other card shows Completed/Optional) |
| BR-009+ | A11y/Bug | — | Organization Setup page: 7 axe violations + same 404 |

## M0 — what was proven (with evidence)

Headless **Chromium drives the Vue SPA end-to-end**: login (`#identifier`/`#password`/Sign in) → multi-tenant **Select Business** → **/dashboard** renders fully → nav-click → **/settings** renders. Captured: `evidence/browser/_feasibility-landing.png` (full dashboard), `_feasibility-settings.png` (Settings header + cards). The `@axe-core/playwright` a11y scanner runs and returns violations; `console`/`pageerror` capture works; trace/video/screenshot artifacts are produced.

**Navigation patterns established (reusable harness rules):**
- Nav items are real `<a>` links with hrefs (`/dashboard`, `/employees`, `/run-payroll`, `/taxes-forms`(Taxes & Forms), `/reports`, `/settings`) but **icon+text** — locate by `getByRole('navigation').getByRole('link', { name: /Settings/i })`, not exact text.
- **Never hard-`goto()` a deep link** — a full reload drops the in-memory Select-Business auth and bounces to login. Navigate via **link clicks** (client-side routing).
- SPA cold-load is slow: allow ≥45s for the login form; Settings cards load lazily (skeleton state).

## M0 findings (5) — genuine browser-only discoveries (API layer cannot see these)

| ID | Category | Sev | Module | Summary |
|---|---|---|---|---|
| BR-001 | Accessibility | Critical | App Shell | Icon-only top-bar buttons/links have **no accessible name** (axe button-name + link-name) |
| BR-002 | Accessibility | Major | App Shell | **Colour-contrast** failures (axe color-contrast, 4 nodes) |
| BR-003 | Accessibility | Minor | App Shell | No single `<main>` landmark / content outside regions (axe landmark-one-main + region) |
| BR-004 | Bug | Major | App Shell | **Console 404** broken resource on every authenticated page load |
| BR-005 | Perf/UX | Minor | Settings | Setup cards stuck in **skeleton-loading** state well after header (slow per-card status fetch) |

Full metadata (steps/expected/actual/impact/root-cause/fix/evidence) in `evidence/browser/findings.ndjson` and [23-exploratory-findings-register.md](23-exploratory-findings-register.md).

## Coverage so far

| Metric | Value |
|---|---|
| Browser harness | ✅ operational (chromium + mobile projects, axe, evidence capture) |
| Pages reached in a browser | 2 (Dashboard, Settings) |
| Browser-classified TCs flipped (BLOCKED→PASS/FAIL) | 0 (M1) |
| Findings raised | 5 (3 a11y, 1 bug, 1 perf/UX) |
| Ledger impact | none yet — browser TC outcomes append in M1 |

## Next (M1, priority order)

Organization Setup → Pay Groups → Users & Roles → Approval Setup → Pay Schedule → Employee Setup → Tax & Statutory → Bank Setup → Benefits/Deductions. For each: navigate, health (console/network), axe, interactions (forms/modals/tables), responsive (mobile), keyboard/ARIA, session/refresh/deep-link/permission — recording PASS/FAIL/BLOCKED/NA + findings, updating reports 22–31.

> **Honest scope:** the feasibility gate and reusable navigation/evidence/a11y patterns are proven and the first real defects are logged. Full module-by-module browser coverage + reports 22–31 is the continuing multi-session work (M1/M2). No results or evidence are fabricated — every finding above is backed by a captured artifact.
