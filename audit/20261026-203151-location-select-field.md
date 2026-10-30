# Audit: Schedule form location picker → dropdown select

**Date**: 2026-10-26 20:31
**Task**: In the `/schedules` create/edit form, make the location field an option select instead of inline chips.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/admin/schedules/components/MultiSelectField.tsx` | New — reusable dropdown multi-select matching the `Select` trigger styling (checkboxes, stays open while picking, "N selected" summary, Clear selection) |
| `frontend/src/admin/schedules/components/ScheduleFormDialog.tsx` | Replaced the location chip wall with `MultiSelectField`; added `htmlFor`/`id` for the label |

## Summary

The location field in the schedule form is now a proper dropdown select. Clicking it opens a menu of every location with checkbox rows; the trigger shows the single location name or "N selected", and a "Clear selection" action appears once something is picked. The menu stays open between picks so several locations can be chosen without reopening it.

Multi-location support is preserved — the backend still accepts `location_ids[]`, so editing a schedule that spans two locations keeps both. Waste categories remain as colour-dotted chips, since the dot carries the category colour.

**Verification**
- `npm run build` ✓ and `npm run lint` clean
- Browser: dropdown lists all 6 locations, keeps the menu open after two picks, trigger reads "2 selected", checkmarks render on the chosen rows, "Clear selection" clears them, and Escape closes the menu without closing the dialog
- Mobile 375px: menu flips above the trigger when there isn't room below, stays inside the viewport (`x:25, y:396, w:325, h:226`), and `scrollWidth === 375` (no horizontal scroll)

## Notes
- Built on the existing `DropdownMenu` primitives with `DropdownMenuCheckboxItem` and `onSelect={preventDefault}` so the menu does not dismiss on every toggle — the same portalled-layer pattern already used by `Select` inside dialogs in this app.
- The component is generic (`FilterOption[]`, `selected: number[]`), so the category picker can be switched to the same control later if the chip wall ever gets long.
- Category names seen during verification ("Non-biodegradable", 3 total) reflect live edits made in the Categories module while testing; the seeded "Residual"/"Hazardous" rows were renamed/removed by the user, not by this change.
