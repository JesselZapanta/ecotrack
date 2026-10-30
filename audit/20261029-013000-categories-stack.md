# Audit: Categories column stacks when multiple

**Date**: 2026-10-29 01:30
**Task**: In the schedules table, stack categories vertically when a schedule has multiple.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/admin/schedules/components/SchedulesTable.tsx` | `CategoryDots` changed from inline wrap (`inline-flex flex-wrap`) to vertical stack (`flex flex-col items-start gap-1`); labels keep `whitespace-nowrap` |

## Summary

Multiple categories now render one per line in the Categories column (and mobile cards) instead of flowing inline. Single-category rows look unchanged.

**Verification**
- `npm run build` ✓ · `npm run lint` clean
- Browser: category containers compute `flex-direction: column`

## Notes
- The stacked layout keeps long names (e.g. "Non-biodegradable") on their own line without wrapping mid-word.
