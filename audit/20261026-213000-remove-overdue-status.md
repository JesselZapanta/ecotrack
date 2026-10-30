# Audit: Remove Overdue from schedule statuses

**Date**: 2026-10-26 21:30
**Task**: Remove the Overdue status entirely; update `/maintenance/schedules` for the new status set.

## Files Changed
### Backend
| File | Changes |
|------|---------|
| `backend/app/Models/CollectionSchedule.php` | Removed `isOverdue()` and `displayStatus()` methods |
| `backend/app/Admin/Schedules/Resources/ScheduleResource.php` | Removed `display_status` and `is_overdue` from response |
| `backend/app/Admin/Schedules/Controllers/ScheduleController.php` | Removed `Overdue` from status enum, removed overdue query param, removed `applyOverdueConstraint()` |
| `backend/tests/Feature/Schedules/ScheduleManagementTest.php` | Removed "flags past schedules as overdue" test and `is_overdue`/`display_status` from JSON structure |

### Frontend
| File | Changes |
|------|---------|
| `frontend/src/admin/schedules/types.ts` | Removed `Overdue` from `ScheduleStatus`; `ApiSchedule` no longer has `display_status`/`is_overdue` |
| `frontend/src/admin/schedules/components/SchedulesTable.tsx` | Uses `schedule.status` instead of `display_status` |
| `frontend/src/admin/schedules/components/ScheduleCalendar.tsx` | Uses `entry.status` |
| `frontend/src/admin/schedules/components/StatusUpdateDialog.tsx` | Uses `schedule.status` |
| `frontend/src/admin/schedules/components/SchedulesToolbar.tsx` | Removed `Overdue` filter option |
| `frontend/src/maintenance/route/index.tsx` | Removed `is_overdue` display; uses `schedule.status` |
| `frontend/src/components/ecotrack/StatusTag.tsx` | Removed `Overdue` from union + tones |
| `frontend/src/components/ecotrack/RouteStrip.tsx` | Removed `Overdue` node style |
| `frontend/src/lib/mockData.ts` | Removed `Overdue` from `ScheduleStatus`; s4 status changed to `Missed` |
| `frontend/src/admin/collections/index.tsx` | Removed `Overdue` column and count |
| `frontend/src/admin/dashboard/index.tsx` | Removed overdue const + StatTile (replaced with Cancelled) |
| `frontend/src/admin/reports/index.tsx` | Replaced Overdue metric with Cancelled |

### Docs
| File | Changes |
|------|---------|
| `README.md` | Status list updated; removed Overdue computed note |
| `AGENTS.md` | Schedules bullet updated (no Overdue) |

## Summary

Overdue removed entirely. Schedule `status` is now one of `Scheduled`/`Collected`/`Missed`/`Cancelled` — no computed flags. The API no longer returns `display_status` or `is_overdue`; the frontend renders `status` directly.

**Verification**
- `php artisan test` → 75 passed (321 assertions)
- `npm run build` ✓ · `npm run lint` clean

## Notes
- `SYSTEM.md` still mentions Overdue (M4.4) as spec; implementation no longer follows that. Update spec if adviser agrees.
- Waste-record/records module untouched (its own status lifecycle is separate).
