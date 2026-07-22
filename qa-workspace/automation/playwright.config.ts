import { defineConfig, devices } from '@playwright/test';
// env.ts loads .env (via `import 'dotenv/config'`) as its first side effect, so process.env is
// already populated by the time `env` is read here.
import { env } from './config/env.js';

/**
 * Playwright configuration for the Kedebah Payroll QA suite.
 * Evidence (traces/video/screenshots) lands in qa-workspace/evidence/* per the workspace spec.
 * No arbitrary waits — rely on web-first assertions + auto-waiting (Test Strategy §8).
 */
export default defineConfig({
  testDir: './tests',
  outputDir: '../evidence/test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: env.workers,
  timeout: 60_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: '../reports/playwright-html', open: 'never' }],
    ['json', { outputFile: '../reports/playwright-results.json' }],
  ],

  use: {
    baseURL: env.baseURL,
    headless: env.headless,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Pure-logic unit tests (calc oracle) — no browser, run anywhere, no app needed.
    { name: 'unit', testDir: './tests/unit' },

    // Setup project: authenticate each role once, reuse storage state.
    { name: 'setup', testDir: '.', testMatch: /fixtures[\\/]auth\.setup\.ts/ },

    // Live API verification specs — catalogue-driven (*.cases.spec.ts) + legacy (*.live.spec.ts).
    // API-driven (ApiClient), run ONCE (not per-browser).
    {
      name: 'live',
      testMatch: ['**/*.cases.spec.ts', '**/*.live.spec.ts'],
      dependencies: ['setup'],
    },

    // Phase 3 — Browser QA Programme. Authenticated via stored state (post-business-selection),
    // always-on trace/video for exploratory evidence. Specs: tests/browser/*.browser.spec.ts.
    // NOTE: start UNAUTHENTICATED — the SPA keeps the business-account token in memory (not in
    // storageState), so a stored state yields a stale half-auth that drops to login mid-navigation.
    // ensureReady() performs a full fresh login + business selection each test (proven reliable in M0).
    {
      name: 'browser',
      testMatch: ['**/browser/**/*.browser.spec.ts'],
      use: { ...devices['Desktop Chrome'], trace: 'on', video: 'on' },
    },
    {
      name: 'browser-mobile',
      testMatch: ['**/browser/**/*.mobile.spec.ts'],
      use: { ...devices['Pixel 7'], trace: 'on', video: 'on' },
    },

    {
      name: 'chromium',
      testIgnore: ['**/unit/**', '**/*.live.spec.ts', '**/*.cases.spec.ts', '**/browser/**'],
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testIgnore: ['**/unit/**', '**/*.live.spec.ts', '**/*.cases.spec.ts'],
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      testIgnore: ['**/unit/**', '**/*.live.spec.ts', '**/*.cases.spec.ts'],
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
    {
      name: 'mobile',
      testIgnore: ['**/unit/**', '**/*.live.spec.ts', '**/*.cases.spec.ts'],
      use: { ...devices['Pixel 7'] },
      dependencies: ['setup'],
    },
  ],
});
