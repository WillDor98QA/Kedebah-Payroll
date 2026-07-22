# Test Cases — Reports & Exports

**Module:** RPT · **PRD:** §22, §25 · **Reqs:** REQ-RPT-001…011
8 implemented reports, each exportable to PDF **and** Excel. Parse exports to assert content.

## Implemented reports (each: render + PDF export + Excel export + permission)

| TC ID | Req | Report | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|--------|-------|-----------------|-----|-----|------|
| TC-RPT-001 | RPT-001 | Payroll Summary | Open; export PDF + Excel | Gross/net/statutory totals for run/period correct; both files generate | P2 | Medium | API |
| TC-RPT-002 | RPT-002 | Statutory Remittance | Open; export | Amounts due per authority correct (== FORM liabilities) | P2 | High | API |
| TC-RPT-003 | RPT-003 | PAYE Reconciliation | Open; export | Per-employee PAYE vs remitted matches calc | P2 | High | API |
| TC-RPT-004 | RPT-004 | Variance Comparison | Two periods | Period-over-period diffs correct | P3 | Medium | API |
| TC-RPT-005 | RPT-005 | Annual Payroll | Open; export | Full-year per-employee totals correct | P3 | Medium | API |
| TC-RPT-006 | RPT-006 | Year-End Tax | Open; export | Year-end statements generate | P3 | Medium | API |
| TC-RPT-007 | RPT-007 | Audit & Compliance | Filter; export | Action trail filterable + exportable | P2 | Medium | Yes |
| TC-RPT-008 | RPT-008 | Statutory Config Versions | Open; export | Config change history (who/what/when) correct | P2 | Medium | API |

## Cross-cutting + gaps

| TC ID | Req | Scenario | Steps | Expected Result | Pri | Sev | Auto |
|-------|-----|----------|-------|-----------------|-----|-----|------|
| TC-RPT-009 | RPT-001..008 | Export format integrity | Export each report to PDF + Excel | Both formats open + contain expected columns/totals | P2 | Medium | API |
| TC-RPT-010 | RPT-001..008 | Empty/edge data | Run report for period with no data | Graceful empty report (no crash) | P3 | Low | Yes |
| TC-RPT-011 | RPT-001..008 | Permission gating | Non-permitted user | Reports blocked (UI + API) | P2 | Medium | API |
| TC-RPT-012 | RPT-010 | Per-employee detail = calc | Open employee detail on a run | Matches calculation (band-by-band + Download Payslip) | P2 | Medium | Yes |
| TC-RPT-013 | RPT-009 | **Gap: Payslips not a report** | Reports Centre | Look for Payslips export | Not present as a Reports export — matches §22 | P3 | Low | Yes |
| TC-RPT-014 | RPT-011 | **Gap: redirect/unimplemented pages** | Reports menu | Open Payslips / Earnings & Deductions / Cost Center / Analytics | Redirect to Reports Centre / unimplemented — matches §25 | P3 | Low | Yes |
| TC-RPT-015 | RPT-011 | **Gap: AI Insights preview** | AI Insights | Open | UI preview, no backend — matches §25 | P3 | Low | Yes |

## Notes
- RPT calc-bearing reports (Remittance, PAYE Reconciliation) cross-check against the oracle and FORM liabilities.
