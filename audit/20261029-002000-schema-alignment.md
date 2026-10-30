# Audit: Align modules with updated schema (office → location)

**Date**: 2026-10-29 00:20
**Task**: Update every module affected by the schema changes (offices require a location; users → offices → location; one migration per table).

## Files Changed
| File | Changes |
|------|---------|
| `backend/app/Admin/Users/Controllers/UserController.php` | Loads `office.location` (index + show/store/update responses) so `UserResource` can return the nested location without N+1 |
| `frontend/src/admin/offices/types.ts` | `ApiOffice.location_id` and `OfficePayload.location_id` are now `number` (required) |
| `frontend/src/admin/user/types.ts` | `ApiUser.office` now includes `location: { id, name } | null` |

(Previously updated in this schema pass: offices migration/requests/form, office seeder, location seeder, DatabaseSeeder order, office layout, schedules subtitle.)

## Summary

All modules now reflect the final schema:
- **Offices**: location is required in schema, requests, seeder, form, and types.
- **Users**: office → location is exposed via `UserResource`; controller eager-loads it.
- **Locations**: `offices[]` relation remains; no `office_id` on locations.
- **Office role**: sidebar + schedules subtitle show the office's location.
- **Schedules / Waste records**: office scoping uses `office.location_id` (unchanged, still valid).

**Verification**
- `php artisan migrate:fresh --seed` ✓
- `php artisan test` → 76 passed (324 assertions)
- `npm run build` ✓ · `npm run lint` clean
- Browser: offices page (5 offices) and users page (5 accounts) load; office layout shows location

## Notes
- `users.office_id` stays nullable (maintenance crew may not belong to an office); `offices.location_id` is required.
