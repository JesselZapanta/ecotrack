# Audit: Categories reduced to 3 (Biodegradable, Non-biodegradable, Recyclable)

**Date**: 2026-10-29 00:30
**Task**: Update the categories to exactly 3 — Biodegradable, Non-biodegradable, Recyclable — and run `migrate:fresh --seed`.

## Files Changed
| File | Changes |
|------|---------|
| `backend/database/seeders/Categories/CategorySeeder.php` | 3 categories only: Biodegradable (`#2E7D4F`), Non-biodegradable (`#2A2D2B`), Recyclable (`#E3A908`) |
| `backend/database/seeders/Schedules/ScheduleSeeder.php` | `Residual`/`Hazardous` references replaced with `Non-biodegradable` |
| `frontend/src/lib/mockData.ts` | `wasteCategories` reduced to 3 (c1 Biodegradable, c2 Recyclable, c3 Non-biodegradable); removed c4 Hazardous; `slug` union updated; mock records referencing c4 remapped to c3 |

## Summary

The category set is now exactly three. Schedules that used Residual/Hazardous now use Non-biodegradable. The mock category list used by `CategoryChip`/`LidCard`/mock screens matches the seeded set.

**Verification**
- `php artisan migrate:fresh --seed` ✓
- API: `GET /api/categories` → `total=3` (Biodegradable, Non-biodegradable, Recyclable)
- `php artisan test` → 76 passed (324 assertions)
- `npm run build` ✓ · `npm run lint` clean
- Browser: Categories page shows "3 categories"; Schedules page loads with the new categories

## Notes
- Existing schedules/records that referenced removed categories were reseeded; a live DB with old data would need remapping.
- Color for Non-biodegradable reuses the old Residual dark tone (`#2A2D2B`).
