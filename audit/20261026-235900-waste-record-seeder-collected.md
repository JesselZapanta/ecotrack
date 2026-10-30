# Audit: Waste record seeder — only collected schedules

**Date**: 2026-10-26 23:59
**Task**: Update the seeder so waste records are only created for collected schedules; run `migrate:fresh --seed`.

## Files Changed
| File | Changes |
|------|---------|
| `backend/database/seeders/WasteRecords/WasteRecordSeeder.php` | Rewritten — derives records from `CollectionSchedule` rows with `status = Collected`, links each record via `schedule_id`, uses the schedule's first location/category and its date |

## Summary

Waste records are now only seeded for collected schedules (2 in the current schedule seeder: Library/Recyclable and Science Lab/Hazardous). Each record is linked to its schedule via `schedule_id`, so the data reflects the rule "only collected schedules have waste records".

**Verification**
- `php artisan migrate:fresh --seed` ✓
- API: `total=2` — record 2 (schedule 3, Library, Recyclable, 6.2 kg), record 1 (schedule 7, Science Lab, Hazardous, 12.5 kg)
- `php artisan test` → 75 passed (321 assertions)
- `npm run build` ✓ · `npm run lint` clean

## Notes
- `updateOrCreate` keyed on `schedule_id` makes re-seeding idempotent.
- Quantities are sample values cycled from a small array (no real measurements).
