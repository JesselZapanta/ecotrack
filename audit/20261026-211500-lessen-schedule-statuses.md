# Audit: Reduce schedule statuses (drop In Progress and Rescheduled)

**Date**: 2026-10-26 21:15
**Task**: Too many statuses on the schedule column — lessen them. Chosen set: Scheduled, Collected, Missed, Cancelled (+ computed Overdue).

## Files Changed
### Backend
| File | Changes |
|------|---------|
| `backend/app/Models/CollectionSchedule.php` | Removed `STATUS_IN_PROGRESS` and `STATUS_RESCHEDULED` constants; `STATUSES` array now has 4 values; `isOverdue()` checks only `Scheduled` |
| `backend/app/Admin/Schedules/Controllers/ScheduleController.php` | Status filter enum + overdue query constraint updated to the new set |
| `backend/tests/Feature/Schedules/ScheduleManagementTest.php` | Transition test simplified to a single `Scheduled → Collected` step (history count 1); forbidden test uses `Collected` |

### Frontend
| File | Changes |
|------|---------|
| `frontend/src/admin/schedules/types.ts` | `ScheduleStatus` union: removed `In Progress` and `Rescheduled` |
| `frontend/src/admin/schedules/components/StatusUpdateDialog.tsx` | `ADMIN_STATUSES` and `MAINTENANCE_TRANSITIONS` (now `Scheduled → [Collected, Missed, Cancelled]`) |
| `frontend/src/admin/schedules/components/SchedulesToolbar.tsx` | Removed `In Progress` and `Rescheduled` filter options |
| `frontend/src/maintenance/route/index.tsx` | Removed `markInProgress`; next-stop card now offers "Mark as collected" directly for `Scheduled` runs |
| `frontend/src/components/ecotrack/StatusTag.tsx` | Removed `In Progress` and `Rescheduled` tones/union members |
| `frontend/src/components/ecotrack/RouteStrip.tsx` | Removed `In Progress` and `Rescheduled` node styles |
| `frontend/src/lib/mockData.ts` | `ScheduleStatus` type + mock entries updated |
| `frontend/src/admin/collections/index.tsx` | Dropped "In progress" column, live count, and select items |
| `frontend/src/admin/dashboard/index.tsx` | Next-stop logic simplified to `Scheduled → Collected` |
| `frontend/src/admin/collection-detail/index.tsx` | Mock audit entry updated to `Collected` |

## Summary

Schedule lifecycle reduced from 6 stored statuses to 4: **Scheduled → Collected / Missed / Cancelled**, with **Overdue** still computed (not stored). `In Progress` and `Rescheduled` were dropped — a crew now marks a run collected or missed directly, and rescheduling is just creating a new schedule.

Maintenance transitions: `Scheduled → [Collected, Missed, Cancelled]`. Admin can set any of the four directly.

**Verification**
- `php artisan test` → 76 passed (328 assertions)
- `npm run build` ✓ · `npm run lint` clean
- Status dropdown, toolbar filter, maintenance route page, StatusTag and RouteStrip all updated consistently

## Notes
- Waste-record collection statuses (Pending/Collected/etc.) in `records` and `StatusTag` are untouched — only schedule lifecycle was reduced.
- `ScheduleResource` overdue filter now checks `Scheduled` only (was `Scheduled` + `In Progress`).
