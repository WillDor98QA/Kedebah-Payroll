/**
 * beta-approval-workflow-branches.browser.spec.ts — PERMANENT regression asset (documentation + guards).
 *
 * The reject / return / re-approval branches of the active 2-stage Pay Run approval workflow, and the
 * off-cycle-through-workflow path, verified MANUALLY on BETA 2026-09-09 (ledger TC-BETA-APPR-REJECT-001,
 * TC-BETA-APPR-RETURN-001, TC-BETA-APPR-SAFEGUARD-GATE-001, TC-BETA-OFFCYCLE-WORKFLOW-001,
 * TC-BETA-AUDIT-003 / BETA-F-034). Automating them end-to-end needs THREE signed-in personas in one
 * run (submitter → stage-1 approver → stage-2 approver), which the current single-context fixture
 * can't orchestrate. Captured here as `test.fixme` so the behaviour and its evidence are tracked; the
 * live check is the manual ledger entry.
 *
 * Verified behaviour (2026-09-09):
 *   - Reject (stage 1): "Rejection Reason" required; the confirm button stays disabled for an empty
 *     OR whitespace-only reason (trim validation). A real reason -> run returns to Processed.
 *     Reject is NOT gated on acknowledging soft tax-safeguard warnings (only Approve is).
 *   - Return to previous (stage 2+ only — stage 1 has no "Return"): comment OPTIONAL; confirm ->
 *     run stays Pending Approval and control returns to the stage-1 approver. The WORKFLOW STEPS
 *     pipeline still labels stage 1 "approved" while it actually awaits re-approval (UX bug, minor).
 *   - Safeguard gate: the "Approve" button is absent until every soft warning is acknowledged; the
 *     acknowledgement persists across stages.
 *   - Off-cycle runs are fully workflow-compatible (Draft -> Processed -> Pending Approval -> ... ->
 *     Approved -> Paid), surviving a reject and a return on the way.
 *   - BETA-F-034: the Full Audit Log records Rejected + Returned_to_previous + the FINAL Approved +
 *     Paid, but NOT any non-final stage approval — asserted (as failing) in a manual step below.
 */
import { test } from '../../../fixtures/browser.fixture.js';
import { isBetaConfigured } from '../../../config/env.js';

test.describe('BETA · Approval workflow branches (Phase 5)', () => {
  test.skip(!isBetaConfigured, 'BETA_* not configured.');

  test.fixme('TC-BETA-APPR-REJECT-001 — reject requires a non-blank reason; run returns to Processed', async () => {});
  test.fixme('TC-BETA-APPR-RETURN-001 — return-to-previous bounces the run to the stage-1 approver', async () => {});
  test.fixme('TC-BETA-APPR-SAFEGUARD-GATE-001 — Approve hidden until soft warnings acknowledged', async () => {});
  test.fixme('TC-BETA-OFFCYCLE-WORKFLOW-001 — off-cycle run survives reject + return, reaches Paid', async () => {});
  test.fixme('TC-BETA-AUDIT-003 — BETA-F-034: non-final stage approvals are absent from the Full Audit Log', async () => {});
});
