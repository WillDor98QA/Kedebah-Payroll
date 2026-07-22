/**
 * security.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Security/security.md).
 * One named test per documented TC-ID (18 cases). Each dispatches through
 * helpers/case-runner.ts → real assertion via helpers/tc-registry.ts, or skip-with-documented-reason.
 * Do not delete. To implement a skipped case, add/extend its entry in tc-registry.ts.
 */
import { test } from '@playwright/test';
import { existsSync } from 'node:fs';
import { ApiClient } from '../../helpers/api-client.js';
import { isAppConfigured } from '../../config/env.js';
import { runCase } from '../../helpers/case-runner.js';
import * as F from '../../helpers/qa-factory.js';

const STATE = 'fixtures/.auth/admin.json';
let api: ApiClient;
test.beforeAll(async () => {
  test.skip(!isAppConfigured || !existsSync(STATE), 'Admin storage state unavailable (refresh token).');
  api = await ApiClient.fromState(STATE);
  await F.refs(api);
});
test.afterAll(async () => { if (api) { await F.deactivateAll(api); await api.dispose(); } });

test.describe('Security · security (18 cases)', () => {
  test('TC-SEC-001 — API perm matrix — view', async () => { await runCase(api, 'TC-SEC-001'); });
  test('TC-SEC-002 — API perm matrix — create/edit/delete', async () => { await runCase(api, 'TC-SEC-002'); });
  test('TC-SEC-003 — Direct-URL access to forbidden page', async () => { await runCase(api, 'TC-SEC-003'); });
  test('TC-SEC-004 — Expired token rejected', async () => { await runCase(api, 'TC-SEC-004'); });
  test('TC-SEC-005 — Tampered token rejected', async () => { await runCase(api, 'TC-SEC-005'); });
  test('TC-SEC-006 — Manager → bank edit denied (API)', async () => { await runCase(api, 'TC-SEC-006'); });
  test('TC-SEC-007 — Staff → admin API denied', async () => { await runCase(api, 'TC-SEC-007'); });
  test('TC-SEC-008 — SQL injection in inputs', async () => { await runCase(api, 'TC-SEC-008'); });
  test('TC-SEC-009 — Stored XSS', async () => { await runCase(api, 'TC-SEC-009'); });
  test('TC-SEC-010 — Reflected XSS via params', async () => { await runCase(api, 'TC-SEC-010'); });
  test('TC-SEC-011 — Malformed input', async () => { await runCase(api, 'TC-SEC-011'); });
  test('TC-SEC-012 — Duplicate approve', async () => { await runCase(api, 'TC-SEC-012'); });
  test('TC-SEC-013 — Duplicate mark-paid', async () => { await runCase(api, 'TC-SEC-013'); });
  test('TC-SEC-014 — IDOR on self-service payslips', async () => { await runCase(api, 'TC-SEC-014'); });
  test('TC-SEC-015 — Self-service list scope', async () => { await runCase(api, 'TC-SEC-015'); });
  test('TC-SEC-016 — Sensitive masking default', async () => { await runCase(api, 'TC-SEC-016'); });
  test('TC-SEC-017 — Idempotent bank-file export', async () => { await runCase(api, 'TC-SEC-017'); });
  test('TC-SEC-018 — Privilege escalation attempt', async () => { await runCase(api, 'TC-SEC-018'); });
});
