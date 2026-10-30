# Audit: One migration per table

**Date**: 2026-10-29 00:10
**Task**: Update the migrations — one migration per table, remove the others, run `migrate:fresh --seed`.

## Files Changed
### Deleted
- `0001_01_01_000000_create_users_table.php` (multi-table)
- `0001_01_01_000001_create_cache_table.php` (cache + cache_locks)
- `0001_01_01_000002_create_jobs_table.php` (jobs + job_batches + failed_jobs)
- `2026_10_25_000001_create_offices_table.php`
- `2026_10_25_000002_add_auth_fields_to_users_table.php`
- `2026_10_26_000002_create_locations_table.php` (created locations + altered offices)
- `2026_10_26_000004_create_schedules_tables.php` (4 tables)

### Added (one table each)
| Migration | Table |
|---|---|
| `0001_01_01_000000_create_locations_table.php` | locations |
| `0001_01_01_000001_create_offices_table.php` | offices (location_id NOT NULL FK) |
| `0001_01_01_000002_create_users_table.php` | users (auth fields + office_id FK) |
| `0001_01_01_000003_create_password_reset_tokens_table.php` | password_reset_tokens |
| `0001_01_01_000004_create_sessions_table.php` | sessions |
| `0001_01_01_000005_create_cache_table.php` | cache |
| `0001_01_01_000006_create_cache_locks_table.php` | cache_locks |
| `0001_01_01_000007_create_jobs_table.php` | jobs |
| `0001_01_01_000008_create_job_batches_table.php` | job_batches |
| `0001_01_01_000009_create_failed_jobs_table.php` | failed_jobs |
| `2026_10_26_000001_create_waste_categories_table.php` | waste_categories (kept) |
| `2026_10_26_000002_create_collection_schedules_table.php` | collection_schedules |
| `2026_10_26_000003_create_schedule_location_table.php` | schedule_location |
| `2026_10_26_000004_create_schedule_category_table.php` | schedule_category |
| `2026_10_26_000005_create_status_histories_table.php` | status_histories |
| `2026_10_27_000001_create_waste_records_table.php` | waste_records (kept) |

## Summary

Every table now has exactly one create migration. The order reflects dependencies: locations → offices → users → framework tables → categories → schedules/pivots/history → waste records. The users auth fields and the offices location FK are defined directly in their create migrations (no alter migrations).

**Verification**
- `php artisan migrate:fresh --seed` ✓ — 16 tables created + all seeders ran
- `php artisan test` → 76 passed (324 assertions)
- `npm run build` ✓ · `npm run lint` clean

## Notes
- `users.office_id` remains nullable (maintenance crew may not belong to an office); `offices.location_id` is required.
- Framework tables were split too, so no migration creates more than one table.
