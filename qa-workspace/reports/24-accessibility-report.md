# 24 — Accessibility Report (live)

> Phase 3 Browser QA · `@axe-core/playwright` scans on real rendered pages. 2026-06-30. Updated per page explored. Standard: WCAG 2.1 A/AA.

## Method
On each page, after it renders in Chromium, run `new AxeBuilder({ page }).analyze()` and record violations by rule/impact/node-count. Critical/Serious → Findings Register.

## Results so far

### `/dashboard` (App Shell + Dashboard) — 5 violation rules
| Rule | Impact | Nodes | WCAG | Finding |
|---|---|---|---|---|
| `button-name` | **Critical** | 1 | 4.1.2 | BR-001 |
| `link-name` | Serious | 3 | 2.4.4 / 4.1.2 | BR-001 |
| `color-contrast` | Serious | 4 | 1.4.3 | BR-002 |
| `landmark-one-main` | Moderate | 1 | best-practice | BR-003 |
| `region` | Moderate | 1 | best-practice | BR-003 |

### `/settings` — pending full scan (header rendered; cards were still loading at scan time — re-scan after cards populate in M1).

## Themes (early)
- **Icon-only controls without names** is the highest-severity, app-wide issue (top-bar + icon links) — one fix pattern (`aria-label`) resolves the Critical+Serious button/link-name violations globally.
- **Muted-text contrast** likely recurs anywhere secondary/label text is used — design-token fix.
- **Landmark structure** is a shell-level fix (`<main>`).

## Coverage
| Pages a11y-scanned | 1 (dashboard) + settings (partial) |
| Critical | 1 rule | Serious | 2 rules | Moderate | 2 rules |

Keyboard navigation, focus order, and screen-reader label audits are scheduled per-module in M1 (tab-order traversal + focus-trap checks on modals/drawers). No accessibility result is asserted without a captured axe artifact.
