# Audit: Default sort id desc on users, categories, offices

**Date**: 2026-10-26 12:35
**Task**: Change the default sorting to id desc on the users, categories and offices tables.

## Files Changed
| File | Changes |
|------|---------|
| backend/app/Admin/Users/Controllers/UserController.php | Default sort `name/asc` → `id/desc`; `id` added to allowed `sort` values |
| backend/app/Admin/Categories/Controllers/CategoryController.php | Same change |
| backend/app/Admin/Offices/Controllers/OfficeController.php | Same change |
| frontend/src/admin/user/types.ts | `SortColumn` now includes `"id"` |
| frontend/src/admin/categories/types.ts | Same |
| frontend/src/admin/offices/types.ts | Same |
| frontend/src/admin/user/index.tsx | Initial `sort`/`direction` → `id`/`desc` |
| frontend/src/admin/categories/index.tsx | Same |
| frontend/src/admin/offices/index.tsx | Same |
| README.md | Sort columns documented with `(default id)` |

## Summary
All three tables now load newest-first by default on both sides: the API falls back to `orderBy('id', 'desc')` when no sort is given (and accepts `sort=id`), and each page initializes its sort state to `id`/`desc`. Clicking a column header still switches to that column ascending, then toggles — unchanged behavior.

Verified: `php artisan test` → **47 passed (185 assertions)**; `npm run build` ✓ and `npm run lint` clean; live `GET /api/users`, `/api/categories`, `/api/offices` with no params all return ids in descending order (5,4,3,2,1 / 4,3,2,1 / 4,3,2,1).

## Notes
- No new migration, seeder or test needed — existing sort tests pass explicit params and are unaffected.
- No header shows an active arrow on first load (there is no ID column); the first header click behaves as before.
