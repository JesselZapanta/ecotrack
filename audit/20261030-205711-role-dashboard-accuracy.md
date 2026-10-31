# Audit: Maintenance and office dashboard accuracy

**Date**: 2026-10-30 20:57
**Task**: Check the data on `/maintenance/dashboard` and `/office/dashboard`.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/maintenance/route/index.tsx` | Today's route now loads **all** of today's runs (not only Scheduled/Missed), uses a local date instead of UTC, computes the real collected count, shows total missed, and enforces an "Other" detail in the missed dialog |
| `frontend/src/office/dashboard/index.tsx` | Rewritten to use the office-scoped report summary for month totals/collections/waste mix, upcoming schedules and recent records with the real record total |

## Summary

### Maintenance (`/maintenance/dashboard` → `src/maintenance/route/`)
- Previously fetched all schedules, filtered to Scheduled/Missed, then today — **Collected runs were excluded** and `RouteStrip` always showed `0 collected`.
- Now loads today's runs with `date=today` (all statuses) plus all missed runs separately.
- Subtitle: **2 runs · 1 collected · 2 missed total**; route strip **1/2 (50%)**; all stops show the Collected + Missed runs.
- `Next stop` only appears for a Scheduled run today (none today).
- "Other" missed reason now requires detail text (separate chip reason + detail field).
- Today's date uses the local date, not `toISOString()` (UTC).

### Office (`/office/dashboard`)
- Previously fetched up to 100 schedules/records for all time and computed counts client-side — misleading "this week/upcoming" labels and undercounts beyond 100 rows.
- Now uses the **office-scoped report** for the current month:
  - Stat tiles: Scheduled / Collected / Missed / Waste logged — all **this month**
  - Waste by category from the report (accurate totals)
  - Upcoming schedules: `status=Scheduled`, `date_from=today`, 6 rows
  - Recent records: 6 latest, with the real `meta.total` count

## Accuracy check (30 Oct 2026)

| Dashboard | API | UI |
|---|---|---|
| **Maintenance** (Ben) | 2 runs today (1 Missed, 1 Collected); 2 missed total | **2 runs · 1 collected · 2 missed total**; route 1/2 50% ✓ |
| **Office** (educ, Oct) | Scheduled 1 · Collected 0 · Missed 2 · 0.0 kg; 1 upcoming; 0 records | **1 / 0 / 2 / 0.0 kg**; 1 upcoming; 0 records ✓ |

**Verification**
- Browser (Ben): 2 runs, 1 collected, 2 missed; missed section 2; all stops 2; no "Next stop" card (nothing scheduled today)
- Browser (educ): Scheduled 1, Collected 0, Missed 2, Waste 0.0 kg, upcoming Oct 31, no records
- Mobile 375px: **0** horizontal overflow, no console errors
- `php artisan test` → **110 passed** (554 assertions)
- `npm run build` ✓ · `npm run lint` clean

## Notes
- Maintenance's missed section is all missed runs assigned to the crew (not period-limited), labelled "missed total".
- Office stats are month-based; the report endpoint is already forced to the office's location.
- No backend changes.
