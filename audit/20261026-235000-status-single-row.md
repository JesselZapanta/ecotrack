# Audit: Status buttons on a single row

**Date**: 2026-10-26 23:50
**Task**: Status buttons should be on 1 row only (not stacked).

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/admin/schedules/components/StatusUpdateDialog.tsx` | Status grid changed from `grid-cols-1` to `grid-cols-3` |

## Summary
Status options now render on a single row at all breakpoints (3 columns), with per-status colors retained.

**Verification**
- `npm run build` ✓ · `npm run lint` clean
- Browser: 3 buttons, 1 distinct y-row at both 1440px and 375px

## Notes
- With 4 possible statuses (when current is excluded leaves 3), 3 columns fit. If all 4 ever show, the grid would wrap.
