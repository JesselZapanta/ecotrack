# Audit: Default schedule sort by status priority

**Date**: 2026-10-26 21:45
**Task**: The maintenance schedules list order was off — set the default sort to status priority (Missed → Scheduled → Cancelled → Collected).

## Files Changed
| File | Changes |
|------|---------|
| `backend/app/Admin/Schedules/Controllers/ScheduleController.php` | Default sort changed to `status` (asc); added `status` to sort enum; uses `orderByRaw` CASE for priority ordering; secondary sort by `id` |
| `frontend/src/admin/schedules/types.ts` | `SortColumn` now includes `"status"` |
| `frontend/src/admin/schedules/components/SchedulesTable.tsx` | Status column header is now sortable (`SortHead`) |
| `frontend/src/admin/schedules/index.tsx` | Default sort `status` asc |

## Summary

The list now defaults to status priority so items needing attention (Missed, then Scheduled) surface above finished ones (Cancelled, then Collected). The Status column header is clickable to toggle direction, and the other columns (ID, Date) remain sortable.

**Verification**
- `php artisan test` → 75 passed (321 assertions)
- `npm run build` ✓ · `npm run lint` clean
- Browser (Ben): rows ordered Scheduled → Collected (no missed/cancelled assigned to him), matching priority

## Notes
- Priority order: Missed (1) → Scheduled (2) → Cancelled (3) → Collected (4).
- The maintenance "My route" page keeps its chronological (date asc) sort — that's a different screen.
