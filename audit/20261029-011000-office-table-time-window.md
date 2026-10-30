# Audit: Office schedules table — hide location, rename Window to Time window

**Date**: 2026-10-29 01:10
**Task**: On `/office/schedules`, remove the Location column and rename "Window" to "Time window".

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/admin/schedules/components/SchedulesTable.tsx` | Added `showLocations` prop (default true); Locations column renders only when true; header "Window" → "Time window"; column count adapts |
| `frontend/src/admin/schedules/index.tsx` | Passes `showLocations={role !== "office"}` |

## Summary

Office users no longer see the Locations column (redundant — their schedules are already scoped to their office's location). The time column is labelled "Time window". Admin and maintenance keep the Locations column.

**Verification**
- `npm run build` ✓ · `npm run lint` clean
- Browser (educ): headers are `ID | Date | TIME WINDOW | CATEGORIES | ASSIGNEE | Status` (no Locations)

## Notes
- The mobile card still shows the location name as its title (needed for context); only the desktop table column is hidden for office.
