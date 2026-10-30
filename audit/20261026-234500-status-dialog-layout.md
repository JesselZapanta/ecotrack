# Audit: Status dialog — 1 row per status, colored, remarks last

**Date**: 2026-10-26 23:45
**Task**: Update the maintenance "Update collection status" dialog: status as 1 row per status with different colors; remarks as the last input.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/admin/schedules/components/StatusUpdateDialog.tsx` | Status buttons now stack in a single column (`grid-cols-1`) with per-status colors (Scheduled=info, Collected=ok, Missed=alarm, Cancelled=muted); KG input moved before the remark textarea so remarks is the last form field |

## Summary

The status picker now shows one status per row, each with its own color, and the remarks textarea is the final input (after the estimated-kg field, which only appears for `Collected`).

**Verification**
- `npm run build` ✓ · `npm run lint` clean
- Browser: 3 stacked status buttons (full width), KG input above remark confirmed

## Notes
- Per-status colors follow the existing `StatusTag` tone palette for consistency.
- The KG input only renders when `Collected` is selected.
