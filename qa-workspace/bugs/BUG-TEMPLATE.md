# BUG-<nnn> — <short title>

> Copy this file to `BUG-001.md`, `BUG-002.md`, … one per defect (Phase 9).
> A PRD §25 item NOT behaving as its documented gap is a **doc/UX note**, not a functional bug —
> log those with `type: gap-note` instead of a severity.

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-<nnn> |
| **Title** | <concise summary> |
| **Requirement Ref** | REQ-<MODULE>-<nnn> |
| **Test Case Ref** | TC-<MODULE>-<nnn> |
| **PRD Section** | §<n> |
| **Module** | <module> |
| **Severity** | Critical / High / Medium / Low |
| **Priority** | P1 / P2 / P3 / P4 |
| **Environment** | <url / build / browser / role / date> |
| **Status** | Open / Fixed / Verified / Won't-fix |

## Preconditions
<state required before reproduction>

## Steps to Reproduce
1.
2.
3.

## Expected Behaviour (per PRD)
<what the PRD §… says should happen — quote it>

## Actual Behaviour
<what actually happened>

## Evidence
- Screenshot: `../evidence/screenshots/BUG-<nnn>-*.png`
- Trace: `../evidence/traces/BUG-<nnn>.zip`
- Video: `../evidence/videos/BUG-<nnn>.webm`
- Console: `../evidence/console/BUG-<nnn>.log`
- Network: `../evidence/network/BUG-<nnn>.har`
- Oracle vs engine (for calc bugs): expected `<oracle value>` vs actual `<engine value>`, diff `<…>`

## Possible Root Cause
<hypothesis>

## Suggested Fix
<recommendation>
