# Audit: Locations module (same pattern as Users/Categories/Offices)

**Date**: 2026-10-26 13:50
**Task**: Implement the locations module at `/locations` mirroring the users, categories and offices modules — server-side search, filter and pagination.

## Files Changed
| File | Changes |
|------|---------|
| backend/database/migrations/2026_10_26_000002_create_locations_table.php | New — `locations` (name, building, floor_or_area nullable, office_id nullable FK nullOnDelete) |
| backend/app/Models/Location.php | New — fillable, `office()` belongsTo |
| backend/app/Admin/Locations/Resources/LocationResource.php | New — id, name, building, floor_or_area, office_id, office {id,name}, created_at |
| backend/app/Admin/Locations/Requests/StoreLocationRequest.php | New — name/building required, floor/area optional, office_id exists |
| backend/app/Admin/Locations/Requests/UpdateLocationRequest.php | New — sometimes/required variants |
| backend/app/Admin/Locations/Controllers/LocationController.php | New — index (search name/building/floor, office_id, sort id/name/created_at, paginate), store, update, destroy |
| backend/routes/api/admin.php | Added `GET/POST /locations`, `PATCH/DELETE /locations/{location}` (admin-only) |
| backend/database/seeders/Locations/LocationSeeder.php | New — 6 TCGC locations linked to seeded offices |
| backend/database/seeders/DatabaseSeeder.php | Registers LocationSeeder |
| backend/tests/Feature/Locations/LocationManagementTest.php | New — 11 tests (pagination meta, search name/building/floor, office filter, sort, non-admin 403, create, validation, update, delete) |
| frontend/src/admin/locations/types.ts | New — ApiLocation, Meta, SortColumn, form/payload/query types |
| frontend/src/admin/locations/api.ts | New — get/create/update/delete + apiMessage |
| frontend/src/admin/locations/components/LocationsToolbar.tsx | New — search + office filter + spinner + clear |
| frontend/src/admin/locations/components/LocationsTable.tsx | New — sortable ID/Location columns, building, floor/area, office, pagination, skeletons, loading bar, confirm-ready actions |
| frontend/src/admin/locations/components/LocationFormDialog.tsx | New — name/building/floor/office form |
| frontend/src/admin/locations/index.tsx | Rewritten — server-driven list mirroring the other modules (debounced search, office filter, sort, pagination, loading, error+retry, create/edit dialog, delete ConfirmDialog) |
| README.md | Added Locations API section |
| AGENTS.md | Structure + Locations module bullet |

## Summary
Locations is now fully server-driven with the same UX as Users/Categories/Offices: debounced server search (name/building/floor-or-area), office filter, sortable ID/Location columns defaulting to id/desc, server-side pagination with meta footer, skeleton rows + loading bar + search spinner on every fetch, create/edit dialog with validation, delete behind `ConfirmDialog`. The office filter and form select reuse `getOffices` from the users module. Deleting a location is safe (no backend FKs point at it yet).

Verified: `php artisan test` → **58 passed (234 assertions)** including 11 new location tests; live API CRUD round trip (list 6 seeded → create → search → delete); `npm run build` ✓ and `npm run lint` clean; browser screenshots at 1440px confirm loading skeleton, loaded table (ids 6→1), and add dialog.

## Notes
- Other screens (records, schedules, dashboard) still read locations from mock data; only the Locations page is API-driven.
- Records/schedules frontends still need their backend modules before location data can be shared from one source.
