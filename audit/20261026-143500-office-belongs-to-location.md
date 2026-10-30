# Audit: Offices belong to locations (inverted relationship)

**Date**: 2026-10-26 14:35
**Task**: Invert the office/location link so an office belongs to a location (e.g. MB First Floor holds ICS, IHS, ICJE, ITE, Tech Voc Office) instead of a location belonging to an office.

## Files Changed
| File | Changes |
|------|---------|
| backend/database/migrations/2026_10_26_000003_move_office_to_location.php | New — drops `locations.office_id`, adds `offices.location_id` nullable FK `nullOnDelete` |
| backend/app/Models/Office.php | Added `location_id` fillable + `location()` belongsTo |
| backend/app/Models/Location.php | Replaced `office()` belongsTo with `offices()` hasMany; removed `office_id` fillable |
| backend/app/Admin/Offices/Resources/OfficeResource.php | Added `location_id` + nested `location` |
| backend/app/Admin/Offices/Requests/StoreOfficeRequest.php | Added `location_id` nullable exists rule |
| backend/app/Admin/Offices/Requests/UpdateOfficeRequest.php | Same |
| backend/app/Admin/Offices/Controllers/OfficeController.php | `index` eager-loads `location` + accepts `location_id` filter; store/update return location |
| backend/app/Admin/Locations/Resources/LocationResource.php | Replaced single `office` with `offices[]` ({id,name}, ordered) |
| backend/app/Admin/Locations/Controllers/LocationController.php | Eager-loads `offices`; dropped `office_id` filter/validation; store/update load `offices` |
| backend/app/Admin/Locations/Requests/StoreLocationRequest.php | Removed `office_id` rule |
| backend/app/Admin/Locations/Requests/UpdateLocationRequest.php | Same |
| backend/database/seeders/Locations/LocationSeeder.php | Assigns each seeded office to its location (Admin→Admin Building, Education→Library, Business→Canteen, Affairs→Covered Court) |
| backend/tests/Feature/Locations/LocationManagementTest.php | Replaced office-filter test with offices-in-location test; updated structure/create/validation tests |
| backend/tests/Feature/Offices/OfficeManagementTest.php | Added location filter + create-with-location tests; resource structure asserts `location_id`/`location` |
| frontend/src/admin/locations/types.ts | `office_id`/`office` → `offices: {id,name}[]`; dropped office form fields |
| frontend/src/admin/locations/api.ts | Removed `office_id` param |
| frontend/src/admin/locations/index.tsx | Removed office filter + office select plumbing |
| frontend/src/admin/locations/components/LocationsToolbar.tsx | Search only (dropped office dropdown) |
| frontend/src/admin/locations/components/LocationsTable.tsx | Office column → Offices badges column; colSpan 5 still correct |
| frontend/src/admin/locations/components/LocationFormDialog.tsx | Removed office select |
| frontend/src/admin/offices/types.ts | Added `location_id`, `location`, `LocationOption`; query gains `locationId` |
| frontend/src/admin/offices/api.ts | Sends `location_id`; added `getLocations()` for selects |
| frontend/src/admin/offices/components/OfficesToolbar.tsx | Added location filter dropdown |
| frontend/src/admin/offices/components/OfficesTable.tsx | Added Location column; colSpan 4→5 |
| frontend/src/admin/offices/components/OfficeFormDialog.tsx | Added location select |
| frontend/src/admin/offices/index.tsx | Wires location filter + locations list into toolbar/table/form |
| README.md | Offices API (location_id/location) + Locations API (offices array, office filter removed) |
| AGENTS.md | Locations module bullet updated |

## Summary
The relationship is now `offices.location_id → locations.id` (nullable, nullOnDelete). A location page shows the offices it holds as badges (e.g. Library → College of Education); the offices page gained a location filter column and a location picker in the form. Deleting a location no longer touches offices; deleting an office never touches locations.

Verified: `php artisan test` → **60 passed (234 assertions)** including updated location/office tests; live API round trip (migrate → seed assigns offices → list shows nested offices); `npm run build` ✓ and `npm run lint` clean; browser screenshots at 1440px confirm offices badges on locations and location names + filter on offices.

## Notes
- Dev DB needed the new migration + reseed so seeded offices attach to locations; fresh clones get it via `migrate --seed`.
- The `RoleModule` office/location reuse and user office links are unchanged (users still belong to offices).
- Mock data in `mockData.ts` still uses the old `officeId`-on-location shape for non-API screens; harmless until those screens go server-driven.
