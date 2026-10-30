# Audit: Offices require a location (schema + seeder)

**Date**: 2026-10-29 00:00
**Task**: Update the offices schema and seeder — an office belongs to a location (required).

## Files Changed
### Backend
| File | Changes |
|------|---------|
| `backend/database/migrations/2026_10_26_000002_create_locations_table.php` | `offices.location_id` now **NOT NULL** with `restrictOnDelete()` |
| `backend/database/seeders/Locations/LocationSeeder.php` | Now only creates locations (office assignment moved out) |
| `backend/database/seeders/Offices/OfficeSeeder.php` | Assigns each office its location (`Administration → Admin Building`, `College of Education → Library`, `College of Business → Canteen`, `Student Affairs → Covered Court`) |
| `backend/database/seeders/DatabaseSeeder.php` | Order: LocationSeeder → OfficeSeeder → UserSeeder → … |
| `backend/app/Admin/Offices/Requests/StoreOfficeRequest.php` | `location_id` required |
| `backend/app/Admin/Offices/Requests/UpdateOfficeRequest.php` | `location_id` sometimes+required |

### Tests
| File | Changes |
|------|---------|
| `backend/tests/Feature/Offices/OfficeManagementTest.php` | Creates a base location; all offices get `location_id`; added "requires a location" test |
| `backend/tests/Feature/{Auth,Categories,Users,Locations,Schedules}/*Test.php` | Base location created before the office |

### Frontend
| File | Changes |
|------|---------|
| `frontend/src/admin/offices/components/OfficeFormDialog.tsx` | Location is required (no "No location" option); validates before submit; description updated |

## Summary

An office must now belong to a location at the database level (`location_id` NOT NULL, FK to `locations`). The seeder creates locations first, then offices with their location, then users. The office form requires a location selection.

**Verification**
- `SHOW CREATE TABLE offices` → `location_id` NOT NULL, FK `offices_location_id_foreign`
- `php artisan migrate:fresh --seed` ✓ — offices: Administration→Admin Building, Education→Library, Business→Canteen, Student Affairs→Covered Court
- `php artisan test` → 76 passed (324 assertions)
- `npm run build` ✓ · `npm run lint` clean
- Browser: office form shows required "Location" select (no "No location")

## Notes
- Deleting a location is now restricted while offices reference it.
- `users.office_id` remains nullable (maintenance crew may not belong to an office).
