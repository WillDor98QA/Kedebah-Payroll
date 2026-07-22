# Kedebah Payroll — Playwright Automation Suite

TypeScript + Playwright, Page Object Model. Every spec traces to a requirement (`REQ-*`) and test
case (`TC-*`); see `../requirements/01-traceability-matrix.md`.

## Status

The suite is **fully scaffolded**. The **calculation oracle unit tests run today with no app**.
All browser/API specs **self-skip** until a real target + credentials are configured — they will
never fabricate results.

## Layout

```
automation/
├── config/        env.ts — reads .env; isAppConfigured guard
├── pages/         Page Objects (base.page, login.page, …)  ← selectors are placeholders pre-app
├── fixtures/      auth.setup.ts (per-role login → storage state); roles.fixture.ts
├── helpers/       api-client.ts (security-boundary + calc verification)
├── utils/         calc-oracle.ts ★, money.ts, date-helpers.ts, xlsx-helpers.ts, pdf-helpers.ts
├── tests/
│   ├── unit/      calc-oracle.spec.ts  ← runnable NOW (no browser/app)
│   ├── authentication/  login.spec.ts
│   ├── payroll/   paye-engine.spec.ts
│   └── security/  permissions.spec.ts
├── playwright.config.ts   projects: unit, setup, chromium, firefox, webkit, mobile
└── package.json
```

★ `calc-oracle.ts` independently re-implements the PRD's statutory math (PAYE bands, Tier 1/2,
reliefs, BIK, bonus marginal method, overtime junior/senior, pension 35% cap). Calculation specs
assert `engine snapshot == oracle` to the cent.

## Run

```bash
cd qa-workspace/automation
npm install
npx playwright install            # browsers (only needed for browser specs)

npm run test:oracle               # ✅ runs now — validates the oracle (no app)
npm run typecheck                 # tsc --noEmit

# once an app is available:
cp .env.example .env              # fill BASE_URL + role credentials
npm test                          # full suite
npm run test:p1                   # P1 only
npm run test:smoke                # smoke
npm run test:security             # @security
```

## Conventions

- **Tags:** `@smoke @p1 @calc @security @regression @gap`.
- **No arbitrary waits** — web-first assertions / auto-waiting only.
- **Selectors:** prefer `getByRole` / `getByLabel` / `data-testid`. Placeholders are marked; request
  `data-testid`s from the app team and centralise them in the relevant Page Object.
- **Calculations** are verified at API/snapshot level (precise), not by scraping UI text.
- **Evidence** (traces/video/screenshots) → `../evidence/`; HTML report → `../reports/playwright-html`.

## What's needed to go from scaffold → execution

See `../reports/00-engagement-status.md`: app URL, role credentials (Admin/Manager/Staff), a safe
seeded non-prod environment, and confirmation the live statutory seed matches PRD §24
(`TC-TAX-001…003` gate the calculation waves).
