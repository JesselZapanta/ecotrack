# Audit: Status action button + allow updating regardless of current status

**Date**: 2026-10-26 22:35
**Task**: Change the action button to "Update status", and allow updating status regardless of current status.

## Files Changed
### Backend
| File | Changes |
|------|---------|
| `backend/app/Admin/Schedules/Controllers/ScheduleController.php` | `allowedMaintenanceTransitions()` now returns all `STATUSES` for any source status (no transition restrictions) |

### Frontend
| File | Changes |
|------|---------|
| `frontend/src/admin/schedules/components/StatusUpdateDialog.tsx` | Removed `MAINTENANCE_TRANSITIONS` map and `isAdmin` prop; options = all statuses except the current one, for both admin and maintenance |
| `frontend/src/admin/schedules/components/SchedulesTable.tsx` | Button label "Status" → "Update status" (desktop + mobile) |
| `frontend/src/maintenance/route/index.tsx` | All-stops button "Update" → "Update status"; next-stop primary button now "Update status" opening the dialog (covers every status); removed unused `markCollected` |
| `frontend/src/admin/schedules/index.tsx` | Removed `isAdmin` prop from `StatusUpdateDialog` usage |
| `frontend/src/maintenance/route/index.tsx` | Removed `isAdmin` prop from `StatusUpdateDialog` usage |

## Summary

The action button is now labelled "Update status" everywhere, and the status dialog offers every status except the current one — so a run can move from any status to any other (e.g. Collected → Scheduled) without transition restrictions. Maintenance is still limited to their own assigned runs (authorization unchanged).

**Verification**
- `php artisan test` → 75 passed (321 assertions)
- `npm run build` ✓ · `npm run lint` clean
- Browser: Collected row's dialog offered Scheduled/Missed/Cancelled (switching back to Scheduled allowed)

## Notes
- Admin already had no transition restrictions; this change extends the same freedom to maintenance.
- Authorization (assigned-only for maintenance) is unchanged.
- The backend `status === current` guard still returns 422 "already X" to avoid no-op writes.
