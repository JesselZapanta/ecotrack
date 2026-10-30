# Audit: Location dropdown did not close after selecting

**Date**: 2026-10-26 20:38
**Task**: Fix the location option select in the `/schedules` form — after picking a location the dropdown stayed open.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/admin/schedules/components/MultiSelectField.tsx` | Removed `onSelect={(event) => event.preventDefault()}` from `DropdownMenuCheckboxItem` so the menu closes on selection; converted the raw "Clear selection" `<button>` into `DropdownMenuItem` so it also closes and supports menu keyboard semantics |

## Summary

The dropdown was intentionally kept open between picks by calling `preventDefault()` on every item's `onSelect`. That suppressed Radix's default dismiss behaviour, so the menu never closed — which read as a bug.

Removing that call restores the standard select behaviour: click a location → the menu closes, the trigger updates to that location's name (or `"N selected"` when more than one is chosen). Unchecking a location closes the menu too, and "Clear selection" now uses `DropdownMenuItem`, so it dismisses as well. Multi-location still works — reopening the menu shows the existing checkmarks and adds to the selection.

**Verification**
- `npm run build` ✓ and `npm run lint` clean
- Browser flow (desktop 1440px): open → pick "Library" → menu closed, label `Library`; reopen → pick "Science Lab" → closed, label `2 selected`; reopen → uncheck "Library" → closed, label `Science Lab`; reopen → "Clear selection" → closed, label `Select locations`; the create dialog stayed open throughout
- Mobile 375px and 320px: menu closes after a pick, label updates, `scrollWidth` equals the viewport (no horizontal scroll)

## Notes
- Multi-pick now requires reopening the dropdown per location (standard dropdown behaviour) instead of a single long-lived menu; this was the requested behaviour.
- The dialog itself is not affected — the DropdownMenu is portalled outside the Dialog, so dismissing the menu leaves the form open.
- No other component in `src/` used the `onSelect` `preventDefault` pattern, so this was the only spot with the issue.
