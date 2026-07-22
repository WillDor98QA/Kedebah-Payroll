/**
 * permissions.spec.ts — the security boundary is the API, not the UI. PRD §2.
 * Traces: REQ-AUTH-010, REQ-SEC-001/006/009, TC-SEC-006/014.
 *
 * These require Manager / Staff credentials, which are not provided yet → tests self-skip and the
 * dependent cases are recorded BLOCKED in the Test Execution Report (never failed or fabricated).
 */

import { test, expect } from '@playwright/test';
import { existsSync } from 'node:fs';
import { isAppConfigured, hasRole } from '../../config/env.js';
import { ApiClient } from '../../helpers/api-client.js';

test.describe('API authorization @p1 @security (PRD §2)', () => {
  test('TC-SEC-006 Manager cannot edit a bank via API even when UI hides it', async () => {
    test.skip(!isAppConfigured || !hasRole('manager') || !existsSync('fixtures/.auth/manager.json'), 'Manager credentials not provided — BLOCKED.');
    const mgr = await ApiClient.fromState('fixtures/.auth/manager.json');
    await mgr.expectForbidden('put', '/banks/1', { name: 'Hacked Bank' }); // confirm real bank-edit path
    await mgr.dispose();
  });

  test('TC-SEC-014 staff cannot read another employee payslip (IDOR)', async () => {
    test.skip(!isAppConfigured || !hasRole('staff') || !existsSync('fixtures/.auth/staff.json'), 'Staff credentials not provided — BLOCKED.');
    const staff = await ApiClient.fromState('fixtures/.auth/staff.json');
    const res = await staff.get('/my/payslips/999999'); // foreign payslip id
    expect([401, 403, 404]).toContain(res.status());
    await staff.dispose();
  });
});
