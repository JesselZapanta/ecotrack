# Audit: Consolidate office/location migration

**Date**: 2026-10-26 23:59
**Task**: Update the migration so the chain is `users belongsTo offices belongsTo location` directly.

## Files Changed
| File | Changes |
|------|---------|
| `backend/database/migrations/2026_10_26_000002_create_locations_table.php` | Creates `locations` without `office_id`, then adds `offices.location_id → locations.id` (nullable, nullOnDelete) |
| `backend/database/migrations/2026_10_26_000003_move_office_to_location.php` | Deleted (merged into the locations migration) |

## Summary

The final schema is now expressed directly:
- `users.office_id` → `offices.id` (unchanged, from `add_auth_fields_to_users_table`)
- `offices.location_id` → `locations.id` (nullable, nullOnDelete)
- `locations` no longer has an `office_id` column

The old intermediate migration that moved the office FK from locations to offices is gone; a fresh `migrate:fresh --seed` produces the same final schema in one step.

**Verification**
- `php artisan migrate:fresh --seed` ✓
- `SHOW CREATE TABLE offices` → `location_id` FK to `locations` (ON DELETE SET NULL)
- `SHOW COLUMNS FROM users` → `office_id` FK (MUL)
- `php artisan test` → 75 passed (321 assertions)
- `npm run build` ✓ · `npm run lint` clean

## Notes
- Migration filename stays `2026_10_26_000002_create_locations_table.php`; the office FK is added there because offices is created earlier (locations must exist first).
- Existing dev DBs keep the correct schema; `migrate:fresh` rebuilds cleanly.
