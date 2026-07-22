/**
 * paye-engine.spec.ts — PAYE calculation verification against the engine (API-level). PRD §10/§14.
 * Traces: REQ-PAYE-001…009, REQ-CAL-009/012, TC-PAYE-*, TC-CAL-*.
 *
 * PATTERN (the model for all calculation specs): create a known persona → process a run →
 * read the engine's STORED snapshot → assert each figure == oracle output to the cent.
 * Endpoint paths are PLACEHOLDERS; wire to the real API once provided.
 *
 * Self-skips until app + credentials configured.
 */

import { test, expect } from '../../fixtures/roles.fixture.js';
import { isAppConfigured } from '../../config/env.js';
import { paye } from '../../utils/calc-oracle.js';

test.beforeEach(() => {
  test.skip(!isAppConfigured, 'App URL + credentials not configured (engagement blocked).');
});

test.describe('PAYE engine vs oracle @p1 @calc (PRD §10)', () => {
  test('TC-TAX-001 live seed PAYE bands match PRD §24 (gate for calc waves)', async ({ adminApi }) => {
    const res = await adminApi.get('/tax/statutory-items?engine=progressive&code=PAYE'); // placeholder
    expect(res.ok()).toBeTruthy();
    const item = await res.json();
    // Assert the live bands equal the documented seed before trusting the oracle constants.
    // (Shape depends on real API; left as a structural placeholder.)
    expect(item).toBeTruthy();
  });

  test('TC-PAYE-012/CAL-009 chargeable income → PAYE matches oracle', async ({ adminApi }) => {
    // 1. Arrange a persona whose resolved chargeable income is known (e.g. 5000 after reliefs/BIK).
    // 2. Create + process a run via API.
    // 3. Read the per-employee snapshot.
    const expectedChargeable = 5000;
    // const snapshot = await (await adminApi.get(`/pay-runs/${runId}/employees/${empId}`)).json();
    // expect(isMoneyEqual(snapshot.paye, paye(expectedChargeable))).toBeTruthy();
    expect(paye(expectedChargeable)).toBe(848.5); // oracle sanity until wired
    test.info().annotations.push({ type: 'todo', description: 'Wire to real pay-run snapshot endpoint.' });
  });
});
