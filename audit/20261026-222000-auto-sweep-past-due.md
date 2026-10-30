# Audit: Auto-sweep past-due schedules to Missed on page open

**Date**: 2026-10-26 22:20
**Task**: When opening the schedules page, automatically check for past-due Scheduled runs and update their status (better than a manual flag).

## Files Changed
### Backend
| File | Changes |
|------|---------|
| `backend/app/Admin/Schedules/Controllers/ScheduleController.php` | Added `sweep()` — marks all past-due `Scheduled` runs (role-scoped) as `Missed` with remark "Auto-marked missed: collection window passed.", writes `status_histories`, returns count + ids |
| `backend/routes/api/schedules.php` | Added `POST /api/schedules/sweep` (auth:api) |

### Frontend
| File | Changes |
|------|---------|
| `frontend/src/admin/schedules/api.ts` | Added `sweepSchedules()` |
| `frontend/src/admin/schedules/index.tsx` | On mount: call `sweepSchedules()`, toast if any swept, then load the list (gated behind `ready`) |

## Summary

Instead of leaving past-due runs as `Scheduled` with a visual flag, the page now sweeps them to `Missed` automatically on open. The sweep is role-scoped (admin sweeps all, maintenance sweeps their own, office is read-only and skipped via 403), writes a status-history entry with a system remark, and toasts the count. The visual "Past due" flag remains as a fallback for runs that haven't been swept yet.

This is the "better way" over manual flagging: the mutation happens once, server-side, with an audit trail, rather than on every read or per-client.

**Verification**
- `php artisan test` → 75 passed (321 assertions)
- `npm run build` ✓ · `npm run lint` clean
- Browser (Ben): opening `/maintenance/schedules` swept the past-due run → it now shows as `Missed`; "Past due" badge gone

## Notes
- A cron-based scheduler (`php artisan schedule:work`) could call the same logic periodically instead of on page open, but the on-open sweep is simpler and sufficient for this app.
- The sweep is best-effort: if it fails (e.g. office role), the list still loads.
- `SYSTEM.md` M4.4 describes auto-flagging as Overdue; implementation now auto-marks Missed instead (Overdue was removed). Spec update recommended.
