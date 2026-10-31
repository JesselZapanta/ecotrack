# Audit: Admin dashboard live data

**Date**: 2026-10-30 20:48
**Task**: Check whether the data on `/admin/dashboard` is accurate.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/admin/dashboard/index.tsx` | Rewritten — removed mock data and dead maintenance/office branches; now fetches the report summary and schedules; period filter Today / This week / This month; real stats, route, missed list, waste mix and upcoming table; fixed links |
| `frontend/src/admin/schedules/types.ts` | `SchedulesQuery` supports optional `dateFrom` / `dateTo` |
| `frontend/src/admin/schedules/api.ts` | Sends `date_from` / `date_to` when provided |
| `AGENTS.md` | Documented the server-driven admin dashboard |

## Summary

The admin dashboard was **entirely mock data** — hardcoded `25 October 2026`, fake trends/sparks, mock schedules and links to removed pages (`/admin/collections`, `/admin/report-concern`). It now reads live data:

- **`GET /api/reports/waste-summary`** — total kg, waste mix, collection status counts
- **`GET /api/schedules`** — route stops, missed runs and upcoming scheduled collections

The period selector works: **Today**, **This week** (Mon–Sun) and **This month**. Stats, subtitle, waste mix and route all use the selected period.

## Accuracy check (30 Oct 2026)

| Period | API | Dashboard |
|---|---|---|
| **This month** (Oct 1–31) | 18.7 kg · 8 collections · 2 collected · 3 missed · 0 cancelled | 18.7 kg · **2/8** · **3** missed · **0** cancelled ✓ |
| **Today** (Oct 30) | 6.2 kg · 2 collections · 1 collected · 1 missed | 6.2 kg · **1/2** · **1** missed ✓ |
| **This week** (Oct 26–Nov 1) | 18.7 kg · 8 collections · 2 collected · 3 missed | 18.7 kg · **2/8** · **3** missed ✓ |

Also verified:
- Waste mix matches the report: Non-biodegradable **12.5 kg**, Recyclable **6.2 kg**
- Missed list = 3; upcoming = 3 (Oct 31 schedules)
- "Generate report" → `/admin/reports`; no broken `/admin/collections` link
- Header date is dynamic (`Friday, October 30, 2026`)
- Mobile 375px: **0** horizontal overflow, no console errors
- `php artisan test` → **110 passed** (554 assertions)
- `npm run build` ✓ · `npm run lint` clean

## Notes
- No backend changes; the report and schedules endpoints already existed.
- The route strip uses `getSchedulesForRange` (up to 100 schedules); the numeric counts come from the report so they remain accurate.
- Missed and upcoming lists are separate filtered queries so they stay accurate beyond the first 100 period rows.
- The old maintenance/office branches in this component were dead code (those roles use their own dashboards) and were removed.
